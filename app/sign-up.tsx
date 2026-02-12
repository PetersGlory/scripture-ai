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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Please fill in all fields',
        type: 'error',
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Passwords do not match',
        type: 'error',
      });
      return;
    }

    if (password.length < 6) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Password must be at least 6 characters',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await signUp(email, password, name);

      if(response){
        setAlert({
          visible: true,
          title: 'Success',
          message: 'Account created successfully!',
          type: 'success',
          onConfirm: () => router.replace('/(tabs)'),
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to create account. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
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
          <View style={tw`items-center mb-10`}>
            <View style={tw`w-24 h-24 rounded-3xl bg-[#4A7C59] items-center justify-center mb-6 shadow-lg`}>
              {/* Replace with your logo */}
              {/* <Image source={require('../assets/images/logo.png')} style={tw`w-16 h-16`} resizeMode="contain" /> */}
              <Text style={tw`text-5xl`}>✝️</Text>
            </View>
            
            <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
              Create Account
            </Text>
            <Text style={tw`text-gray-600 text-base`}>
              Start your spiritual journey today
            </Text>
          </View>

          {/* Form */}
          <View style={tw`gap-4`}>
            {/* Name Input */}
            <View>
              <Text style={tw`text-gray-700 mb-2 font-medium text-sm`}>
                Full Name
              </Text>
              <View style={tw`flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-200`}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 py-4 px-3 text-gray-900 text-base`}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text style={tw`text-gray-700 mb-2 font-medium text-sm`}>
                Email Address
              </Text>
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
              <Text style={tw`text-gray-700 mb-2 font-medium text-sm`}>
                Password
              </Text>
              <View style={tw`flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-200`}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 py-4 px-3 text-gray-900 text-base`}
                  placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <View>
              <Text style={tw`text-gray-700 mb-2 font-medium text-sm`}>
                Confirm Password
              </Text>
              <View style={tw`flex-row items-center bg-gray-50 rounded-2xl px-4 border border-gray-200`}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 py-4 px-3 text-gray-900 text-base`}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Agreement */}
            <View style={tw`flex-row items-start mt-2`}>
              <Text style={tw`text-gray-600 text-xs leading-5`}>
                By signing up, you agree to our{' '}
                <Text style={tw`text-[#4A7C59] font-semibold`}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={tw`text-[#4A7C59] font-semibold`}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={tw`bg-[#4A7C59] py-4 rounded-2xl mt-4 shadow-lg ${loading ? 'opacity-50' : ''}`}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <View style={tw`flex-row items-center justify-center`}>
                  <ActivityIndicator color="white" />
                  <Text style={tw`text-white font-bold ml-2 text-base`}>
                    Creating account...
                  </Text>
                </View>
              ) : (
                <Text style={tw`text-white text-center font-bold text-base`}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={tw`flex-row items-center my-6`}>
              <View style={tw`flex-1 h-px bg-gray-200`} />
              <Text style={tw`px-4 text-gray-500 text-sm`}>or</Text>
              <View style={tw`flex-1 h-px bg-gray-200`} />
            </View>

            {/* Social Login Buttons */}
            <View style={tw`gap-3`}>
              <TouchableOpacity
                style={tw`flex-row items-center justify-center bg-white border border-gray-200 py-3.5 rounded-2xl`}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={tw`text-gray-700 font-semibold ml-2 text-base`}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-row items-center justify-center bg-white border border-gray-200 py-3.5 rounded-2xl`}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={tw`text-gray-700 font-semibold ml-2 text-base`}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Link */}
          <View style={tw`flex-row justify-center mt-8 mb-4`}>
            <Text style={tw`text-gray-600 text-base`}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/sign-in')}
              style={tw`active:opacity-60`}
            >
              <Text style={tw`text-[#4A7C59] font-bold text-base`}>
                Sign In
              </Text>
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
        onConfirm={alert.onConfirm}
      />
    </SafeAreaView>
  );
}