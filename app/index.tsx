import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import tw from 'twrnc';
import { ChatInterface } from '../components/ChatInterface';
import { ChatHistory } from '../components/ChatHistory';
import { NavigationBar } from '../components/NavigationBar';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  const { user } = useAuth();

  if (user) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>Welcome back, {user.name}!</Text>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={tw`bg-blue-500 px-6 py-3 rounded-lg`}>
            <Text style={tw`text-white font-semibold`}>Continue to App</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 items-center justify-center bg-white p-4`}>
      <Image
        source={require('../assets/images/icon.png')}
        style={tw`w-32 h-32 mb-8`}
      />
      <Text style={tw`text-3xl font-bold mb-2`}>Scripture AI</Text>
      <Text style={tw`text-gray-600 text-center mb-8`}>
        Your AI-powered Bible companion for deeper understanding and spiritual growth
      </Text>
      
      <Link href="/sign-in" asChild>
        <TouchableOpacity style={tw`bg-blue-500 w-full px-6 py-3 rounded-lg mb-4`}>
          <Text style={tw`text-white font-semibold text-center`}>Sign In</Text>
        </TouchableOpacity>
      </Link>
      
      <Link href="/sign-up" asChild>
        <TouchableOpacity style={tw`border border-blue-500 w-full px-6 py-3 rounded-lg`}>
          <Text style={tw`text-blue-500 font-semibold text-center`}>Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
} 