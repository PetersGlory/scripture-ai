import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../hooks/useChat';

export const ChatInterface = () => {
  const {
    currentChat,
    isLoading,
    error,
    createNewChat,
    addMessage,
    loadChat,
  } = useChat();

  const [inputText, setInputText] = React.useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!currentChat) {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentChat) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    try {
      await addMessage(userMessage, 'user');
      
      // const response = await generateResponse(currentChat.messages);
      // await addMessage(response, 'assistant');
    } catch (err) {
      Alert.alert('Error', 'Failed to generate response. Please try again.');
    }
  };

  const handleNewChat = () => {
    createNewChat();
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>
          {currentChat?.title || 'Scripture AI'}
        </Text>
        <TouchableOpacity
          onPress={handleNewChat}
          style={tw`flex-row items-center bg-blue-50 px-3 py-1 rounded-full`}
        >
          <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
          <Text style={tw`ml-2 text-blue-600`}>New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={tw`flex-1 p-4`}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {currentChat?.messages.map((message, index) => (
          <View
            key={index}
            style={tw`mb-4 ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <View
              style={tw`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                style={tw`${
                  message.role === 'user' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {message.content}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={tw`items-start mb-4`}>
            <View style={tw`bg-gray-100 p-3 rounded-lg`}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={tw`text-gray-500 mt-2`}>Waiting on God's Word...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={tw`p-4 border-t border-gray-200`}>
        <View style={tw`flex-row items-center bg-gray-100 rounded-full px-4`}>
          <TextInput
            style={tw`flex-1 py-3 text-gray-800`}
            placeholder="Ask for wisdom..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={tw`ml-2 ${
              !inputText.trim() || isLoading ? 'opacity-50' : ''
            }`}
          >
            <Ionicons
              name="send"
              size={24}
              color={!inputText.trim() || isLoading ? '#9ca3af' : '#3b82f6'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}; 