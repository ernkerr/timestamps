import * as MediaLibrary from 'expo-media-library';
import { exportVideoWithOverlays, type OverlayData } from '../../modules/video-export';
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

function convertOverlayToNative(overlay: OverlayConfig): OverlayData {
  const base: OverlayData = {
    type: overlay.type as any,
    x: overlay.position.x,
    y: overlay.position.y,
    fontSize: overlay.fontSize,
    color: overlay.color,
    backgroundColor: overlay.backgroundColor,
    showSeconds: overlay.showSeconds,
  };

  if (overlay.type === 'elapsed' && overlay.elapsedTimer) {
    base.startTime = overlay.elapsedTimer.startTime;
    base.timelapseSpeed = overlay.elapsedTimer.timelapseSpeed;
  } else if (overlay.type === 'timestamp' && overlay.timestamp) {
    base.realWorldStartTime = overlay.timestamp.realWorldStartTime.getTime();
    base.timelapseSpeed = overlay.timestamp.timelapseSpeed;
    base.format = overlay.timestamp.format;
  } else if (overlay.type === 'text') {
    base.text = overlay.text || overlay.textOverlay?.text || '';
  }

  return base;
}

export async function exportVideo(options: ExportOptions): Promise<ExportResult> {
  const { sourceVideoUri, overlays, quality = 'high' } = options;

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Media library permission not granted' };
    }

    const nativeOverlays = overlays.map(convertOverlayToNative);

    const outputPath = await exportVideoWithOverlays({
      sourceUri: sourceVideoUri,
      overlays: nativeOverlays,
      quality,
    });

    const asset = await MediaLibrary.createAssetAsync(outputPath);

    options.onProgress?.(100);

    return {
      success: true,
      outputUri: asset.uri,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
