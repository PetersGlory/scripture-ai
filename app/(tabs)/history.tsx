import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { getSessions, deleteChatSession } from '../../services/api';
import CustomAlert from '../../components/CustomAlert';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { PRIMARY_COLOR } from '@/constants/Colors';
import AppText from '@/components/ui/AppText';

type ChatSession = {
  sessionId: string;
  title: string;
  lastMessage: string;
  messageCount?: number;
  createdAt: string;
  updatedAt?: string;
};

function EmptyState({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <ScrollView
      style={tw`flex-1 p-8`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={tw`items-center justify-center`}>
        <View style={tw`w-16 h-16 rounded-full bg-[${colors.surface}] items-center justify-center mb-4`}>
          <Ionicons name="chatbubbles-outline" size={32} color={colors.text.light} />
        </View>
        <AppText style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-2`}>
          No Chat History
        </AppText>
        <AppText style={tw`text-center text-[${colors.text.secondary}] mb-6`}>
          Start a new conversation with Scripture AI
        </AppText>
        <TouchableOpacity
          style={tw`bg-[${colors.primary}] px-6 py-3 rounded-2xl flex-row items-center`}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="add" size={20} color="white" style={tw`mr-2`} />
          <AppText style={tw`text-white font-semibold`}>Start New Chat</AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (error: any) {
      console.error('Error loading chat history:', error.response?.data);
      // A 401 is handled centrally by the api interceptor (clears the session
      // and the auth gate redirects) — no local sign-out needed here.
      if (error.response?.status !== 401) {
        setAlert({
          visible: true,
          title: 'Error',
          message: 'Failed to load chat history. Please try again.',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleDeleteSession = (item: ChatSession) => {
    Alert.alert(
      'Delete Chat',
      `Delete "${item.title || 'Untitled Conversation'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatSession(item.sessionId);
              setSessions((prev) =>
                prev.filter((s) => s.sessionId !== item.sessionId)
              );
            } catch (error) {
              console.error('Error deleting session:', error);
              setAlert({
                visible: true,
                title: 'Error',
                message: 'Failed to delete chat. Please try again.',
                type: 'error',
              });
            }
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: ChatSession }) => (
    <View style={tw`flex-row items-center bg-[${colors.surface}] rounded-2xl mb-3 border border-[${colors.border}]`}>
      <TouchableOpacity
        style={tw`flex-1 flex-row items-center p-4`}
        onPress={() => router.push({
          pathname: '/(tabs)',
          params: {
            sessionId: item.sessionId,
            title: item.title,
          },
        })}
        onLongPress={() => handleDeleteSession(item)}
        accessibilityRole="button"
        accessibilityHint="Opens this conversation"
      >
        <View style={tw`w-10 h-10 rounded-full bg-[${colors.primary}]/10 items-center justify-center mr-3`}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
        </View>
        <View style={tw`flex-1 mr-3`}>
          <AppText style={tw`text-sm text-[${colors.text.primary}] mb-1`} numberOfLines={1}>
            {item.title}
          </AppText>
          <View style={tw`flex-row justify-between items-center`}>
            <AppText style={tw`text-xs text-[${colors.text.secondary}] flex-1 mr-2`} numberOfLines={1}>
              {item.lastMessage}
            </AppText>
            <AppText style={tw`text-xs text-[${colors.text.light}]`}>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </AppText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`pr-4 py-4 pl-1`}
        onPress={() => handleDeleteSession(item)}
        accessibilityRole="button"
        accessibilityLabel={`Delete chat ${item.title}`}
      >
        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 py-5 bg-[${colors.background}]`}>
      <ScreenHeader
        title="Chat History"
        showBack={false}
        right={
          <TouchableOpacity
            style={tw`w-10 h-10 rounded-full bg-blue-50 items-center justify-center`}
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Start new chat"
          >
            <Ionicons name="add" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        }
      />

      {loading && !refreshing ? (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={tw`mt-4 text-[${colors.text.secondary}]`}>
            Loading history...
          </AppText>
        </View>
      ) : sessions.length > 0 ? (
        <FlatList
          data={sessions}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.sessionId}
          contentContainerStyle={tw`p-4`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <EmptyState refreshing={refreshing} onRefresh={onRefresh} />
      )}

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