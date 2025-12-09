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
  { value: 'Inter-Regular', label: 'Inter', family: 'Inter-Regular' },
  { value: 'Roboto-Regular', label: 'Roboto', family: 'Roboto-Regular' },
  { value: 'Oswald-Regular', label: 'Oswald', family: 'Oswald-Regular' },
  { value: 'Lato-Regular', label: 'Lato', family: 'Lato-Regular' },
  { value: 'PlayfairDisplay-Regular', label: 'Playfair Display', family: 'PlayfairDisplay-Regular' },
  { value: 'Montserrat-Regular', label: 'Montserrat', family: 'Montserrat-Regular' },
  { value: 'System', label: 'System', family: 'System' },
  { value: 'Courier', label: 'Courier', family: 'Courier' },
  { value: 'Menlo', label: 'Menlo', family: 'Menlo-Regular' },
];

/**
 * Preset font sizes
 */
export const FONT_SIZES = [
  { value: 10, label: 'Small' },
  { value: 12, label: 'Medium' },
  { value: 14, label: 'Large' },
  { value: 16, label: 'Extra Large' },
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
