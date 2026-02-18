import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import CustomAlert from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const handleSignIn = async () => {
    if (!email || !password) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Please fill in all fields',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await signIn(email, password);
      if(response){
        router.replace('/(tabs)');
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to sign in. Please check your credentials.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 py-5 bg-white`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={tw`flex-grow px-6 py-8`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={tw`mb-6`}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Logo and Title */}
          <View style={tw`items-center mb-12`}>
            <View style={tw`w-24 h-24 rounded-3xl items-center justify-center mb-6 relative`}>
              {/* Replace with your logo */}
              <Image source={require('../assets/images/logo.png')} style={tw`w-24`} resizeMode="contain" />
              {/* <AppText style={tw`text-5xl`}>✝️</AppText> */}
            </View>
            
            <AppText style={tw`text-3xl text-gray-900 mb-2`} weight='bold'>
              Welcome Back
            </AppText>
            <AppText style={tw`text-gray-600 text-sm`} italic>
              Sign in to continue your spiritual journey
            </AppText>
          </View>

          {/* Form */}
          <View style={tw`gap-5`}>
            {/* Email Input */}
            <View>
              <AppText style={tw`text-gray-700 mb-2 font-medium text-sm`}>
                Email Address
              </AppText>
              <View style={tw`flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-200`}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 py-4 px-3 text-gray-900 text-base`}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <AppText style={tw`text-gray-700 mb-2 font-medium text-sm`}>
                Password
              </AppText>
              <View style={tw`flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-200`}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 py-4 px-3 text-gray-900 text-base`}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={tw`self-end`}>
              <AppText style={tw`text-[#4A7C59] font-medium text-sm`}>
                Forgot Password?
              </AppText>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={tw`bg-[#4A7C59] py-4 rounded-2xl mt-4 shadow-lg ${loading ? 'opacity-50' : ''}`}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <View style={tw`flex-row items-center justify-center`}>
                  <ActivityIndicator color="white" />
                  <AppText style={tw`text-white ml-2 text-base`}>
                    Signing in...
                  </AppText>
                </View>
              ) : (
                <AppText style={tw`text-white text-center text-base`}>
                  Sign In
                </AppText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={tw`flex-row items-center my-6`}>
              <View style={tw`flex-1 h-px bg-gray-200`} />
              <AppText style={tw`px-4 text-gray-500 text-sm`}>or</AppText>
              <View style={tw`flex-1 h-px bg-gray-200`} />
            </View>

          </View>

          {/* Sign Up Link */}
          <View style={tw`flex-row justify-center mb-3`}>
            <AppText style={tw`text-gray-600 text-base`}>
              Don't have an account?{' '}
            </AppText>
            <TouchableOpacity 
              onPress={() => router.push('/sign-up')}
              style={tw`active:opacity-60`}
            >
              <AppText style={tw`text-[#4A7C59] font-bold text-base`}>
                Sign Up
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}