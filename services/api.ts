import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://scripture-ai-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export const authService = {
  signUp: async (userData: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  signIn: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },

  signOut: async () => {
    const response = await api.post('/auth/signout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const chatService = {
  getChatHistory: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  createChat: async (message: string) => {
    const response = await api.post('/chats', { message });
    return response.data;
  },

  deleteChat: async (chatId: string) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },
};

export const chatWithAi = async (data: { 
  message: string; 
  sessionId?: string; 
  context?: any; 
}, token: string) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await api.post('/chats', data, config);
  return response.data;
};

export const getSessions = async (token: string) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await api.get('/chats/sessions', config);
  return response.data;
};

export const getChatMessages = async (sessionId: string, token: string) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await api.get(`/chats/session/${sessionId}`, config);
  return response.data;
};
