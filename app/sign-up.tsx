import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading, error, clearError } = useAuth();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signUp(email, password, name);
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <View style={tw`flex-1 justify-center p-6 bg-white`}>
      <Text style={tw`text-3xl font-bold text-center mb-8 text-gray-800`}>
        Create Account
      </Text>

      {error && (
        <View style={tw`bg-red-50 p-4 rounded-lg mb-4`}>
          <Text style={tw`text-red-600 text-center`}>{error}</Text>
        </View>
      )}

      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 mb-2`}>Name</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3`}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 mb-2`}>Email</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3`}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-gray-700 mb-2`}>Password</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3`}
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <View style={tw`mb-6`}>
        <Text style={tw`text-gray-700 mb-2`}>Confirm Password</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3`}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={tw`bg-blue-500 p-4 rounded-lg mb-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <View style={tw`flex-row items-center justify-center`}>
            <ActivityIndicator color="white" />
            <Text style={tw`text-white text-center font-medium ml-2`}>
              Creating account...
            </Text>
          </View>
        ) : (
          <Text style={tw`text-white text-center font-medium`}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={tw`flex-row justify-center`}>
        <Text style={tw`text-gray-600`}>Already have an account? </Text>
        <Link href="/sign-in" asChild>
          <TouchableOpacity disabled={loading}>
            <Text style={tw`text-blue-500 ${loading ? 'opacity-50' : ''}`}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
} 