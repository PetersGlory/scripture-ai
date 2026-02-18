import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '@/components/ui/AppText';

type Bookmark = {
  id: string;
  sessionId: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  messages: any[];
};

export default function BookmarksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const bookmarkedSessions = await AsyncStorage.getItem('bookmarkedSessions');
      if (bookmarkedSessions) {
        const sessions = JSON.parse(bookmarkedSessions);
        setBookmarks(sessions);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      Alert.alert('Error', 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
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
          onPress: async () => {
            try {
              const updatedBookmarks = bookmarks.filter(bookmark => bookmark.sessionId !== id);
              await AsyncStorage.setItem('bookmarkedSessions', JSON.stringify(updatedBookmarks));
              setBookmarks(updatedBookmarks);
            } catch (error) {
              console.error('Error deleting bookmark:', error);
              Alert.alert('Error', 'Failed to delete bookmark');
            }
          },
        },
      ]
    );
  };

  const handleViewBookmark = (bookmark: Bookmark) => {
    router.push({
      pathname: '/(tabs)',
      params: {
        sessionId: bookmark.sessionId,
        title: bookmark.title,
      },
    });
  };

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <View style={tw`bg-[${colors.surface}] rounded-xl p-4 mb-3`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <TouchableOpacity 
          onPress={() => handleViewBookmark(item)}
          style={tw`flex-1`}
        >
          <AppText  style={tw`text-[${colors.primary}] font-semibold text-lg`}>
            {item.title}
          </AppText >
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeleteBookmark(item.sessionId)}
          style={tw`p-1`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <AppText  style={tw`text-[${colors.text.primary}] mb-2`}>
        {item.lastMessage.slice(0, 100)}...
      </AppText >
      <AppText  style={tw`text-[${colors.text.light}] text-xs`}>
        Bookmarked on {new Date(item.createdAt).toLocaleDateString()}
      </AppText >
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
        <AppText  style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
          My Bookmarks
        </AppText >
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
            keyExtractor={(item) => item.sessionId}
            contentContainerStyle={tw`p-4`}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadBookmarks} />
            }
          />
        ) : (
          <View style={tw`flex-1 justify-center items-center p-4`}>
            <Ionicons name="bookmark-outline" size={64} color={colors.text.light} />
            <AppText  style={tw`text-[${colors.text.secondary}] text-center mt-4 text-lg`}>
              You haven't bookmarked any conversations yet
            </AppText >
            <AppText  style={tw`text-[${colors.text.light}] text-center mt-2`}>
              When you bookmark a conversation, it will appear here
            </AppText >
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}