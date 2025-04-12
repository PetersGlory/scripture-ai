import React from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

export default function DonateScreen() {
  const router = useRouter();

  const handleDonate = (platform: string) => {
    // Replace these URLs with your actual donation links
    const donationLinks = {
    //   paypal: 'https://paypal.me/yourusername',
    //   patreon: 'https://patreon.com/yourusername',
      buymeacoffee: 'https://buymeacoffee.com/scriptureai',
    };

    Linking.openURL(donationLinks[platform as keyof typeof donationLinks]);
  };

  return (
    <View style={tw`flex-1 bg-[${colors.background}]`}>
      <StatusBar style="dark" />
      
      {/* Header with Blur Effect */}
      <BlurView intensity={80} tint="systemMaterialDark" style={tw`overflow-hidden pt-6`}>
        <View style={tw`flex-row items-center justify-between px-4 py-4`}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={tw`p-2`}
          >
            <Ionicons name="arrow-back" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={tw`text-xl font-semibold text-[${colors.surface}]`}>
            Support Our Mission
          </Text>
          <View style={tw`w-8`} />
        </View>
      </BlurView>

      <ScrollView style={tw`flex-1`}>
        <View style={tw`p-4`}>
          {/* Hero Section */}
          <View style={tw`items-center mb-8`}>
            <View style={tw`w-24 h-24 rounded-full bg-[${colors.primary}]/10 items-center justify-center mb-4`}>
              <Ionicons name="heart" size={48} color={colors.primary} />
            </View>
            <Text style={tw`text-2xl font-bold text-[${colors.text.primary}] text-center mb-2`}>
              Support Scripture AI
            </Text>
            <Text style={tw`text-[${colors.text.secondary}] text-center mb-4`}>
              Help us continue developing and improving this app
            </Text>
          </View>

          {/* Donation Options */}
          <View style={tw`space-y-4`}>
            <TouchableOpacity
              style={tw`
                flex-row items-center p-4 
                bg-[${colors.surface}] rounded-xl
                border border-[${colors.border}]
                shadow-sm
              `}
              onPress={() => handleDonate('buymeacoffee')}
            >
              <View style={tw`w-12 h-12 bg-yellow-500 rounded-full items-center justify-center`}>
                <Ionicons name="cafe" size={24} color="white" />
              </View>
              <View style={tw`ml-4 flex-1`}>
                <Text style={tw`text-lg font-semibold text-[${colors.text.primary}]`}>
                  Buy a Coffee
                </Text>
                <Text style={tw`text-[${colors.text.secondary}]`}>
                  Support with a small donation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
            </TouchableOpacity>
          </View>

          {/* Benefits Section */}
          <View style={tw`mt-8 mb-6`}>
            <Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>
              Your Support Helps Us:
            </Text>
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row items-start`}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={tw`mt-1`} />
                <Text style={tw`text-[${colors.text.secondary}] ml-2 flex-1`}>
                  Develop new features and improvements
                </Text>
              </View>
              <View style={tw`flex-row items-start`}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={tw`mt-1`} />
                <Text style={tw`text-[${colors.text.secondary}] ml-2 flex-1`}>
                  Maintain and update the app regularly
                </Text>
              </View>
              <View style={tw`flex-row items-start`}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={tw`mt-1`} />
                <Text style={tw`text-[${colors.text.secondary}] ml-2 flex-1`}>
                  Provide better support and resources
                </Text>
              </View>
            </View>
          </View>

          {/* Thank You Message */}
          <View style={tw`items-center mt-6 mb-8`}>
            <Text style={tw`text-[${colors.text.secondary}] text-center`}>
              Thank you for being part of our journey! ❤️
            </Text>
            <Text style={tw`text-[${colors.text.secondary}] text-center mt-1 text-sm`}>
              Every contribution makes a difference
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 