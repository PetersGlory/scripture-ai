import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// List of Bible versions
const bibleVersions = [
  { code: 'niv', name: 'New International Version', abbreviation: 'NIV' },
  { code: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
  { code: 'esv', name: 'English Standard Version', abbreviation: 'ESV' },
  { code: 'nlt', name: 'New Living Translation', abbreviation: 'NLT' },
  { code: 'nasb', name: 'New American Standard Bible', abbreviation: 'NASB' },
  { code: 'nkjv', name: 'New King James Version', abbreviation: 'NKJV' },
  { code: 'csb', name: 'Christian Standard Bible', abbreviation: 'CSB' },
  { code: 'cev', name: 'Contemporary English Version', abbreviation: 'CEV' },
  { code: 'msg', name: 'The Message', abbreviation: 'MSG' },
  { code: 'amp', name: 'Amplified Bible', abbreviation: 'AMP' },
  { code: 'nrsv', name: 'New Revised Standard Version', abbreviation: 'NRSV' },
  { code: 'ceb', name: 'Common English Bible', abbreviation: 'CEB' },
];

export default function BibleVersionScreen() {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState('niv');
  const [loading, setLoading] = useState(false);

  const handleSelectVersion = async (versionCode: string) => {
    setSelectedVersion(versionCode);
    setLoading(true);
    
    try {
      // Here you would typically save the Bible version preference to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Bible version updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update Bible version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 pt-6 bg-[${colors.background}]`}>
      {/* Header */}
      <View style={tw`flex-row items-center p-4 border-b border-[${colors.border}]`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={tw`p-2`}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
          Bible Version
        </Text>
      </View>

      {/* Bible Version List */}
      <ScrollView style={tw`flex-1`}>
        {bibleVersions.map((version) => (
          <TouchableOpacity
            key={version.code}
            style={tw`
              flex-row items-center p-4 border-b border-[${colors.border}]
              ${selectedVersion === version.code ? `bg-[${colors.primary}]/10` : ''}
            `}
            onPress={() => handleSelectVersion(version.code)}
            disabled={loading}
          >
            <View style={tw`flex-1`}>
              <Text style={tw`
                text-base
                ${selectedVersion === version.code ? `text-[${colors.primary}] font-semibold` : `text-[${colors.text.primary}]`}
              `}>
                {version.name}
              </Text>
              <Text style={tw`text-sm text-[${colors.text.secondary}]`}>
                {version.abbreviation}
              </Text>
            </View>
            {selectedVersion === version.code && (
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
    </View>
  );
} 