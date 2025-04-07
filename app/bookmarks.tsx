import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ScrollView } from 'react-native';

// Mock data for bookmarks - in a real app, this would come from your backend
const mockBookmarks = [
  {
    id: '1',
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    date: new Date('2023-05-15'),
  },
  {
    id: '2',
    reference: 'Romans 8:28',
    text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    date: new Date('2023-06-22'),
  },
  {
    id: '3',
    reference: 'Philippians 4:13',
    text: 'I can do all things through him who strengthens me.',
    date: new Date('2023-07-10'),
  },
  {
    id: '4',
    reference: 'Psalm 23:1-3',
    text: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.',
    date: new Date('2023-08-05'),
  },
];

export default function BookmarksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState(mockBookmarks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch bookmarks from your backend
    // fetchBookmarks();
  }, []);

  const handleDeleteBookmark = (id: string) => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
          },
        },
      ]
    );
  };

  const handleViewVerse = (reference: string) => {
    // In a real app, you would navigate to the verse view
    Alert.alert('View Verse', `Viewing ${reference}`);
  };

  const renderBookmarkItem = ({ item }: { item: typeof mockBookmarks[0] }) => (
    <View style={tw`bg-[${colors.surface}] rounded-xl p-4 mb-3`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <TouchableOpacity 
          onPress={() => handleViewVerse(item.reference)}
          style={tw`flex-1`}
        >
          <Text style={tw`text-[${colors.primary}] font-semibold text-lg`}>
            {item.reference}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeleteBookmark(item.id)}
          style={tw`p-1`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={tw`text-[${colors.text.primary}] mb-2`}>
        {item.text}
      </Text>
      <Text style={tw`text-[${colors.text.light}] text-xs`}>
        Bookmarked on {item.date.toLocaleDateString()}
      </Text>
    </View>
  );

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
          My Bookmarks
        </Text>
      </View>

      <ScrollView style={tw`flex-1`}>
        {loading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : bookmarks.length > 0 ? (
          <FlatList
            data={bookmarks}
            renderItem={renderBookmarkItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={tw`p-4`}
          />
        ) : (
          <View style={tw`flex-1 justify-center items-center p-4`}>
            <Ionicons name="bookmark-outline" size={64} color={colors.text.light} />
            <Text style={tw`text-[${colors.text.secondary}] text-center mt-4 text-lg`}>
              You haven't bookmarked any verses yet
            </Text>
            <Text style={tw`text-[${colors.text.light}] text-center mt-2`}>
              When you bookmark a verse, it will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 