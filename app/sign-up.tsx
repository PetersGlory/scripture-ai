import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'expo-router';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView style={tw`flex-1 bg-[${colors.background}]`}>
      <View style={tw`p-6 flex-1`}>
        {/* Back Button */}
        <Link href="/" asChild>
          <TouchableOpacity 
            style={tw`flex-row items-center mb-6`}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            <Text style={tw`ml-2 text-[${colors.text.primary}]`}>Back</Text>
          </TouchableOpacity>
        </Link>

        <View style={tw`items-center mb-12`}>
          <Image
            source={require('../assets/images/logo.jpeg')}
            style={tw`w-16 h-16 mb-4`}
            resizeMode="contain"
          />
          <Text style={tw`text-3xl font-bold text-[${colors.text.primary}]`}>
            Create Account
          </Text>
        </View>

        {error && (
          <View style={tw`bg-red-50 p-4 rounded-xl mb-4`}>
            <Text style={tw`text-red-600 text-center`}>{error}</Text>
          </View>
        )}

        <View style={tw`space-y-4 mb-6`}>
          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>Name</Text>
            <TextInput
              style={tw`bg-[${colors.surface}] rounded-xl p-4 text-[${colors.text.primary}]`}
              placeholder="Enter your name"
              placeholderTextColor={colors.text.light}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>Email</Text>
            <TextInput
              style={tw`bg-[${colors.surface}] rounded-xl p-4 text-[${colors.text.primary}]`}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.light}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>Password</Text>
            <TextInput
              style={tw`bg-[${colors.surface}] rounded-xl p-4 text-[${colors.text.primary}]`}
              placeholder="Create a password"
              placeholderTextColor={colors.text.light}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>Confirm Password</Text>
            <TextInput
              style={tw`bg-[${colors.surface}] rounded-xl p-4 text-[${colors.text.primary}]`}
              placeholder="Confirm your password"
              placeholderTextColor={colors.text.light}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={tw`bg-[${colors.primary}] p-4 rounded-xl mb-4 ${loading ? 'opacity-50' : ''}`}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator color="white" />
              <Text style={tw`text-white font-semibold ml-2`}>
                Creating account...
              </Text>
            </View>
          ) : (
            <Text style={tw`text-white text-center font-semibold text-lg`}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={tw`flex-row justify-center`}>
          <Text style={tw`text-[${colors.text.secondary}]`}>Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={tw`text-[${colors.primary}] font-semibold ${loading ? 'opacity-50' : ''}`}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
} 