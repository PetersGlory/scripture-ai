import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { authService } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<boolean>;
  setUserData: (user: User | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (!err.response) return 'Network error. Please check your connection and try again.';
  }
  if (err instanceof Error && err.message && !err.message.startsWith('Request failed')) {
    return err.message;
  }
  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      let storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

      // Migrate legacy plaintext token from AsyncStorage to secure storage
      if (!storedToken) {
        const legacyToken = await AsyncStorage.getItem('token');
        if (legacyToken) {
          await SecureStore.setItemAsync(TOKEN_KEY, legacyToken);
          await AsyncStorage.removeItem('token');
          storedToken = legacyToken;
        }
      }

      if (!storedToken || !storedUser) {
        setUser(null);
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser({ ...userData, token: storedToken });
    } catch (err) {
      console.error('Error loading stored user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const persistSession = async (token: string, sessionUser: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
    setUser({ ...sessionUser, token });
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.signIn({ email, password });
      const { token, user: signedInUser } = response;
      await persistSession(token, signedInUser);
      return { ok: true };
    } catch (err) {
      const message = getApiErrorMessage(err, 'An error occurred during sign in');
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.signUp({ email, password, name });
      const { token, user: createdUser } = response;
      await persistSession(token, createdUser);
      return { ok: true };
    } catch (err) {
      const message = getApiErrorMessage(err, 'An error occurred during sign up');
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      return true;
    } catch (err) {
      console.error('Error during sign out:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setUserData = (nextUser: User | null) => {
    setUser(nextUser);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        clearError,
        setUserData,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
