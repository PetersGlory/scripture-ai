// app/bible/highlights.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { getHighlights, deleteHighlight } from '@/services/api';
import CustomAlert from '@/components/CustomAlert';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function HighlightsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      setLoading(true);
      const data = await getHighlights();
      setHighlights(data.highlights || []);
    } catch (error) {
      console.error('Error loading highlights:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load highlights. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHighlight(id);
      setHighlights(highlights.filter((h: any) => h.id !== id));
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Highlight deleted',
        type: 'success',
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to delete highlight',
        type: 'error',
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHighlights();
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScreenHeader
        title="Highlights"
        subtitle={`${highlights.length} highlighted ${highlights.length === 1 ? 'verse' : 'verses'}`}
      />

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        {highlights.length > 0 ? (
          highlights.map((highlight: any) => (
            <View
              key={highlight.id}
              style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-200 flex-row items-start justify-between`}
            >
              <TouchableOpacity
                style={tw`flex-1 mr-3`}
                onPress={() => router.push({
                  pathname: '/bible/book',
                  params: {
                    book: highlight.book,
                    bookName: highlight.book,
                    chapter: String(highlight.chapter),
                    verse: highlight.verse,
                  },
                })}
              >
                <View style={tw`flex-row items-center mb-2`}>
                  <View style={[tw`w-3 h-3 rounded-full mr-2`, { backgroundColor: highlight.color || '#FCD34D' }]} />
                  <AppText style={tw`text-gray-900 text-base`} weight="bold">
                    {highlight.book} {highlight.chapter}:{highlight.verse}
                  </AppText>
                </View>

                {highlight.text && (
                  <AppText style={tw`text-gray-600 text-sm mb-2`} italic>
                    {highlight.text.length > 150 ? `${highlight.text.slice(0, 150)}...` : highlight.text}
                  </AppText>
                )}

                {highlight.note && (
                  <AppText style={tw`text-gray-700 text-sm mb-2`}>
                    {highlight.note}
                  </AppText>
                )}

                <AppText style={tw`text-gray-500 text-xs`}>
                  {new Date(highlight.createdAt).toLocaleDateString()}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(highlight.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Delete highlight"
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={tw`items-center py-12`}>
            <View style={tw`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4`}>
              <Ionicons name="color-palette-outline" size={32} color="#9CA3AF" />
            </View>
            <AppText style={tw`text-gray-900 text-lg mb-2`} weight="bold">
              No Highlights Yet
            </AppText>
            <AppText style={tw`text-gray-600 text-center px-4`}>
              Tap any verse while reading and choose "Highlight Verse" to save it here.
            </AppText>
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}
