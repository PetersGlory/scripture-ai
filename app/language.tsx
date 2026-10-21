import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { LANGUAGES, getLanguage, setLanguage } from '@/services/preferences';

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLanguage().then(setSelectedLanguage);
  }, []);

  const handleSelectLanguage = async (languageCode: string) => {
    if (saving || languageCode === selectedLanguage) return;
    setSelectedLanguage(languageCode);
    setSaving(true);
    try {
      await setLanguage(languageCode);
    } catch (error) {
      console.error('Failed to save language pref:', error);
      setSelectedLanguage(await getLanguage());
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 pt-6 bg-[${colors.background}]`}>
      <ScreenHeader
        title="Language"
        subtitle="Saved on this device — full app translation is coming soon"
      />

      <ScrollView style={tw`flex-1`}>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={tw`
              flex-row items-center p-4 border-b border-[${colors.border}]
              ${selectedLanguage === language.code ? `bg-[${colors.primary}]/10` : ''}
            `}
            onPress={() => handleSelectLanguage(language.code)}
            disabled={saving}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedLanguage === language.code }}
          >
            <AppText
              style={tw`
                flex-1 text-base
                ${selectedLanguage === language.code ? `text-[${colors.primary}]` : `text-[${colors.text.primary}]`}
              `}
              weight={selectedLanguage === language.code ? 'bold' : 'regular'}
            >
              {language.name}
            </AppText>
            {selectedLanguage === language.code && (
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {saving && (
        <View style={tw`absolute inset-0 bg-black/30 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}
