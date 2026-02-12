import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView
} from 'react-native';
import tw from 'twrnc';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { getSessions } from '../../services/api';
import CustomAlert from '../../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_COLOR } from '@/constants/Colors';

type ChatSession = {
  id: string;
  sessionId: string;
  title: string;
  lastMessage: string;
  createdAt: string;
};

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
      if (!user?.token) return;
      setLoading(true);
      
      const data = await getSessions(user.token);
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (error: any) {
      console.error('Error loading chat history:', error.response?.data);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load chat history. Please try again.',
        type: 'error',
      });
      if (error.response?.status === 401) {
        AsyncStorage.clear();
        router.push('/sign-in');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const renderHistoryItem = ({ item, index }: { item: ChatSession; index: number }) => (
    <View>
      <TouchableOpacity 
        style={tw`flex-row items-center bg-[${colors.surface}] rounded-2xl p-4 mb-3 border border-[${colors.border}]`}
        onPress={() => router.push({
          pathname: '/(tabs)',
          params: {
            sessionId: item.sessionId,
            title: item.title,
          },
        })}
      >
        <View style={tw`w-10 h-10 rounded-full bg-[${colors.primary}]/10 items-center justify-center mr-3`}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
        </View>
        <View style={tw`flex-1 mr-3`}>
          <Text style={tw`text-base font-medium text-[${colors.text.primary}] mb-1`} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-sm text-[${colors.text.secondary}] flex-1 mr-2`} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            <Text style={tw`text-xs text-[${colors.text.light}]`}>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
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
        <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-2`}>
          No Chat History
        </Text>
        <Text style={tw`text-center text-[${colors.text.secondary}] mb-6`}>
          Start a new conversation with Scripture AI
        </Text>
        <TouchableOpacity
          style={tw`bg-[${colors.primary}] px-6 py-3 rounded-2xl flex-row items-center`}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="add" size={20} color="white" style={tw`mr-2`} />
          <Text style={tw`text-white font-semibold`}>Start New Chat</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={tw`flex-1 py-5 bg-[${colors.background}]`}>
      {/* Header */}
      <View style={tw`px-4 pt-3 pb-3 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-xl font-bold text-gray-800`}>
            Chat History
          </Text>
          <TouchableOpacity 
            style={tw`w-10 h-10 rounded-full bg-blue-50 items-center justify-center`}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="add" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={tw`mt-4 text-[${colors.text.secondary}]`}>
            Loading history...
          </Text>
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
        <EmptyState />
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