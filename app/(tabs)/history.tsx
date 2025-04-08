import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import tw from 'twrnc';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { getSessions } from '../../services/api';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import CustomAlert from '../../components/CustomAlert';
import { BlurView } from 'expo-blur';

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
    } catch (error) {
      console.error('Error loading chat history:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load chat history. Please try again.',
        type: 'error',
      });
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
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      exiting={FadeOutUp}
    >
      <TouchableOpacity 
        style={tw`
          flex-row items-center
          bg-[${colors.surface}] rounded-2xl
          p-4 mb-3 border border-[${colors.border}]
        `}
        onPress={() => router.push({
          pathname: '/(tabs)',
          params: {
            sessionId: item.sessionId,
            title: item.title,
          },
        })}
      >
        <View style={tw`
          w-10 h-10 rounded-full
          bg-[${colors.primary}]/10
          items-center justify-center
          mr-3
        `}>
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
    </Animated.View>
  );

  const EmptyState = () => (
    <Animated.View 
      entering={FadeInDown}
      style={tw`flex-1 justify-center items-center p-8`}
    >
      <View style={tw`
        w-16 h-16 rounded-full 
        bg-[${colors.surface}] 
        items-center justify-center 
        mb-4
      `}>
        <Ionicons name="chatbubbles-outline" size={32} color={colors.text.light} />
      </View>
      <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] mb-2`}>
        No Chat History
      </Text>
      <Text style={tw`
        text-center text-[${colors.text.secondary}]
        mb-6
      `}>
        Start a new conversation with Scripture AI
      </Text>
      <TouchableOpacity
        style={tw`
          bg-[${colors.primary}] 
          px-6 py-3 rounded-2xl
          flex-row items-center
        `}
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="add" size={20} color="white" style={tw`mr-2`} />
        <Text style={tw`text-white font-semibold`}>Start New Chat</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[${colors.background}]`}>
      {/* Header */}
      <BlurView intensity={80} tint="systemMaterialDark" style={tw`overflow-hidden pt-6`}>
      <View style={tw`
        flex-row items-center justify-between 
        px-4 py-4 border-b border-[${colors.border}]
      `}>
        <Text style={tw`text-xl font-semibold text-[${colors.surface}]`}>
          Chat History
        </Text>
        <TouchableOpacity 
          style={tw`
            w-10 h-10 rounded-full
            bg-[${colors.surface}]
            items-center justify-center
          `}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      </BlurView>

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
          keyExtractor={(item) => item.id}
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

      {/* Custom Alert */}
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