import { Platform } from 'react-native';

export const Colors = {
  primary: '#F5811F',       // Snacko Primary Orange (from --orange)
  primaryDark: '#D8690F',   // Dark Orange (from --orange-dark)
  primaryLight: '#FDEBD9',  // Soft Orange Tint (from --tint)
  secondary: '#F7D3AA',     // Snacko Yellow / Amber (from --tint-strong)
  textDark: '#3A2318',      // Dark Slate / Brown (from --brown)
  textMuted: '#6E4C3A',     // Muted Gray / Brown-Soft (from --brown-soft)
  bgLight: '#FDF8F3',       // Cream (from --cream)
  border: '#EAD9C7',        // Soft Border (from --border)
  white: '#ffffff',
  danger: '#ef4444',
  success: '#7CB342',       // Green (from --green)
  successDark: '#4E7A22',   // Green Dark (from --green-dark)
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
