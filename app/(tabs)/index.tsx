import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { ChatInterface } from '../../components/ChatInterface';
import { ChatHistory } from '../../components/ChatHistory';
import { NavigationBar } from '../../components/NavigationBar';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header with Sign Out */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>
          Scripture AI
        </Text>
        <TouchableOpacity
          onPress={handleSignOut}
          style={tw`flex-row items-center ${isLoading || authLoading ? 'opacity-50' : ''}`}
          disabled={isLoading || authLoading}
        >
          {isLoading || authLoading ? (
            <ActivityIndicator color="#3b82f6" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color="#3b82f6" />
              <Text style={tw`ml-2 text-blue-600`}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <ChatHistory 
          onSelectChat={() => {}} 
          onDeleteChat={() => {}} 
          loading={isLoading}
        />
      ) : (
        <ChatInterface  />
      )}

      <NavigationBar
        showHistory={showHistory}
        onToggleView={() => setShowHistory(!showHistory)}
        disabled={isLoading || authLoading}
      />
    </View>
  );
}
