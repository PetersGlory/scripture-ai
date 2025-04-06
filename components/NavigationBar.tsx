import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

interface NavigationBarProps {
  showHistory: boolean;
  onToggleView: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  showHistory,
  onToggleView,
}) => {
  return (
    <View style={tw`flex-row items-center justify-between p-4 border-t border-gray-200`}>
      <TouchableOpacity
        onPress={onToggleView}
        style={tw`flex-row items-center`}
      >
        <Ionicons
          name={showHistory ? 'chatbubbles-outline' : 'time-outline'}
          size={24}
          color="#3b82f6"
        />
        <Text style={tw`ml-2 text-blue-600`}>
          {showHistory ? 'Back to Chat' : 'Chat History'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 