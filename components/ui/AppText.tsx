import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

interface AppTextProps extends TextProps {
  weight?: 'regular' | 'bold';
  italic?: boolean;
}

export default function AppText({
  weight = 'regular',
  italic = false,
  style,
  ...props
}: AppTextProps) {
  
  let fontFamily = 'SpaceMono_Regular';

  if (weight === 'bold' && italic) {
    fontFamily = 'SpaceMono_BoldItalic';
  } else if (weight === 'bold') {
    fontFamily = 'SpaceMono_Bold';
  } else if (italic) {
    fontFamily = 'SpaceMono_Italic';
  }

  return (
    <Text
      {...props}
      style={[
        { fontFamily } as TextStyle,
        style,
      ]}
    />
  );
}
