import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <View style={tw`flex-1 justify-center p-6 bg-white`}>
      <Text style={tw`text-3xl font-bold text-center mb-8 text-gray-800`}>
        Welcome Back
      </Text>

      {error && (
        <View style={tw`bg-red-50 p-4 rounded-lg mb-4`}>
          <Text style={tw`text-red-600 text-center`}>{error}</Text>
        </View>
      )}

      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 mb-2`}>Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3`}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={tw`mb-6`}>
        <Text style={tw`text-gray-700 mb-2`}>Password</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3`}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={tw`bg-blue-500 p-4 rounded-lg mb-4`}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={tw`text-white text-center font-medium`}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <View style={tw`flex-row justify-center`}>
        <Text style={tw`text-gray-600`}>Don't have an account? </Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text style={tw`text-blue-500`}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
} 