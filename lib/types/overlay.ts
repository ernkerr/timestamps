export type OverlayType = 'elapsed' | 'timestamp' | 'text' | 'none';

export type TimestampFormat = 'HH:MM:SS' | 'MM:SS' | 'MM:SS.MS';

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
  type: OverlayType;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string; // Hex color (e.g., "#FFFFFF")
  backgroundColor?: string; // Optional background color with alpha (e.g., "rgba(0,0,0,0.5)")
}

export interface OverlayConfig extends BaseOverlayConfig {
  // Timer-specific config (only present when type is 'elapsed')
  elapsedTimer?: ElapsedTimerConfig;

  // Timestamp-specific config (only present when type is 'timestamp')
  timestamp?: TimestampConfig;

  // Text-specific config (only present when type is 'text')
  textOverlay?: TextConfig;
}

export interface OverlayPreset {
  id: string;
  name: string;
  config: OverlayConfig;
}
