import Foundation
import AVFoundation
import CoreImage
import React

@objc(VideoExport)
class VideoExport: NSObject {
  
  @objc
  func exportVideo(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let sourceUri = options["sourceUri"] as? String,
          let overlays = options["overlays"] as? [[String: Any]],
          let quality = options["quality"] as? String else {
      reject("INVALID_ARGS", "Invalid arguments", nil)
      return
    }

    let url = URL(string: sourceUri.replacingOccurrences(of: "file://", with: "")) ?? URL(fileURLWithPath: sourceUri)
    let asset = AVAsset(url: url)

    guard let videoTrack = asset.tracks(withMediaType: .video).first else {
      reject("NO_VIDEO", "No video track found", nil)
      return
    }

    let composition = AVMutableComposition()
    let videoComposition = AVMutableVideoComposition()

    guard let compositionTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
      reject("TRACK_ERROR", "Failed to create composition track", nil)
      return
    }

    do {
      try compositionTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: videoTrack, at: .zero)
    } catch {
      reject("INSERT_ERROR", error.localizedDescription, error)
      return
    }

    let size = videoTrack.naturalSize
    let renderSize = CGSize(width: size.width, height: size.height)

    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)

    let parentLayer = CALayer()
    let videoLayer = CALayer()
    parentLayer.frame = CGRect(origin: .zero, size: renderSize)
    videoLayer.frame = CGRect(origin: .zero, size: renderSize)
    parentLayer.addSublayer(videoLayer)

    for overlayData in overlays {
      if let textLayer = self.createTextLayer(from: overlayData, videoSize: renderSize, duration: asset.duration) {
        parentLayer.addSublayer(textLayer)
      }
    }

    videoComposition.animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videoLayer, in: parentLayer)

    let instruction = AVMutableVideoCompositionInstruction()
    instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)

    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionTrack)
    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]

    if let audioTrack = asset.tracks(withMediaType: .audio).first,
       let audioCompositionTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
      try? audioCompositionTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: audioTrack, at: .zero)
    }

    let outputURL = FileManager.default.temporaryDirectory.appendingPathComponent("export_\(UUID().uuidString).mp4")

    guard let exporter = AVAssetExportSession(asset: composition, presetName: self.getQualityPreset(quality)) else {
      reject("EXPORTER_ERROR", "Failed to create exporter", nil)
      return
    }

    exporter.outputURL = outputURL
    exporter.outputFileType = .mp4
    exporter.videoComposition = videoComposition

    exporter.exportAsynchronously {
      switch exporter.status {
      case .completed:
        resolve(outputURL.path)
      case .failed:
        reject("EXPORT_FAILED", exporter.error?.localizedDescription ?? "Unknown error", exporter.error)
      case .cancelled:
        reject("EXPORT_CANCELLED", "Export was cancelled", nil)
      default:
        reject("EXPORT_ERROR", "Export failed with status: \(exporter.status.rawValue)", nil)
      }
    }
  }

  @objc
  func getVideoMetadata(_ sourceUri: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let cleanPath = sourceUri.replacingOccurrences(of: "file://", with: "")
    let url = URL(fileURLWithPath: cleanPath)
    
    // Check if file exists
    let fileManager = FileManager.default
    if !fileManager.fileExists(atPath: cleanPath) {
      let errorMsg = "File does not exist at path: \(cleanPath)"
      print("❌ \(errorMsg)")
      reject("FILE_NOT_FOUND", errorMsg, nil)
      return
    }
    
    print("✅ File exists, creating AVAsset...")
    let asset = AVAsset(url: url)
    
    Task {
      do {
        print("⏳ Loading tracks...")
        let tracks = try await asset.loadTracks(withMediaType: .video)
        print("📹 Loaded \(tracks.count) tracks")
        
        guard let track = tracks.first else {
          let errorMsg = "No video track found. File: \(cleanPath), Tracks loaded: \(tracks.count), File exists: \(fileManager.fileExists(atPath: cleanPath))"
          print("❌ \(errorMsg)")
          reject("NO_VIDEO", errorMsg, nil)
          return
        }
        
        print("✅ Found video track!")
        
            var realTimeDuration: Double = 0
            let playbackDuration = CMTimeGetSeconds(asset.duration)
        
            print("📹 Video Metadata Debug:")
            print("  Playback duration: \(playbackDuration) seconds")
            print("  Number of segments: \(track.segments.count)")
        
            // Calculate real duration from segments to handle timelapses
            for (index, segment) in track.segments.enumerated() {
              if segment.isEmpty { 
                print("  Segment \(index): EMPTY")
                continue 
              }
              
              let sourceDuration = CMTimeGetSeconds(segment.timeMapping.source.duration)
              let targetDuration = CMTimeGetSeconds(segment.timeMapping.target.duration)
              
              print("  Segment \(index):")
              print("    Source duration (real time): \(sourceDuration) seconds")
              print("    Target duration (playback): \(targetDuration) seconds")
              
              realTimeDuration += sourceDuration
            }
        
            print("  Total real-time duration: \(realTimeDuration) seconds")
        
            // Fallback if calculation fails or is zero
            if realTimeDuration == 0 {
              print("  ⚠️ Real-time duration is 0, falling back to playback duration")
              realTimeDuration = playbackDuration
            }
        
            let calculatedSpeed = realTimeDuration / playbackDuration
            print("  Calculated timelapse speed: \(calculatedSpeed)x")
        
            // Extract creation date
            var creationDateString: String?
            
            // Try common metadata first
            if let creationDateItem = AVMetadataItem.metadataItems(from: asset.commonMetadata, withKey: AVMetadataKey.commonKeyCreationDate, keySpace: .common).first {
              if let dateValue = creationDateItem.value as? Date {
                let formatter = ISO8601DateFormatter()
                creationDateString = formatter.string(from: dateValue)
              } else if let dateString = creationDateItem.value as? String {
                 creationDateString = dateString
              }
            }
            
            // Try QuickTime metadata if common failed
            if creationDateString == nil {
                let qtMetadata = AVMetadataItem.metadataItems(from: asset.metadata, withKey: "com.apple.quicktime.creationdate", keySpace: .quickTimeUserData)
                if let item = qtMetadata.first, let dateValue = item.value as? Date {
                    let formatter = ISO8601DateFormatter()
                    creationDateString = formatter.string(from: dateValue)
                }
            }
        
            resolve([
              "creationDate": creationDateString as Any,
              "duration": playbackDuration,
              "realTimeDuration": realTimeDuration,
              "isTimelapse": realTimeDuration > (playbackDuration * 1.05)
            ])
      } catch {
        reject("LOAD_ERROR", "Failed to load video: \(error.localizedDescription)", error)
      }
    }
  }

  private func createTextLayer(from data: [String: Any], videoSize: CGSize, duration: CMTime) -> CATextLayer? {
    let type = data["type"] as? String ?? "text"
    let x = (data["x"] as? Double ?? 0.5) * Double(videoSize.width)
    let y = (data["y"] as? Double ?? 0.5) * Double(videoSize.height)
    let fontSize = CGFloat(data["fontSize"] as? Double ?? 24)
    let colorHex = data["color"] as? String ?? "#FFFFFF"
    let bgColorStr = data["backgroundColor"] as? String

    let textLayer = CATextLayer()
    textLayer.fontSize = fontSize
    textLayer.foregroundColor = self.hexToColor(colorHex).cgColor
    textLayer.alignmentMode = .center

    if let bgColor = bgColorStr {
      textLayer.backgroundColor = self.parseRGBA(bgColor).cgColor
    }

    let text: String
    switch type {
    case "elapsed":
      let startTime = data["startTime"] as? Double ?? 0
      let showSeconds = data["showSeconds"] as? Bool ?? true
      text = self.formatElapsedTime(seconds: startTime, showSeconds: showSeconds)
    case "timestamp":
      if let timestamp = data["realWorldStartTime"] as? Double {
        let date = Date(timeIntervalSince1970: timestamp / 1000)
        let format = data["format"] as? String ?? "12h"
        let showSeconds = data["showSeconds"] as? Bool ?? true
        text = self.formatTimestamp(date: date, format: format, showSeconds: showSeconds)
      } else {
        text = "12:00 PM"
      }
    default:
      text = data["text"] as? String ?? ""
    }

    textLayer.string = text
    textLayer.frame = CGRect(x: x - 100, y: videoSize.height - y - fontSize, width: 200, height: fontSize + 10)

    return textLayer
  }

  private func hexToColor(_ hex: String) -> UIColor {
    var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    if hexSanitized.hasPrefix("#") {
      hexSanitized.remove(at: hexSanitized.startIndex)
    }

    var rgb: UInt64 = 0
    Scanner(string: hexSanitized).scanHexInt64(&rgb)

    return UIColor(
      red: CGFloat((rgb & 0xFF0000) >> 16) / 255.0,
      green: CGFloat((rgb & 0x00FF00) >> 8) / 255.0,
      blue: CGFloat(rgb & 0x0000FF) / 255.0,
      alpha: 1.0
    )
  }

  private func parseRGBA(_ rgba: String) -> UIColor {
    let pattern = "rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)"
    guard let regex = try? NSRegularExpression(pattern: pattern),
          let match = regex.firstMatch(in: rgba, range: NSRange(rgba.startIndex..., in: rgba)) else {
      return UIColor.black.withAlphaComponent(0.5)
    }

    let r = CGFloat(Int((rgba as NSString).substring(with: match.range(at: 1))) ?? 0) / 255.0
    let g = CGFloat(Int((rgba as NSString).substring(with: match.range(at: 2))) ?? 0) / 255.0
    let b = CGFloat(Int((rgba as NSString).substring(with: match.range(at: 3))) ?? 0) / 255.0
    let a = match.range(at: 4).location != NSNotFound ? CGFloat(Double((rgba as NSString).substring(with: match.range(at: 4))) ?? 0.5) : 1.0

    return UIColor(red: r, green: g, blue: b, alpha: a)
  }

  private func formatElapsedTime(seconds: Double, showSeconds: Bool) -> String {
    let hours = Int(seconds) / 3600
    let minutes = (Int(seconds) % 3600) / 60
    let secs = Int(seconds) % 60

    if showSeconds {
      return String(format: "%02d:%02d:%02d", hours, minutes, secs)
    } else {
      return String(format: "%02d:%02d", hours, minutes)
    }
  }

  private func formatTimestamp(date: Date, format: String, showSeconds: Bool) -> String {
    let formatter = DateFormatter()

    switch format {
    case "12h":
      formatter.dateFormat = showSeconds ? "h:mm:ss a" : "h:mm a"
    case "24h":
      formatter.dateFormat = showSeconds ? "HH:mm:ss" : "HH:mm"
    case "12h-full":
      formatter.dateFormat = "h:mm:ss a"
    case "24h-full":
      formatter.dateFormat = "HH:mm:ss"
    case "date-time-12h":
      formatter.dateFormat = showSeconds ? "MMM d, h:mm:ss a" : "MMM d, h:mm a"
    case "date-time-24h":
      formatter.dateFormat = showSeconds ? "MMM d, HH:mm:ss" : "MMM d, HH:mm"
    default:
      formatter.dateFormat = "h:mm a"
    }

    return formatter.string(from: date)
  }

  private func getQualityPreset(_ quality: String) -> String {
    switch quality {
    case "low": return AVAssetExportPreset640x480
    case "high": return AVAssetExportPreset1920x1080
    default: return AVAssetExportPreset1280x720
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
