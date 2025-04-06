import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat } from '../hooks/useChat';

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  loading: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelectChat, onDeleteChat, loading }) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(key => key.startsWith('chat_'));
      const chatData = await AsyncStorage.multiGet(chatKeys);
      
      const loadedChats = chatData
        .map(([_, value]) => value ? JSON.parse(value) as Chat : null)
        .filter((chat): chat is Chat => chat !== null)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      setChats(loadedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
          // setIsLoading(false);
          console.log('Chats loaded');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}
      onPress={() => onSelectChat(item.id)}
    >
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-medium text-gray-800`} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>
          {formatDate(item.updatedAt)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onDeleteChat(item.id)}
        style={tw`ml-4`}
      >
        <Ionicons name="trash-outline" size={20} color="#6B7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-gray-500`}>Loading your conversations...</Text>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={tw`flex-1 items-center justify-center p-4`}>
        <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
        <Text style={tw`mt-4 text-lg text-gray-500 text-center`}>
          No conversations yet
        </Text>
        <Text style={tw`mt-2 text-sm text-gray-400 text-center`}>
          Start a new conversation to see it here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={item => item.id}
      contentContainerStyle={tw`flex-grow`}
    />
  );
}; 