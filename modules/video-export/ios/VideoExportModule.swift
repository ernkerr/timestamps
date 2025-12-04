import ExpoModulesCore
import AVFoundation
import CoreImage

public class VideoExportModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VideoExport")

    AsyncFunction("exportVideo") { (options: [String: Any], promise: Promise) in
      guard let sourceUri = options["sourceUri"] as? String,
            let overlays = options["overlays"] as? [[String: Any]],
            let quality = options["quality"] as? String else {
        promise.reject("INVALID_ARGS", "Invalid arguments")
        return
      }

      let url = URL(string: sourceUri.replacingOccurrences(of: "file://", with: "")) ?? URL(fileURLWithPath: sourceUri)
      let asset = AVAsset(url: url)

      guard let videoTrack = asset.tracks(withMediaType: .video).first else {
        promise.reject("NO_VIDEO", "No video track found")
        return
      }

      let composition = AVMutableComposition()
      let videoComposition = AVMutableVideoComposition()

      guard let compositionTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
        promise.reject("TRACK_ERROR", "Failed to create composition track")
        return
      }

      do {
        try compositionTrack.insertTimeRange(CMTimeRange(start: .zero, duration: asset.duration), of: videoTrack, at: .zero)
      } catch {
        promise.reject("INSERT_ERROR", error.localizedDescription)
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
        promise.reject("EXPORTER_ERROR", "Failed to create exporter")
        return
      }

      exporter.outputURL = outputURL
      exporter.outputFileType = .mp4
      exporter.videoComposition = videoComposition

      exporter.exportAsynchronously {
        switch exporter.status {
        case .completed:
          promise.resolve(outputURL.path)
        case .failed:
          promise.reject("EXPORT_FAILED", exporter.error?.localizedDescription ?? "Unknown error")
        case .cancelled:
          promise.reject("EXPORT_CANCELLED", "Export was cancelled")
        default:
          promise.reject("EXPORT_ERROR", "Export failed with status: \(exporter.status.rawValue)")
        }
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
}
