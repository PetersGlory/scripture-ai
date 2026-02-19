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

// Trivia

export const triviaService = {
  generateTriviaQuestions: async (
    category: string,
    difficulty: string,
    count: number = 5
  ) => {
    try {
      const response = await api.post(
        `/trivia/generate`,
        { category, difficulty, count },
      );
      return response.data;
    } catch (error) {
      console.error('Error generating trivia questions:', error);
      throw error;
    }
  },
  getTriviaCategories: async () => {
    try {
      const response = await api.get(`/trivia/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trivia categories:', error);
      throw error;
    }
  }
};


// chat AI
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


// Acheivements/Badges
export const getUserAchievements = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/achievements`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

export const updateGameStats = async (
  gameData: {
    score: number;
    questionsAnswered: number;
    correctAnswers: number;
    isPerfect: boolean;
    longestStreak: number;
  },
  token: string
) => {
  try {
    const response = await axios.post(
      `${API_URL}/achievements/update-stats`,
      gameData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
};

// services/api.ts

export const getBibleBooks = async () => {
  const response = await axios.get(`${API_URL}/bible/books`);
  return response.data;
};

export const getBibleVersions = async () => {
  const response = await axios.get(`${API_URL}/bible/versions`);
  return response.data;
};

export const getBiblePassage = async (reference: string, version: string = 'kjv') => {
  const response = await axios.get(`${API_URL}/bible/passage/${encodeURIComponent(reference)}`, {
    params: { version }
  });
  return response.data;
};

export const getBibleChapter = async (book: string, chapter: number, version: string = 'kjv') => {
  const response = await axios.get(`${API_URL}/bible/chapter/${book}/${chapter}`, {
    params: { version }
  });
  console.log("this is the  resesponse: ", response.data)
  return response.data;
};

export const getBookmarks = async (token: string) => {
  const response = await axios.get(`${API_URL}/bible/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createBookmark = async (data: any, token: string) => {
  const response = await axios.post(`${API_URL}/bible/bookmarks`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteBookmark = async (id: number, token: string) => {
  const response = await axios.delete(`${API_URL}/bible/bookmarks/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getHighlights = async (token: string) => {
  const response = await axios.get(`${API_URL}/bible/highlights`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createHighlight = async (data: any, token: string) => {
  const response = await axios.post(`${API_URL}/bible/highlights`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteHighlight = async (id: number, token: string) => {
  const response = await axios.delete(`${API_URL}/bible/highlights/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};