import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);

  const handlePickImage = async () => {
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
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically call your API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={tw`flex-1 pt-6 bg-[${colors.background}]`}>
      <View style={tw`p-4`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-6`}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={tw`p-2`}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
            Edit Profile
          </Text>
        </View>

        {/* Profile Photo */}
        <View style={tw`items-center mb-6`}>
          <TouchableOpacity 
            onPress={handlePickImage}
            style={tw`
              w-24 h-24 rounded-full 
              bg-[${colors.surface}]
              items-center justify-center
              mb-3
            `}
          >
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={tw`w-24 h-24 rounded-full`}
              />
            ) : (
              <Text style={tw`
                text-4xl font-bold
                text-[${colors.primary}]
              `}>
                {name?.[0]?.toUpperCase() || 'U'}
              </Text>
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
          <Text style={tw`text-[${colors.text.secondary}]`}>
            Tap to change photo
          </Text>
        </View>

        {/* Form */}
        <View style={tw`space-y-4`}>
          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Name
            </Text>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
              `}
              placeholder="Enter your name"
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
              `}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.light}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
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
              <Text style={tw`text-white font-semibold ml-2`}>
                Saving...
              </Text>
            </View>
          ) : (
            <Text style={tw`text-white text-center font-semibold text-lg`}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}