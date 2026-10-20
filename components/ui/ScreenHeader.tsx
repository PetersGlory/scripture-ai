import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import AppText from './AppText';
import { colors } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
}: ScreenHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={tw`px-6 pt-6 pb-4 bg-white border-b border-gray-200`}>
      <View style={tw`flex-row items-center`}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={tw`mr-4`}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <View style={tw`flex-1`}>
          <AppText style={tw`text-2xl text-gray-900`} weight="bold">
            {title}
          </AppText>
          {subtitle ? (
            <AppText style={tw`text-gray-600 text-sm mt-1`}>{subtitle}</AppText>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
