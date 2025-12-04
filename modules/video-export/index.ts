import { NativeModulesProxy } from 'expo-modules-core';

const VideoExportModule = NativeModulesProxy.VideoExport;

export interface OverlayData {
  type: 'elapsed' | 'timestamp' | 'text';
  x: number;
  y: number;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  text?: string;
  startTime?: number;
  timelapseSpeed?: number;
  realWorldStartTime?: number;
  format?: string;
  showSeconds?: boolean;
}

export interface ExportOptions {
  sourceUri: string;
  overlays: OverlayData[];
  quality: 'low' | 'medium' | 'high';
}

export async function exportVideoWithOverlays(options: ExportOptions): Promise<string> {
  return await VideoExportModule.exportVideo(options);
}
