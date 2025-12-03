export type OverlayType = 'elapsed' | 'timestamp' | 'text' | 'none';

export type TimestampFormat =
  | '12h'           // 9:00 AM
  | '24h'           // 09:00
  | '12h-full'      // 9:00:00 AM
  | '24h-full'      // 09:00:00
  | 'date-time-12h' // Jan 1, 9:00 AM
  | 'date-time-24h'; // Jan 1, 09:00

export interface Position {
  x: number; // Percentage-based (0-1)
  y: number; // Percentage-based (0-1)
}

export interface ElapsedTimerConfig {
  startTime: number; // Seconds into video when timer starts (default: 0)
}

export interface TimestampConfig {
  realWorldStartTime: Date; // Actual time when timelapse started (e.g., 9:00 AM)
  timelapseSpeed: number; // Speed multiplier (e.g., 120x means 2 hours shown in 1 minute)
  format: TimestampFormat; // How to display the time
}

export interface TextConfig {
  text: string; // Custom text to display
}

export interface BaseOverlayConfig {
  id: string; // Unique identifier for each overlay
  type: OverlayType;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string; // Hex color (e.g., "#FFFFFF")
  backgroundColor?: string; // Optional background color with alpha (e.g., "rgba(0,0,0,0.5)")
  showSeconds?: boolean; // Whether to show seconds in time display (default: true)
  text?: string; // For text overlay type
}

export interface OverlayConfig extends BaseOverlayConfig {
  // Timer-specific config (only present when type is 'elapsed')
  elapsedTimer?: ElapsedTimerConfig;

  // Timestamp-specific config (only present when type is 'timestamp')
  timestamp?: TimestampConfig;

  // Text-specific config (only present when type is 'text')
  textOverlay?: TextConfig;
}

// Configuration that contains all overlays
export interface VideoOverlayConfig {
  overlays: OverlayConfig[];
}

export interface OverlayPreset {
  id: string;
  name: string;
  config: OverlayConfig;
}
