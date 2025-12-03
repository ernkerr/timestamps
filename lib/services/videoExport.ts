import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import type { OverlayConfig } from '../types/overlay';

interface ExportOptions {
  sourceVideoUri: string;
  overlays: OverlayConfig[];
  onProgress?: (progress: number) => void;
  codec?: 'h264' | 'h265';
  quality?: 'low' | 'medium' | 'high';
}

interface ExportResult {
  success: boolean;
  outputUri?: string;
  error?: string;
}

/**
 * Format elapsed time for display
 */
function formatElapsedTime(seconds: number, showSeconds: boolean = true): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (showSeconds) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date, format: string, showSeconds: boolean = true): string {
  const hours12 = date.getHours() % 12 || 12;
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  const timeStr12 = showSeconds
    ? `${hours12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
    : `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  const timeStr24 = showSeconds
    ? `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  switch (format) {
    case '12h':
    case '12h-full':
      return timeStr12;
    case '24h':
    case '24h-full':
      return timeStr24;
    case 'date-time-12h':
      return `${month} ${day}, ${timeStr12}`;
    case 'date-time-24h':
      return `${month} ${day}, ${timeStr24}`;
    default:
      return timeStr12;
  }
}

/**
 * Escape special characters for FFmpeg drawtext filter
 */
function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,');
}

/**
 * Convert hex color to FFmpeg color format
 */
function hexToFFmpegColor(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  return `0x${cleanHex}`;
}

/**
 * Generate FFmpeg drawtext filter for an overlay
 * Note: For dynamic text (time-based), we use text expansion with pts
 */
function generateOverlayFilter(overlay: OverlayConfig, videoWidth: number, videoHeight: number): string {
  const x = Math.floor(overlay.position.x * videoWidth);
  const y = Math.floor(overlay.position.y * videoHeight);
  const fontSize = overlay.fontSize;
  const fontColor = hexToFFmpegColor(overlay.color);

  let filterText = '';
  let boxColor = '';

  // Add background box if specified
  if (overlay.backgroundColor) {
    // Parse rgba background color
    const rgbaMatch = overlay.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      const alpha = a ? Math.floor(parseFloat(a) * 255) : 255;
      boxColor = `box=1:boxcolor=0x${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}@${alpha.toString(16).padStart(2, '0')}:boxborderw=5:`;
    }
  }

  switch (overlay.type) {
    case 'elapsed': {
      if (!overlay.elapsedTimer) break;

      const { startTime } = overlay.elapsedTimer;
      const showSeconds = overlay.showSeconds !== false;

      // For elapsed timer, we need to calculate based on video time
      // This is a static approach - we'll use a simpler text overlay
      // In a real implementation, you'd need frame-by-frame rendering
      const sampleTime = formatElapsedTime(startTime, showSeconds);
      const escapedText = escapeFFmpegText(`Elapsed: ${sampleTime}`);

      filterText = `drawtext=text='${escapedText}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}:${boxColor}`;
      break;
    }

    case 'timestamp': {
      if (!overlay.timestamp) break;

      const { realWorldStartTime, format } = overlay.timestamp;
      const showSeconds = overlay.showSeconds !== false;

      // Similar to elapsed, use static timestamp for now
      const sampleTime = formatTimestamp(new Date(realWorldStartTime), format, showSeconds);
      const escapedText = escapeFFmpegText(sampleTime);

      filterText = `drawtext=text='${escapedText}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}:${boxColor}`;
      break;
    }

    case 'text': {
      const text = overlay.text || overlay.textOverlay?.text || '';
      const escapedText = escapeFFmpegText(text);

      filterText = `drawtext=text='${escapedText}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}:${boxColor}`;
      break;
    }

    default:
      return '';
  }

  return filterText;
}

/**
 * Export video with overlays
 */
export async function exportVideo(options: ExportOptions): Promise<ExportResult> {
  const { sourceVideoUri, overlays, onProgress, codec = 'h264', quality = 'high' } = options;

  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Media library permission not granted' };
    }

    // Default video dimensions (these should ideally come from video metadata)
    // For now, we'll use common dimensions - in production, parse these from FFprobe
    const videoWidth = 1920;
    const videoHeight = 1080;

    // Generate output path using new expo-file-system API
    const outputFileName = `timestamps_export_${Date.now()}.mp4`;
    const outputFile = new File(Paths.cache, outputFileName);
    const outputPath = outputFile.uri;

    // Build filter complex for all overlays
    const filters = overlays
      .map(overlay => generateOverlayFilter(overlay, videoWidth, videoHeight))
      .filter(f => f.length > 0);

    let filterComplex = '';
    if (filters.length > 0) {
      filterComplex = `-filter_complex "${filters.join(',')}"`;
    }

    // Set codec and quality parameters
    const codecParam = codec === 'h265' ? 'libx265' : 'libx264';
    let crfValue = '23'; // Default medium quality
    switch (quality) {
      case 'low':
        crfValue = '28';
        break;
      case 'medium':
        crfValue = '23';
        break;
      case 'high':
        crfValue = '18';
        break;
    }

    // Build FFmpeg command
    const command = [
      '-i', `"${sourceVideoUri}"`,
      filterComplex,
      '-c:v', codecParam,
      '-crf', crfValue,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y',
      `"${outputPath}"`
    ].filter(p => p.length > 0).join(' ');

    console.log('FFmpeg command:', command);

    // Execute FFmpeg
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(outputPath);

      // Clean up temporary file
      if (outputFile.exists) {
        await outputFile.delete();
      }

      onProgress?.(100);

      return {
        success: true,
        outputUri: asset.uri,
      };
    } else {
      const logs = await session.getOutput();
      console.error('FFmpeg failed:', logs);

      return {
        success: false,
        error: 'Video export failed. Check console for details.',
      };
    }
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
