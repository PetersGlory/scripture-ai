// app/bible/reader.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { getBibleChapter, createBookmark, createHighlight } from '@/services/api';
import CustomAlert from '@/components/CustomAlert';

type Verse = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#FCD34D' },
  { name: 'Green', color: '#6EE7B7' },
  { name: 'Blue', color: '#93C5FD' },
  { name: 'Purple', color: '#C4B5FD' },
  { name: 'Pink', color: '#F9A8D4' },
  { name: 'Orange', color: '#FDBA74' },
];

export default function BibleReaderScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { book, bookAbbr, chapter, testament } = params;

  const [loading, setLoading] = useState(true);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].color);
  const [version, setVersion] = useState('kjv');
  const [fontSize, setFontSize] = useState(16);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    loadChapter();
  }, [book, chapter, version]);

  const loadChapter = async () => {
    console.log("loading...")
    try {
      setLoading(true);
      const data = await getBibleChapter(bookAbbr as string, parseInt(chapter as string), version);

      console.log("loaded data: ", data)
      setVerses(data.chapter.verses);
    } catch (error) {
      console.error('Error loading chapter:', error.response.data);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load chapter. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVersePress = (verse: Verse) => {
    setSelectedVerse(verse);
    setShowMenu(true);
  };

  const handleBookmark = async () => {
    if (!selectedVerse) return;

    try {
      await createBookmark(
        {
          book: book,
          chapter: selectedVerse.chapter,
          verse: selectedVerse.verse,
          version,
          note: bookmarkNote,
        },
        user?.token || ''
      );

      setAlert({
        visible: true,
        title: 'Success',
        message: 'Bookmark saved successfully!',
        type: 'success',
      });
      setShowBookmarkModal(false);
      setBookmarkNote('');
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to save bookmark.',
        type: 'error',
      });
    }
  };

  const handleHighlight = async () => {
    if (!selectedVerse) return;

    try {
      await createHighlight(
        {
          book: book,
          chapter: selectedVerse.chapter,
          verse: selectedVerse.verse,
          text: selectedVerse.text,
          color: selectedColor,
          version,
          note: highlightNote,
        },
        user?.token || ''
      );

      setAlert({
        visible: true,
        title: 'Success',
        message: 'Verse highlighted successfully!',
        type: 'success',
      });
      setShowHighlightModal(false);
      setHighlightNote('');
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to highlight verse.',
        type: 'error',
      });
    }
  };

  const goToPreviousChapter = () => {
    const prevChapter = parseInt(chapter as string) - 1;
    if (prevChapter > 0) {
      router.setParams({ chapter: prevChapter.toString() });
    }
  };

  const goToNextChapter = () => {
    router.setParams({ chapter: (parseInt(chapter as string) + 1).toString() });
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`px-6 pt-6 pb-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={tw`flex-1 mx-4`}>
            <AppText style={tw`text-gray-900 text-lg text-center`} weight="bold">
              {book} {chapter}
            </AppText>
            <AppText style={tw`text-gray-600 text-xs text-center`}>
              {version.toUpperCase()}
            </AppText>
          </View>

          <View style={tw`flex-row gap-2`}>
            <TouchableOpacity
              style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              <Ionicons name="remove" size={20} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
              onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            >
              <Ionicons name="add" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
      >
        {verses.map((verse) => (
          <TouchableOpacity
            key={verse.verse}
            onPress={() => handleVersePress(verse)}
            style={tw`mb-4`}
            activeOpacity={0.7}
          >
            <View style={tw`flex-row`}>
              <AppText 
                style={tw`text-[${PRIMARY_COLOR}] mr-2`} 
                weight="bold"
              >
                {verse.verse}
              </AppText>
              <AppText 
                style={[tw`text-gray-800 flex-1 leading-7`, { fontSize }]}
              >
                {verse.text}
              </AppText>
            </View>
          </TouchableOpacity>
        ))}

        {/* Navigation */}
        <View style={tw`flex-row justify-between mt-8 mb-4`}>
          <TouchableOpacity
            style={tw`flex-row items-center px-6 py-3 rounded-2xl bg-gray-100`}
            onPress={goToPreviousChapter}
            disabled={parseInt(chapter as string) === 1}
          >
            <Ionicons name="chevron-back" size={20} color={PRIMARY_COLOR} />
            <AppText style={tw`text-[${PRIMARY_COLOR}] ml-2`} weight="bold">
              Previous
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-row items-center px-6 py-3 rounded-2xl bg-gray-100`}
            onPress={goToNextChapter}
          >
            <AppText style={tw`text-[${PRIMARY_COLOR}] mr-2`} weight="bold">
              Next
            </AppText>
            <Ionicons name="chevron-forward" size={20} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Verse Action Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black/50 justify-end`}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={tw`bg-white rounded-t-3xl p-6`}>
            <AppText style={tw`text-gray-900 text-lg mb-4`} weight="bold">
              {book} {selectedVerse?.chapter}:{selectedVerse?.verse}
            </AppText>

            <TouchableOpacity
              style={tw`flex-row items-center py-4 border-b border-gray-100`}
              onPress={() => {
                setShowMenu(false);
                setShowBookmarkModal(true);
              }}
            >
              <Ionicons name="bookmark-outline" size={24} color={PRIMARY_COLOR} />
              <AppText style={tw`text-gray-900 ml-4`} weight="regular">
                Bookmark Verse
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row items-center py-4 border-b border-gray-100`}
              onPress={() => {
                setShowMenu(false);
                setShowHighlightModal(true);
              }}
            >
              <Ionicons name="color-palette-outline" size={24} color="#F59E0B" />
              <AppText style={tw`text-gray-900 ml-4`} weight="regular">
                Highlight Verse
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row items-center py-4`}
              onPress={() => {
                // Copy to clipboard functionality
                setShowMenu(false);
              }}
            >
              <Ionicons name="copy-outline" size={24} color="#6B7280" />
              <AppText style={tw`text-gray-900 ml-4`} weight="regular">
                Copy Verse
              </AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bookmark Modal */}
      <Modal
        visible={showBookmarkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookmarkModal(false)}
      >
        <View style={tw`flex-1 bg-black/50 justify-end`}>
          <View style={tw`bg-white rounded-t-3xl p-6`}>
            <AppText style={tw`text-gray-900 text-lg mb-4`} weight="bold">
              Add Bookmark
            </AppText>

            <AppText style={tw`text-gray-600 text-sm mb-2`}>
              Note (optional)
            </AppText>
            <TextInput
              style={tw`bg-gray-50 rounded-2xl p-4 mb-6 text-gray-900 border border-gray-200`}
              placeholder="Add a personal note..."
              placeholderTextColor="#9CA3AF"
              value={bookmarkNote}
              onChangeText={setBookmarkNote}
              multiline
              numberOfLines={3}
            />

            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                style={tw`flex-1 py-4 rounded-2xl bg-gray-100`}
                onPress={() => {
                  setShowBookmarkModal(false);
                  setBookmarkNote('');
                }}
              >
                <AppText style={tw`text-gray-700 text-center`} weight="bold">
                  Cancel
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-1 py-4 rounded-2xl bg-[${PRIMARY_COLOR}]`}
                onPress={handleBookmark}
              >
                <AppText style={tw`text-white text-center`} weight="bold">
                  Save
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Highlight Modal */}
      <Modal
        visible={showHighlightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHighlightModal(false)}
      >
        <View style={tw`flex-1 bg-black/50 justify-end`}>
          <View style={tw`bg-white rounded-t-3xl p-6`}>
            <AppText style={tw`text-gray-900 text-lg mb-4`} weight="bold">
              Highlight Verse
            </AppText>

            <AppText style={tw`text-gray-600 text-sm mb-3`}>
              Select Color
            </AppText>
            <View style={tw`flex-row gap-3 mb-6`}>
              {HIGHLIGHT_COLORS.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption.color}
                  style={[
                    tw`w-12 h-12 rounded-full items-center justify-center`,
                    { backgroundColor: colorOption.color },
                    selectedColor === colorOption.color && tw`border-4 border-gray-900`
                  ]}
                  onPress={() => setSelectedColor(colorOption.color)}
                >
                  {selectedColor === colorOption.color && (
                    <Ionicons name="checkmark" size={20} color="#1F2937" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <AppText style={tw`text-gray-600 text-sm mb-2`}>
              Note (optional)
            </AppText>
            <TextInput
              style={tw`bg-gray-50 rounded-2xl p-4 mb-6 text-gray-900 border border-gray-200`}
              placeholder="Add a note..."
              placeholderTextColor="#9CA3AF"
              value={highlightNote}
              onChangeText={setHighlightNote}
              multiline
              numberOfLines={3}
            />

            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                style={tw`flex-1 py-4 rounded-2xl bg-gray-100`}
                onPress={() => {
                  setShowHighlightModal(false);
                  setHighlightNote('');
                }}
              >
                <AppText style={tw`text-gray-700 text-center`} weight="bold">
                  Cancel
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-1 py-4 rounded-2xl bg-[${PRIMARY_COLOR}]`}
                onPress={handleHighlight}
              >
                <AppText style={tw`text-white text-center`} weight="bold">
                  Highlight
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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