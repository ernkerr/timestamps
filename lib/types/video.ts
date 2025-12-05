export interface VideoDimensions {
  width: number;
  height: number;
}

export interface SourceVideo {
  uri: string; // File URI
  duration: number; // Duration in seconds
  dimensions: VideoDimensions;
  fileName?: string; // Optional filename
  fileSize?: number; // Optional file size in bytes
}

export interface ExportSettings {
  codec: 'h264' | 'h265';
  quality: 'low' | 'medium' | 'high';
  outputFileName?: string;
}

export interface ExportState {
  isExporting: boolean;
  progress: number; // 0-100
  outputUri: string | null;
  error: string | null;
}

export interface SavedProject {
  id: string;
  name: string;
  sourceVideoUri: string;
  exportedVideoUri: string;
  thumbnailUri?: string;
  createdAt: Date;
  duration: number;
}

export interface DraftProject {
  id: string;
  name: string;
  sourceVideoUri: string;
  overlays: any[]; // Will be OverlayConfig[] - imported from overlay.ts
  thumbnailUri?: string;
  lastEditedAt: Date;
  createdAt: Date;
  videoDuration: number;
  videoDimensions: VideoDimensions;
}

export type ExportCodec = 'h264' | 'h265';
export type ExportQuality = 'low' | 'medium' | 'high';
