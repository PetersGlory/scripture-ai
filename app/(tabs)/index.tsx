import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';
import { ChatInterface } from '../../components/ChatInterface';
import { ChatHistory } from '../../components/ChatHistory';
import { NavigationBar } from '../../components/NavigationBar';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [showHistory, setShowHistory] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header with Sign Out */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>
          Scripture AI
        </Text>
        <TouchableOpacity
          onPress={signOut}
          style={tw`flex-row items-center`}
        >
          <Ionicons name="log-out-outline" size={24} color="#3b82f6" />
          <Text style={tw`ml-2 text-blue-600`}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <ChatHistory onSelectChat={() => {}} onDeleteChat={() => {}} />
      ) : (
        <ChatInterface />
      )}

      <NavigationBar
        showHistory={showHistory}
        onToggleView={() => setShowHistory(!showHistory)}
      />
    </View>
  );
}
