import { PRIMARY_COLOR } from "./Colors";

export const colors = {
  primary: PRIMARY_COLOR, // Dark navy blue from logo
  secondary: '#FFB800', // Gold from cross
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: {
    primary: PRIMARY_COLOR,
    secondary: '#4A5568',
    light: '#718096'
  },
  border: '#E2E8F0',
  error: '#E53E3E',
  success: '#48BB78',
  warning: '#ECC94B'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
};

export const theme = {
  colors: {
    primary: {
      light: '#E6F0FF',
      DEFAULT: '#3B82F6',
      dark: '#1D4ED8',
    },
    secondary: {
      light: '#F5F3FF',
      DEFAULT: '#8B5CF6',
      dark: '#5B21B6',
    },
    background: {
      light: '#FFFFFF',
      DEFAULT: '#F9FAFB',
      dark: '#1F2937',
    },
    text: {
      light: '#6B7280',
      DEFAULT: '#374151',
      dark: '#111827',
    },
    accent: {
      gold: '#D4AF37',
      burgundy: '#800020',
      olive: '#808000',
    },
  },
  typography: {
    fontFamily: {
      sans: 'System',
      serif: 'System',
      scripture: 'System',
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