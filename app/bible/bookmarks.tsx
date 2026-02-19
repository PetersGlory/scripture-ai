// app/bible/bookmarks.tsx
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
import { useAuth } from '@/contexts/AuthContext';
import { getBookmarks, deleteBookmark } from '@/services/api';
import CustomAlert from '@/components/CustomAlert';

export default function BookmarksScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks(user?.token || '');
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBookmark(id, user?.token || '');
      setBookmarks(bookmarks.filter((b: any) => b.id !== id));
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Bookmark deleted successfully',
        type: 'success',
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to delete bookmark',
        type: 'error',
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
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
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`mr-4`}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <AppText style={tw`text-2xl text-gray-900 mb-1`} weight="bold">
              Bookmarks
            </AppText>
            <AppText style={tw`text-gray-600 text-sm`}>
              {bookmarks.length} saved {bookmarks.length === 1 ? 'verse' : 'verses'}
            </AppText>
          </View>
        </View>
      </View>

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
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark: any) => (
            <View
              key={bookmark.id}
              style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-200`}
            >
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/bible/reader' as never,
                  params: {
                    book: bookmark.book,
                    chapter: bookmark.chapter,
                    verse: bookmark.verse
                  }
                })}
              >
                <View style={tw`flex-row items-start justify-between mb-2`}>
                  <AppText style={tw`text-gray-900 text-base`} weight="bold">
                    {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                  </AppText>
                  <TouchableOpacity onPress={() => handleDelete(bookmark.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {bookmark.note && (
                  <AppText style={tw`text-gray-600 text-sm mb-2`}>
                    {bookmark.note}
                  </AppText>
                )}

                <AppText style={tw`text-gray-500 text-xs`}>
                  {new Date(bookmark.createdAt).toLocaleDateString()}
                </AppText>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={tw`items-center py-12`}>
            <View style={tw`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4`}>
              <Ionicons name="bookmark-outline" size={32} color="#9CA3AF" />
            </View>
            <AppText style={tw`text-gray-900 text-lg mb-2`} weight="bold">
              No Bookmarks Yet
            </AppText>
            <AppText style={tw`text-gray-600 text-center`}>
              Start bookmarking verses while reading
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