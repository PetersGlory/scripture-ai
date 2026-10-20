import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import AppText from './AppText';
import { colors } from '@/constants/theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export default function AppButton({
  title,
  onPress,
  loading = false,
  loadingTitle,
  disabled = false,
  variant = 'primary',
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const containerStyle =
    variant === 'primary' ? tw`bg-[${colors.primary}]` : tw`bg-gray-100`;
  const textStyle = variant === 'primary' ? tw`text-white` : tw`text-gray-700`;

  return (
    <TouchableOpacity
      style={[
        tw`py-4 rounded-2xl items-center justify-center`,
        containerStyle,
        isDisabled && tw`opacity-50`,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <View style={tw`flex-row items-center justify-center`}>
          <ActivityIndicator color={variant === 'primary' ? 'white' : colors.primary} />
          <AppText style={[tw`ml-2 text-base`, textStyle]} weight="bold">
            {loadingTitle ?? title}
          </AppText>
        </View>
      ) : (
        <AppText style={[tw`text-center text-base`, textStyle]} weight="bold">
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
}
