// app/bible/reader.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { getBibleChapter, getBibleBooks, createBookmark, createHighlight } from '@/services/api';
import { getBibleVersion } from '@/services/preferences';
import * as Clipboard from 'expo-clipboard';
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
  const params = useLocalSearchParams();
  const { bookAbbr, chapter } = params;
  const bookTitle = (params.book as string) || (params.bookName as string) || '';
  const totalChapters = params.chapters ? parseInt(params.chapters as string, 10) : undefined;

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
  const [bookChapterCount, setBookChapterCount] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Re-apply the stored version preference whenever the reader regains focus
  // (e.g. right after changing it in Profile) — the chapter reloads below if
  // the value actually changed.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getBibleVersion().then((v) => {
        if (!cancelled) setVersion(v);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Some entry points (search, verse of the day, bookmarks) don't pass the
  // book's chapter count — look it up so the "end of book" guard still works.
  useEffect(() => {
    if (totalChapters || !bookTitle) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getBibleBooks();
        const all = [
          ...(data.books?.oldTestament ?? []),
          ...(data.books?.newTestament ?? []),
        ];
        const key = ((bookAbbr as string) || bookTitle).toLowerCase();
        const match = all.find(
          (b: any) =>
            b.abbr?.toLowerCase() === key || b.name?.toLowerCase() === key
        );
        if (!cancelled && match?.chapters) {
          setBookChapterCount(match.chapters);
        }
      } catch (error) {
        console.error('Error looking up book chapter count:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookTitle, bookAbbr, totalChapters]);

  useEffect(() => {
    loadChapter();
  }, [bookTitle, bookAbbr, chapter, version]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/bible');
    }
  };

  const loadChapter = async () => {
    const chapterNum = parseInt(chapter as string, 10);
    if (!bookTitle && !bookAbbr) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'No book selected. Please pick a book from the Bible tab.',
        type: 'error',
      });
      setLoading(false);
      return;
    }
    if (!Number.isInteger(chapterNum) || chapterNum < 1) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Invalid chapter. Please pick a book from the Bible tab.',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getBibleChapter(
        (bookAbbr as string) || bookTitle,
        chapterNum,
        version
      );
      setVerses(data.chapter.verses);
    } catch (error: any) {
      console.error('Error loading chapter:', error?.response?.data ?? error?.message);
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

  const handleCopyVerse = async () => {
    if (!selectedVerse) return;
    try {
      const citation = `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}`;
      const text = `"${selectedVerse.text}" — ${citation} (${version.toUpperCase()})`;
      await Clipboard.setStringAsync(text);
      setShowMenu(false);
      setAlert({
        visible: true,
        title: 'Copied',
        message: `${citation} copied to clipboard.`,
        type: 'success',
      });
    } catch (error) {
      setShowMenu(false);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to copy verse.',
        type: 'error',
      });
    }
  };

  const handleBookmark = async () => {
    if (!selectedVerse || isSaving) return;

    setIsSaving(true);
    try {
      await createBookmark({
        book: bookTitle,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        version,
        note: bookmarkNote,
      });

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleHighlight = async () => {
    if (!selectedVerse || isSaving) return;

    setIsSaving(true);
    try {
      await createHighlight({
        book: bookTitle,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        text: selectedVerse.text,
        color: selectedColor,
        version,
        note: highlightNote,
      });

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
    } finally {
      setIsSaving(false);
    }
  };

  const goToPreviousChapter = () => {
    const prevChapter = parseInt(chapter as string) - 1;
    if (prevChapter > 0) {
      router.setParams({ chapter: prevChapter.toString() });
    }
  };

  const goToNextChapter = () => {
    const nextChapter = parseInt(chapter as string) + 1;
    const total = totalChapters ?? bookChapterCount;
    if (total && nextChapter > total) {
      setAlert({
        visible: true,
        title: 'End of book',
        message: `${bookTitle} has ${total} chapter${total === 1 ? '' : 's'}.`,
        type: 'info',
      });
      return;
    }
    router.setParams({ chapter: nextChapter.toString() });
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
          <TouchableOpacity onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={tw`flex-1 mx-4`}>
            <AppText style={tw`text-gray-900 text-lg text-center`} weight="bold">
              {bookTitle} {chapter}
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
              {bookTitle} {selectedVerse?.chapter}:{selectedVerse?.verse}
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
              onPress={handleCopyVerse}
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
                style={tw`flex-1 py-4 rounded-2xl bg-[${PRIMARY_COLOR}] ${isSaving ? 'opacity-50' : ''}`}
                onPress={handleBookmark}
                disabled={isSaving}
              >
                <AppText style={tw`text-white text-center`} weight="bold">
                  {isSaving ? 'Saving...' : 'Save'}
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
                style={tw`flex-1 py-4 rounded-2xl bg-[${PRIMARY_COLOR}] ${isSaving ? 'opacity-50' : ''}`}
                onPress={handleHighlight}
                disabled={isSaving}
              >
                <AppText style={tw`text-white text-center`} weight="bold">
                  {isSaving ? 'Saving...' : 'Highlight'}
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