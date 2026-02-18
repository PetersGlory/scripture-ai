import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import AppText from '@/components/ui/AppText';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
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
  const [isPickingImage, setIsPickingImage] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    setIsPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Here you would typically upload the image to your server
        // and get back a URL
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to update profile photo',
        type: 'error',
      });
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Here you would typically call your API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success',
        onConfirm: () => router.back(),
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to update profile',
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
      <ScrollView style={tw`flex-1 pt-6`}>
        <View style={tw`p-4`}>
          {/* Header */}
          <View style={tw`flex-row items-center mb-6`}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={tw`p-2`}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <AppText style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
              Edit Profile
            </AppText>
          </View>

          {/* Profile Photo */}
          <View style={tw`items-center mb-6`}>
            <TouchableOpacity 
              onPress={handlePickImage}
              disabled={isPickingImage}
              style={tw`
                w-24 h-24 rounded-full 
                bg-[${colors.surface}]
                items-center justify-center
                mb-3
                ${isPickingImage ? 'opacity-50' : ''}
              `}
            >
              {isPickingImage ? (
                <ActivityIndicator color={colors.primary} />
              ) : photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  style={tw`w-24 h-24 rounded-full`}
                />
              ) : (
                <AppText style={tw`
                  text-4xl font-bold
                  text-[${colors.primary}]
                `}>
                  {name?.[0]?.toUpperCase() || 'U'}
                </AppText>
              )}
              <View style={tw`
                absolute right-0 bottom-0
                w-8 h-8 rounded-full
                bg-[${colors.primary}]
                items-center justify-center
                border-4 border-[${colors.background}]
              `}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <AppText style={tw`text-[${colors.text.secondary}]`}>
              Tap to change photo
            </AppText>
          </View>

          {/* Form */}
          <View style={tw`space-y-4`}>
            <View>
              <AppText style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
                Name
              </AppText>
              <TextInput
                style={tw`
                  bg-[${colors.surface}] p-4 rounded-xl
                  text-[${colors.text.primary}]
                  ${errors.name ? 'border border-[${colors.error}]' : ''}
                `}
                placeholder="Enter your name"
                placeholderTextColor={colors.text.light}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                editable={!loading}
              />
              {errors.name && (
                <AppText style={tw`text-[${colors.error}] text-sm mt-1`}>
                  {errors.name}
                </AppText>
              )}
            </View>

            <View>
              <AppText style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
                Email
              </AppText>
              <TextInput
                style={tw`
                  bg-[${colors.surface}] p-4 rounded-xl
                  text-[${colors.text.primary}]
                  ${errors.email ? 'border border-[${colors.error}]' : ''}
                `}
                placeholder="Enter your email"
                placeholderTextColor={colors.text.light}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.email && (
                <AppText style={tw`text-[${colors.error}] text-sm mt-1`}>
                  {errors.email}
                </AppText>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={tw`
              bg-[${colors.primary}] p-4 rounded-xl mt-6
              ${loading ? 'opacity-50' : ''}
            `}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <View style={tw`flex-row items-center justify-center`}>
                <ActivityIndicator color="white" />
                <AppText style={tw`text-white font-semibold ml-2`}>
                  Saving...
                </AppText>
              </View>
            ) : (
              <AppText style={tw`text-white text-center font-semibold text-lg`}>
                Save Changes
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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