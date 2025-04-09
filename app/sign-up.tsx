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

export default function SignUpScreen() {
  const router = useRouter();
  const { user, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Redirect if user is already signed in
  React.useEffect(() => {
    if (user !== null) {
      router.replace('/(tabs)');
    }
  }, [user]);

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

    setLoading(true);
    try {
      // Here you would typically call your authentication service
      const response = await signUp(email, password, name);

      if(response){
        // For now, we'll just simulate a successful signup
        await new Promise(resolve => setTimeout(resolve, 1000));
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
            style={tw`w-20 h-20 mb-4`}
            resizeMode="contain"
          />
          <Text style={tw`text-2xl font-bold text-[${colors.text.primary}]`}>
            Create Account
          </Text>
          <Text style={tw`text-[${colors.text.secondary}] mt-2`}>
            Join us today
          </Text>
        </View>

        {/* Form */}
        <View style={tw`space-y-4`}>
          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Full Name
            </Text>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                border border-[${colors.border}]
              `}
              placeholder="Enter your full name"
              placeholderTextColor={colors.text.light}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

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
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                border border-[${colors.border}]
              `}
              placeholder="Create a password"
              placeholderTextColor={colors.text.light}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Confirm Password
            </Text>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                border border-[${colors.border}]
              `}
              placeholder="Confirm your password"
              placeholderTextColor={colors.text.light}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={tw`
              bg-[${colors.primary}] p-4 rounded-xl mt-6
              ${loading ? 'opacity-50' : ''}
            `}
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
              <Text style={tw`text-white text-center font-semibold text-lg`}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-[${colors.text.secondary}]`}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={tw`text-[${colors.primary}] font-semibold`}>
              Sign In
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
        onConfirm={alert.onConfirm}
      />
    </KeyboardAvoidingView>
  );
} 