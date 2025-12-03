/**
 * Available fonts for overlay text
 */

export interface Font {
  value: string;
  label: string;
  family: string;
}

/**
 * System fonts available on iOS
 */
export const AVAILABLE_FONTS: Font[] = [
  { value: 'System', label: 'System', family: 'System' },
  { value: 'SF-Mono', label: 'SF Mono', family: 'SFMono-Regular' },
  { value: 'SF-Rounded', label: 'SF Rounded', family: 'SFRounded-Regular' },
  { value: 'New-York', label: 'New York', family: 'NewYork-Regular' },
  { value: 'Courier', label: 'Courier', family: 'Courier' },
  { value: 'Menlo', label: 'Menlo', family: 'Menlo-Regular' },
];

/**
 * Preset font sizes
 */
export const FONT_SIZES = [
  { value: 16, label: 'Small' },
  { value: 24, label: 'Medium' },
  { value: 32, label: 'Large' },
  { value: 48, label: 'Extra Large' },
];

/**
 * Preset colors
 */
export const PRESET_COLORS = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#000000', label: 'Black' },
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
];

/**
 * Background opacity presets
 */
export const BACKGROUND_OPACITIES = [
  { value: 0, label: 'None' },
  { value: 0.3, label: 'Light' },
  { value: 0.5, label: 'Medium' },
  { value: 0.7, label: 'Dark' },
  { value: 1, label: 'Solid' },
];
