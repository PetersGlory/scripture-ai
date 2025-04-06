import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export const useChat = () => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentChat(newChat);
    setError(null);
    return newChat;
  }, []);

  const addMessage = useCallback(async (content: string, role: 'user' | 'assistant') => {
    if (!currentChat) return;

    const newMessage: Message = {
      role,
      content,
      timestamp: Date.now(),
    };

    const updatedChat: Chat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      updatedAt: Date.now(),
    };

    setCurrentChat(updatedChat);

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(`chat_${updatedChat.id}`, JSON.stringify(updatedChat));
    } catch (err) {
      setError('Failed to save chat');
      console.error('Error saving chat:', err);
    }
  }, [currentChat]);

  const loadChat = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const chatData = await AsyncStorage.getItem(`chat_${chatId}`);
      if (chatData) {
        const chat = JSON.parse(chatData) as Chat;
        setCurrentChat(chat);
      } else {
        setError('Chat not found');
      }
    } catch (err) {
      setError('Failed to load chat');
      console.error('Error loading chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateChatTitle = useCallback(async (title: string) => {
    if (!currentChat) return;

    const updatedChat: Chat = {
      ...currentChat,
      title,
      updatedAt: Date.now(),
    };

    setCurrentChat(updatedChat);

    try {
      await AsyncStorage.setItem(`chat_${updatedChat.id}`, JSON.stringify(updatedChat));
    } catch (err) {
      setError('Failed to update chat title');
      console.error('Error updating chat title:', err);
    }
  }, [currentChat]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await AsyncStorage.removeItem(`chat_${chatId}`);
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
    } catch (err) {
      setError('Failed to delete chat');
      console.error('Error deleting chat:', err);
    }
  }, [currentChat]);

  return {
    currentChat,
    isLoading,
    error,
    createNewChat,
    addMessage,
    loadChat,
    updateChatTitle,
    deleteChat,
  };
}; 