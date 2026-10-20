import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

const ACCENT_FONTS = {
  regular: 'SpaceMono_Regular',
  italic: 'SpaceMono_Italic',
  bold: 'SpaceMono_Bold',
  boldItalic: 'SpaceMono_BoldItalic',
} as const;

interface AppTextProps extends TextProps {
  weight?: 'regular' | 'bold';
  italic?: boolean;
  /** Use the SpaceMono accent face (brand moments, labels). Body defaults to the readable system font. */
  accent?: boolean;
}

export default function AppText({
  weight = 'regular',
  italic = false,
  accent = false,
  style,
  ...props
}: AppTextProps) {
  const face: TextStyle = accent
    ? {
        fontFamily:
          weight === 'bold' && italic
            ? ACCENT_FONTS.boldItalic
            : weight === 'bold'
              ? ACCENT_FONTS.bold
              : italic
                ? ACCENT_FONTS.italic
                : ACCENT_FONTS.regular,
      }
    : {
        fontWeight: weight === 'bold' ? '700' : '400',
        fontStyle: italic ? 'italic' : 'normal',
      };

  return <Text {...props} style={[face, style]} />;
}
