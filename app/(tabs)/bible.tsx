// app/(tabs)/bible.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { getBibleBooks, getBookmarks } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';

type Book = {
  name: string;
  abbr: string;
  chapters: number;
};

const QuickActionCard = ({ 
  icon, 
  title, 
  description, 
  color, 
  onPress 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-200`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[tw`w-12 h-12 rounded-full items-center justify-center mb-3`, {
      backgroundColor: `${color}20`
    }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <AppText style={tw`text-gray-900 text-sm mb-1`} weight="bold">
      {title}
    </AppText>
    <AppText style={tw`text-gray-600 text-xs`}>
      {description}
    </AppText>
  </TouchableOpacity>
);

const BookCard = ({ 
  book, 
  testament 
}: { 
  book: Book; 
  testament: 'old' | 'new' 
}) => (
  <TouchableOpacity
    style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-200`}
    onPress={() => router.push({
      pathname: '/bible/book' as never,
      params: { 
        bookName: book.name, 
        bookAbbr: book.abbr, 
        chapters: book.chapters,
        testament 
      }
    })}
    activeOpacity={0.7}
  >
    <View style={tw`flex-row items-center justify-between`}>
      <View style={tw`flex-1`}>
        <AppText style={tw`text-gray-900 text-base mb-1`} weight="bold">
          {book.name}
        </AppText>
        <AppText style={tw`text-gray-600 text-xs`}>
          {book.chapters} {book.chapters === 1 ? 'chapter' : 'chapters'}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
);

export default function BibleScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any>(null);
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new'>('new');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const booksData = await getBibleBooks();
      setBooks(booksData.books);

      if (user?.token) {
        const bookmarksData = await getBookmarks(user.token);
        setRecentBookmarks(bookmarksData.bookmarks?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error loading Bible data:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <View style={tw`px-6 pt-6 pb-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <View style={tw`flex-1`}>
            <AppText style={tw`text-2xl text-gray-900 mb-1`} weight="bold">
              Holy Bible
            </AppText>
            <AppText style={tw`text-gray-600 text-sm`}>
              Read and study Scripture
            </AppText>
          </View>
          <TouchableOpacity 
            style={tw`w-11 h-11 rounded-full bg-gray-100 items-center justify-center`}
            onPress={() => router.push('/bible/search' as never)}
          >
            <Ionicons name="search-outline" size={22} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={tw`flex-row gap-3 mb-6`}>
          <QuickActionCard
            icon="bookmark"
            title="Bookmarks"
            description="Saved verses"
            color={PRIMARY_COLOR}
            onPress={() => router.push('/bible/bookmarks' as never)}
          />
          <QuickActionCard
            icon="color-palette"
            title="Highlights"
            description="Marked verses"
            color="#F59E0B"
            onPress={() => router.push('/bible/highlights' as never)}
          />
        </View>

        {/* Verse of the Day */}
        <TouchableOpacity 
          style={tw`mb-6`}
          activeOpacity={0.8}
          onPress={() => router.push('/bible/verse-of-day' as never)}
        >
          <LinearGradient
            colors={[PRIMARY_COLOR, '#3A6347']}
            style={tw`rounded-2xl p-5`}
          >
            <View style={tw`flex-row items-center mb-3`}>
              <Ionicons name="sunny" size={20} color="white" />
              <AppText style={tw`text-white text-sm ml-2`} weight="bold">
                VERSE OF THE DAY
              </AppText>
            </View>
            <AppText style={tw`text-white text-xs mb-2 `}>
              "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
            </AppText>
            <AppText style={tw`text-white/80 text-xs`}>
              John 3:16 (KJV)
            </AppText>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Bookmarks */}
        {recentBookmarks.length > 0 && (
          <View style={tw`mb-6`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <AppText style={tw`text-gray-900 text-base`} weight="bold">
                Recent Bookmarks
              </AppText>
              <TouchableOpacity onPress={() => router.push('/bible/bookmarks' as never)}>
                <AppText style={tw`text-[${PRIMARY_COLOR}] text-sm`} weight="regular">
                  View All
                </AppText>
              </TouchableOpacity>
            </View>
            {recentBookmarks.map((bookmark: any) => (
              <TouchableOpacity
                key={bookmark.id}
                style={tw`bg-white rounded-2xl p-4 mb-2 border border-gray-200`}
                onPress={() => router.push({
                  pathname: '/bible/reader' as never,
                  params: {
                    book: bookmark.book,
                    chapter: bookmark.chapter,
                    verse: bookmark.verse
                  }
                })}
              >
                <AppText style={tw`text-gray-900 text-sm mb-1`} weight="bold">
                  {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                </AppText>
                {bookmark.note && (
                  <AppText style={tw`text-gray-600 text-xs`}>
                    {bookmark.note}
                  </AppText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Testament Selector */}
        <View style={tw`flex-row gap-3 mb-4`}>
          <TouchableOpacity
            style={tw`flex-1 py-3 rounded-2xl ${
              selectedTestament === 'old'
                ? `bg-[${PRIMARY_COLOR}]`
                : 'bg-white border border-gray-200'
            }`}
            onPress={() => setSelectedTestament('old')}
          >
            <AppText 
              style={tw`text-center ${
                selectedTestament === 'old' ? 'text-white' : 'text-gray-600'
              }`}
              weight={selectedTestament === 'old' ? 'bold' : 'regular'}
            >
              Old Testament
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-1 py-3 rounded-2xl ${
              selectedTestament === 'new'
                ? `bg-[${PRIMARY_COLOR}]`
                : 'bg-white border border-gray-200'
            }`}
            onPress={() => setSelectedTestament('new')}
          >
            <AppText 
              style={tw`text-center ${
                selectedTestament === 'new' ? 'text-white' : 'text-gray-600'
              }`}
              weight={selectedTestament === 'new' ? 'bold' : 'regular'}
            >
              New Testament
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Books List */}
        <View style={tw`mb-6`}>
          <AppText style={tw`text-gray-900 text-base mb-3`} weight="bold">
            {selectedTestament === 'old' ? 'Old Testament Books' : 'New Testament Books'}
          </AppText>
          {books && (
            selectedTestament === 'old'
              ? books.oldTestament.map((book: Book) => (
                  <BookCard key={book.abbr} book={book} testament="old" />
                ))
              : books.newTestament.map((book: Book) => (
                  <BookCard key={book.abbr} book={book} testament="new" />
                ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}