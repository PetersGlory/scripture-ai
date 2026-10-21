import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL =  'http://192.168.0.103:5055/api';// 'https://scripture-ai-backend.onrender.com/api';
const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the auth token (secure storage, with legacy AsyncStorage fallback)
api.interceptors.request.use(
  async (config) => {
    try {
      let token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        token = await AsyncStorage.getItem('token');
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Central 401 handling: registered by the app shell (clears session + redirects).
// Sign-in/sign-up attempts are excluded — a 41 here just means bad credentials.
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthAttempt = url.includes('/auth/signin') || url.includes('/auth/signup');
      if (!isAuthAttempt && onUnauthorized) {
        onUnauthorized();
      }
    }
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
};

// Trivia
export const triviaService = {
  generateTriviaQuestions: async (
    category: string,
    difficulty: string,
    count: number = 5
  ) => {
    const response = await api.post('/trivia/generate', { category, difficulty, count });
    return response.data;
  },
  getTriviaCategories: async () => {
    const response = await api.get('/trivia/categories');
    return response.data;
  }
};

// Chat AI
export const chatWithAi = async (data: { message: string; sessionId?: string }) => {
  const response = await api.post('/chats', data);
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/chats/sessions');
  return response.data;
};

export const getChatMessages = async (sessionId: string) => {
  const response = await api.get(`/chats/session/${sessionId}`);
  return response.data;
};

export const deleteChatSession = async (sessionId: string) => {
  const response = await api.delete(`/chats/session/${sessionId}`);
  return response.data;
};

// Achievements/Badges
export const getUserAchievements = async () => {
  const response = await api.get('/achievements');
  return response.data;
};

export const updateGameStats = async (gameData: {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  isPerfect: boolean;
  longestStreak: number;
}) => {
  const response = await api.post('/achievements/update-stats', gameData);
  return response.data;
};

// Bible
export const getBibleBooks = async () => {
  const response = await api.get('/bible/books');
  return response.data;
};

export const getBiblePassage = async (reference: string, version: string = 'kjv') => {
  const response = await api.get(`/bible/passage/${encodeURIComponent(reference)}`, {
    params: { version }
  });
  return response.data;
};

export const getBibleChapter = async (book: string, chapter: number, version: string = 'kjv') => {
  const response = await api.get(`/bible/chapter/${book}/${chapter}`, {
    params: { version }
  });
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get('/bible/bookmarks');
  return response.data;
};

export const createBookmark = async (data: {
  book: string;
  chapter: number;
  verse?: number;
  version?: string;
  note?: string;
}) => {
  const response = await api.post('/bible/bookmarks', data);
  return response.data;
};

export const deleteBookmark = async (id: number | string) => {
  const response = await api.delete(`/bible/bookmarks/${id}`);
  return response.data;
};

export const getHighlights = async () => {
  const response = await api.get('/bible/highlights');
  return response.data;
};

export const createHighlight = async (data: {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  color?: string;
  version?: string;
  note?: string;
}) => {
  const response = await api.post('/bible/highlights', data);
  return response.data;
};

export const deleteHighlight = async (id: number | string) => {
  const response = await api.delete(`/bible/highlights/${id}`);
  return response.data;
};
