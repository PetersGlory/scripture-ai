// app/bible/search.tsx
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { getBiblePassage } from '@/services/api';

type PassageVerse = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export default function BibleSearchScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [verses, setVerses] = useState<PassageVerse[]>([]);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      setError(null);
      setVerses([]);
      setReference(null);

      const data = await getBiblePassage(trimmed, 'kjv');
      if (!data?.verses?.length) {
        setError('No passage found. Try a reference like "John 3:16" or "Genesis 1".');
        return;
      }
      setVerses(data.verses);
      setReference(data.reference);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to look up that reference.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openInReader = () => {
    if (!reference) return;
    const match = /^(.+?)\s+(\d+)/.exec(reference);
    if (!match) return;
    const book = match[1].trim();
    const chapter = match[2];
    router.push({
      pathname: '/bible/book',
      params: { book, bookName: book, chapter },
    });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`px-6 pt-6 pb-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/bible'))}
            style={tw`mr-4`}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <AppText style={tw`text-2xl text-gray-900 mb-1`} weight="bold">
              Search Scripture
            </AppText>
            <AppText style={tw`text-gray-600 text-sm`}>
              Look up any verse or passage (KJV)
            </AppText>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Search input */}
        <View style={tw`px-6 pt-4 flex-row items-center`}>
          <View style={tw`flex-1 flex-row items-center bg-white rounded-2xl border border-gray-200 px-4`}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={tw`flex-1 py-4 ml-2 text-gray-900`}
              placeholder='e.g. "John 3:16" or "Genesis 1"'
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Bible reference search"
            />
          </View>
          <TouchableOpacity
            style={[tw`ml-3 px-5 py-4 rounded-2xl items-center justify-center`, { backgroundColor: PRIMARY_COLOR }]}
            onPress={handleSearch}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-6 py-6`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={tw`bg-white rounded-2xl p-4 border border-red-200 mb-4`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <AppText style={tw`text-red-600 ml-2 flex-1`}>{error}</AppText>
              </View>
            </View>
          )}

          {reference && verses.length > 0 && (
            <View>
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <AppText style={tw`text-gray-900 text-lg`} weight="bold">
                  {reference}
                </AppText>
                <TouchableOpacity onPress={openInReader}>
                  <AppText style={{ color: PRIMARY_COLOR }} weight="bold">
                    Open chapter
                  </AppText>
                </TouchableOpacity>
              </View>

              <View style={tw`bg-white rounded-2xl p-5 border border-gray-200`}>
                {verses.map((verse) => (
                  <View key={`${verse.chapter}:${verse.verse}`} style={tw`mb-3`}>
                    <View style={tw`flex-row`}>
                      <AppText style={tw`text-[${PRIMARY_COLOR}] mr-2`} weight="bold">
                        {verse.verse}
                      </AppText>
                      <AppText style={tw`text-gray-800 flex-1 leading-6`}>
                        {verse.text}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!reference && !error && !loading && (
            <View style={tw`items-center py-12`}>
              <View style={tw`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4`}>
                <Ionicons name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <AppText style={tw`text-gray-900 text-lg mb-2`} weight="bold">
                Find a passage
              </AppText>
              <AppText style={tw`text-gray-600 text-center px-4`}>
                Enter a reference above, such as John 3:16, Psalm 23, or Romans 8:28-39.
              </AppText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
