import { PRIMARY_COLOR } from "./Colors";

export const colors = {
  primary: PRIMARY_COLOR, // sage green
  primaryLight: '#E8F0EA',
  primaryDark: '#3A6247',
  secondary: '#FFB800', // gold
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: {
    primary: '#1F2937', // near-black gray for headings/body
    secondary: '#4A5568',
    light: '#718096',
  },
  border: '#E2E8F0',
  error: '#E53E3E',
  success: '#48BB78',
  warning: '#ECC94B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

export const fonts = {
  body: undefined as string | undefined, // system font
  accent: 'SpaceMono_Regular',
  accentBold: 'SpaceMono_Bold',
  accentItalic: 'SpaceMono_Italic',
  accentBoldItalic: 'SpaceMono_BoldItalic',
};

export const theme = {
  colors: {
    primary: {
      light: colors.primaryLight,
      DEFAULT: colors.primary,
      dark: colors.primaryDark,
    },
    secondary: {
      light: '#FFF7E0',
      DEFAULT: colors.secondary,
      dark: '#B38600',
    },
    background: {
      light: colors.background,
      DEFAULT: colors.surface,
      dark: '#1F2937',
    },
    text: {
      light: colors.text.light,
      DEFAULT: colors.text.secondary,
      dark: colors.text.primary,
    },
  },
  typography: {
    fontFamily: {
      sans: 'System',
      accent: fonts.accent,
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    base: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  borderRadius: {
    sm: 4,
    DEFAULT: 8,
    lg: 12,
    full: 9999,
  },
};
