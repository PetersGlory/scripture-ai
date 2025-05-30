import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { rateApp } from '../../utils/app-rating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-[${colors.text.light}] text-sm mb-2 px-4`}>
      {title}
    </Text>
    <View style={tw`bg-[${colors.surface}] rounded-2xl overflow-hidden`}>
      {children}
    </View>
  </View>
);

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showBorder?: boolean;
  danger?: boolean;
};

const SettingsItem = ({
  icon,
  label,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  showBorder = true,
  danger = false,
}: SettingsItemProps) => (
  <TouchableOpacity
    style={tw`
      flex-row items-center px-4 py-3
      ${showBorder ? `border-b border-[${colors.border}]` : ''}
    `}
    onPress={onPress}
    disabled={!onPress && !isSwitch}
  >
    <View style={tw`
      w-8 h-8 rounded-full 
      items-center justify-center
      ${danger ? 'bg-red-100' : `bg-[${colors.primary}]/10`}
    `}>
      <Ionicons
        name={icon}
        size={18}
        color={danger ? colors.error : colors.primary}
      />
    </View>
    <Text style={tw`
      flex-1 ml-3 text-base
      ${danger ? `text-[${colors.error}]` : `text-[${colors.text.primary}]`}
    `}>
      {label}
    </Text>
    {isSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    ) : value ? (
      <Text style={tw`text-[${colors.text.light}]`}>{value}</Text>
    ) : onPress ? (
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.text.light}
      />
    ) : null}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
        // and update the user's photoURL
        Alert.alert('Success', 'Profile photo updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handleSignOut = async () => {
      try {
        setLoading(true);
        await AsyncStorage.clear();
        // console.log('signOut')
        // const res = await signOut();

        await setUserData({
          id: '',
          email: '',
          name: '',
          token: '',
          photoURL: '',
        });
        router.replace('/sign-in');
      } catch (err:any) {
        console.log(err.response.data);
        return false;
      } finally {
        setLoading(false);
      }
    
  };

  const handleRateApp = () => {
    // Replace with your actual App Store ID
    rateApp('123456789');
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[${colors.background}]`}>
        <View style={tw`items-center space-y-4`}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={tw`text-[${colors.text.secondary}]`}>
            Loading Please Wait...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-[${colors.background}]`}>
      <BlurView intensity={80} tint="systemMaterialDark" style={tw`overflow-hidden pt-6`}>
      <View style={tw`
        flex-row items-center justify-between 
        px-4 py-4 border-b border-[${colors.border}]
      `}>
        <Text style={tw`text-xl font-semibold text-[${colors.surface}]`}>
          Profile
        </Text>
      </View>
      </BlurView>
      {/* Profile Header */}
      <View style={tw`items-center pt-6 pb-8`}>
        <View style={tw`relative`}>
          <TouchableOpacity 
            onPress={handlePickImage}
            style={tw`
              w-24 h-24 rounded-full 
              bg-[${colors.surface}]
              items-center justify-center
              mb-3
            `}
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={tw`w-24 h-24 rounded-full`}
              />
            ) : (
              <Text style={tw`
                text-4xl font-bold
                text-[${colors.primary}]
              `}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
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
          <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] text-center`}>
            {user?.name || 'User'}
          </Text>
          <Text style={tw`text-[${colors.text.secondary}] text-center mt-1`}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Settings Sections */}
      <SettingsSection title="Account">
        <SettingsItem
          icon="person"
          label="Edit Profile"
          onPress={() => router.push('/edit-profile')}
        />
        <SettingsItem
          icon="bookmark-outline"
          label="Bookmarks"
          onPress={() => router.push('/bookmarks')}
        />
        <SettingsItem
          icon="notifications"
          label="Notifications"
          isSwitch
          switchValue={notifications}
          onSwitchChange={setNotifications}
        />
        <SettingsItem
          icon="moon"
          label="Dark Mode"
          isSwitch
          switchValue={darkMode}
          onSwitchChange={setDarkMode}
          showBorder={false}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsItem
          icon="language"
          label="Language"
          value="English"
          onPress={() => router.push('/language')}
        />
        <SettingsItem
          icon="book"
          label="Bible Version"
          value="NIV"
          onPress={() => router.push('/bible-version')}
          showBorder={false}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsItem
          icon="help-circle"
          label="Help & FAQ"
          onPress={() => router.push('/help-faq')}
        />
        <SettingsItem
          icon="mail"
          label="Contact Us"
          onPress={() => router.push('/contact-us')}
        />
        <SettingsItem
          icon="star"
          label="Rate App"
          onPress={handleRateApp}
        />
        <SettingsItem
          icon="heart"
          label="Support Us"
          onPress={() => router.push('/donate')}
          showBorder={false}
        />
      </SettingsSection>

      <SettingsSection title="Account Actions">
        <SettingsItem
          icon="log-out"
          label="Sign Out"
          onPress={handleSignOut}
          danger
          showBorder={false}
        />
      </SettingsSection>

      <View style={tw`p-4 items-center`}>
        <Text style={tw`text-[${colors.text.light}] text-sm`}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
} 