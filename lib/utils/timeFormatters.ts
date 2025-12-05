/**
 * Time formatting utilities for video overlays
 */

/**
 * Formats elapsed time in seconds to HH:MM:SS or MM:SS format
 * @param seconds - Total elapsed seconds
 * @param showHours - Whether to show hours (default: true)
 * @param showMinutes - Whether to show minutes (default: true)
 * @param showSeconds - Whether to show seconds (default: true)
 * @returns Formatted time string (e.g., "3:00:00" or "5:30")
 */
export function formatElapsedTime(
  seconds: number,
  showHours: boolean = true,
  showMinutes: boolean = true,
  showSeconds: boolean = true
): string {
  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const parts: string[] = [];
  
  if (showHours) {
    parts.push(hours.toString());
  }
  
  if (showMinutes) {
    parts.push(showHours ? pad(minutes) : minutes.toString());
  }
  
  if (showSeconds) {
    parts.push((showHours || showMinutes) ? pad(secs) : secs.toString());
  }

  return parts.length > 0 ? parts.join(':') : '0';
}

/**
 * Calculates the real-world time for a given video timestamp
 * accounting for timelapse speed
 * @param videoTimestamp - Current position in video (seconds)
 * @param realWorldStartTime - Actual time when timelapse started
 * @param timelapseSpeed - Speed multiplier (e.g., 120 = 120x speed)
 * @returns Date object representing the real-world time
 */
export function calculateRealWorldTime(
  videoTimestamp: number,
  realWorldStartTime: Date,
  timelapseSpeed: number
): Date {
  // Calculate how much real-world time has passed
  const realWorldElapsed = videoTimestamp * timelapseSpeed;

  // Add elapsed time to start time
  const currentRealTime = new Date(realWorldStartTime.getTime() + realWorldElapsed * 1000);

  return currentRealTime;
}

/**
 * Format options for time-of-day timestamps
 */
export type TimestampFormat =
  | '12h'      // 9:00 AM
  | '24h'      // 09:00
  | '12h-full' // 9:00:00 AM
  | '24h-full' // 09:00:00
  | 'date-time-12h' // Jan 1, 9:00 AM
  | 'date-time-24h'; // Jan 1, 09:00

/**
 * Formats a Date object according to the specified format
 * @param date - Date to format
 * @param format - Desired format
 * @param showHours - Whether to show hours (default: true)
 * @param showMinutes - Whether to show minutes (default: true)
 * @param showSeconds - Whether to show seconds (default: true)
 * @returns Formatted time string
 */
export function formatTimestamp(
  date: Date,
  format: TimestampFormat = '12h',
  showHours: boolean = true,
  showMinutes: boolean = true,
  showSeconds: boolean = true
): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const is12h = format.includes('12h');
  const is24h = format.includes('24h');
  const includeDate = format.includes('date-time');

  // Build time parts based on toggles
  const parts: string[] = [];
  
  if (showHours) {
    parts.push(is24h ? pad(hours24) : hours12.toString());
  }
  
  if (showMinutes) {
    parts.push(pad(minutes));
  }
  
  if (showSeconds) {
    parts.push(pad(seconds));
  }

  let timeString = parts.join(':');
  
  // Add AM/PM for 12h format
  if (is12h && timeString) {
    timeString += ` ${ampm}`;
  }

  // Add date prefix if needed
  if (includeDate) {
    const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`;
    return timeString ? `${dateStr}, ${timeString}` : dateStr;
  }

  return timeString || '0';
}

/**
 * Formats a time-of-day timestamp for a given video position
 * @param videoTimestamp - Current position in video (seconds)
 * @param realWorldStartTime - Actual time when timelapse started
 * @param timelapseSpeed - Speed multiplier (e.g., 120 = 120x speed)
 * @param format - Desired format
 * @param showHours - Whether to show hours (default: true)
 * @param showMinutes - Whether to show minutes (default: true)
 * @param showSeconds - Whether to show seconds (default: true)
 * @returns Formatted timestamp string
 */
export function formatTimeOfDayTimestamp(
  videoTimestamp: number,
  realWorldStartTime: Date,
  timelapseSpeed: number,
  format: TimestampFormat = '12h',
  showHours: boolean = true,
  showMinutes: boolean = true,
  showSeconds: boolean = true
): string {
  const realWorldTime = calculateRealWorldTime(
    videoTimestamp,
    realWorldStartTime,
    timelapseSpeed
  );

  return formatTimestamp(realWorldTime, format, showHours, showMinutes, showSeconds);
}

/**
 * Parses a time string in HH:MM:SS or MM:SS format to seconds
 * @param timeString - Time string to parse
 * @returns Total seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(p => parseInt(p, 10));

  if (parts.length === 3) {
    // HH:MM:SS
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Validates if a time string is in valid HH:MM:SS or MM:SS format
 * @param timeString - Time string to validate
 * @returns true if valid
 */
export function isValidTimeFormat(timeString: string): boolean {
  const hhmmss = /^([0-9]+):([0-5][0-9]):([0-5][0-9])$/;
  const mmss = /^([0-5]?[0-9]):([0-5][0-9])$/;

  return hhmmss.test(timeString) || mmss.test(timeString);
}
