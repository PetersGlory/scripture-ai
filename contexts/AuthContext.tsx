import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    console.log('loadStoredUser')
    setLoading(true);
    if(signedOut){
      setUser(null);
      setSignedOut(false);
      return;
    }
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser({ ...userData, token: storedToken });
      }
    } catch (err) {
      console.error('Error loading stored user:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.signIn({ email, password });
      console.log(response)
      const { token, user } = response;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser({ ...user, token });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.signUp({ email, password, name });
      const { token, user } = response;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser({ ...user, token });
      return true;
    } catch (err:any) {
      console.log(err.response.data);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setSignedOut(true);
    try {
      setLoading(true);
      // First clear AsyncStorage
      await AsyncStorage.multiRemove(['user', 'token']);
      // Then clear the user state
      setUser(null);
      setError(null);
      console.log('Successfully signed out');
      loadStoredUser();
      return true;
    } catch (err) {
      console.error('Error during sign out:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign out');
      return false;
    } finally {
      setLoading(false);
    }
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