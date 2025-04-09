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
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import CustomAlert from '../components/CustomAlert';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const router = useRouter();
  // const { user } = useAuth();
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

  // Redirect if user is already signed in
  // React.useEffect(() => {
  //   console.log(user);
  //   if (user !== null) {
  //     router.replace('/(tabs)');
  //   }
  // }, [user]);

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
      // Here you would typically call your authentication service
      const response = await signIn(email, password);
      // For now, we'll just simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      if(response){
        router.replace('/(tabs)');
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to sign in. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-[${colors.background}]`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={tw`flex-1 p-4 justify-center`}>
        {/* Logo and Title */}
        <View style={tw`items-center mb-8`}>
          <Image
            source={require('../assets/images/logo.jpeg')}
            style={tw`w-20 h-20 mb-4 rounded-2xl`}
            resizeMode="contain"
          />
          <Text style={tw`text-2xl font-bold text-[${colors.text.primary}]`}>
            Welcome Back
          </Text>
          <Text style={tw`text-[${colors.text.secondary}] mt-2`}>
            Sign in to continue
          </Text>
        </View>

        {/* Form */}
        <View style={tw`space-y-4`}>
          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Email
            </Text>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                border border-[${colors.border}]
              `}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.light}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Password
            </Text>
            <View style={tw`relative`}>
              <TextInput
                style={tw`
                  bg-[${colors.surface}] p-4 rounded-xl
                  text-[${colors.text.primary}]
                  border border-[${colors.border}]
                  pr-12
                `}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={tw`absolute right-4 h-full justify-center`}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={colors.text.light}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={tw`
              bg-[${colors.primary}] p-4 rounded-xl mt-6
              ${loading ? 'opacity-50' : ''}
              shadow-lg shadow-[${colors.primary}]/20
            `}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <View style={tw`flex-row items-center justify-center`}>
                <ActivityIndicator color="white" />
                <Text style={tw`text-white font-semibold ml-2`}>
                  Signing in...
                </Text>
              </View>
            ) : (
              <Text style={tw`text-white text-center font-semibold text-lg`}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-[${colors.text.secondary}]`}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/sign-up')}
            style={tw`active:opacity-60`}
          >
            <Text style={tw`text-[${colors.primary}] font-semibold`}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </KeyboardAvoidingView>
  );
} 