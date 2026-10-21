import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import ScreenHeader from '@/components/ui/ScreenHeader';
import {
  BIBLE_VERSIONS,
  getBibleVersion,
  setBibleVersion,
} from '@/services/preferences';

export default function BibleVersionScreen() {
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBibleVersion().then(setSelectedVersion);
  }, []);

  const handleSelectVersion = async (versionCode: string) => {
    if (saving || versionCode === selectedVersion) return;
    setSelectedVersion(versionCode);
    setSaving(true);
    try {
      await setBibleVersion(versionCode);
    } catch (error) {
      console.error('Failed to save bible version:', error);
      setSelectedVersion(await getBibleVersion());
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={tw`flex-1 pt-6 bg-[${colors.background}]`}>
      <ScreenHeader title="Bible Version" subtitle="Used for reading and search" />

      <ScrollView style={tw`flex-1`}>
        {BIBLE_VERSIONS.map((version) => (
          <TouchableOpacity
            key={version.code}
            style={tw`
              flex-row items-center p-4 border-b border-[${colors.border}]
              ${selectedVersion === version.code ? `bg-[${colors.primary}]/10` : ''}
            `}
            onPress={() => handleSelectVersion(version.code)}
            disabled={saving}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedVersion === version.code }}
          >
            <View style={tw`flex-1`}>
              <AppText
                style={tw`
                  text-base
                  ${selectedVersion === version.code ? `text-[${colors.primary}]` : `text-[${colors.text.primary}]`}
                `}
                weight={selectedVersion === version.code ? 'bold' : 'regular'}
              >
                {version.name}
              </AppText>
              <AppText style={tw`text-sm text-[${colors.text.secondary}]`}>
                {version.abbreviation}
              </AppText>
            </View>
            {selectedVersion === version.code && (
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
    </View>
  );
}
