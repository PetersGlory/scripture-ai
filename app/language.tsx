import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// List of supported languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  const handleSelectLanguage = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setLoading(true);
    
    try {
      // Here you would typically save the language preference to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Language updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update language');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 pt-6 bg-[${colors.background}]`}>
      {/* Header */}
      <View style={tw`flex-row items-center p-4 border-b border-[${colors.border}]`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={tw`p-2`}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
          Language
        </Text>
      </View>

      {/* Language List */}
      <ScrollView style={tw`flex-1`}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={tw`
              flex-row items-center p-4 border-b border-[${colors.border}]
              ${selectedLanguage === language.code ? `bg-[${colors.primary}]/10` : ''}
            `}
            onPress={() => handleSelectLanguage(language.code)}
            disabled={loading}
          >
            <Text style={tw`
              flex-1 text-base
              ${selectedLanguage === language.code ? `text-[${colors.primary}] font-semibold` : `text-[${colors.text.primary}]`}
            `}>
              {language.name}
            </Text>
            {selectedLanguage === language.code && (
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading Indicator */}
      {loading && (
        <View style={tw`absolute inset-0 bg-black/30 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
} 