import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type OnboardingSlide = {
  id: number;
  image: any;
  title: string;
  subtitle: string;
};

const slides: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../assets/images/logo.jpeg'),
    title: 'Unlock the Power\nOf Future AI',
    subtitle: 'Chat with the smartest AI Future',
  },
  {
    id: 2,
    image: require('../assets/images/ai-bible.jpg'),
    title: 'Explore Scripture\nWith AI',
    subtitle: 'Experience power of AI with us',
  },
  {
    id: 3,
    image: require('../assets/images/cross.jpg'),
    title: 'Join Our Growing\nCommunity',
    subtitle: 'Connect with fellow believers',
  },
];

export default function WelcomeScreen() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (user) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[${colors.background}]`}>
        <View style={tw`flex-1 items-center justify-center p-6`}>
          <View style={tw`w-24 h-24 mb-6`}>
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={tw`w-full h-full`}
              resizeMode="contain"
            />
          </View>
          <Text style={tw`text-2xl font-bold mb-2 text-[${colors.text.primary}]`}>
            Welcome back, {user.name}!
          </Text>
          <Text style={tw`text-[${colors.text.secondary}] text-center mb-8`}>
            Continue your spiritual journey with Scripture AI
          </Text>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity 
              style={tw`bg-[${colors.primary}] px-8 py-4 rounded-2xl flex-row items-center`}
            >
              <Text style={tw`text-white font-semibold mr-2`}>Continue to App</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[${colors.background}]`}>
      <TouchableOpacity 
        style={tw`absolute right-4 top-4 z-10`}
        onPress={() => {/* Handle skip */}}
      >
        <Text style={tw`text-[${colors.text.light}] text-base font-medium`}>Skip</Text>
      </TouchableOpacity>

      <View style={tw`flex-1`}>
        {/* Image and Content */}
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <View style={tw`w-72 h-72 mb-8 rounded-3xl overflow-hidden bg-black`}>
            <Image
              source={slides[currentSlide].image}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          </View>

          {/* Pagination Dots */}
          <View style={tw`flex-row justify-center space-x-2 mb-6`}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={tw`w-2 h-2 rounded-full ${
                  currentSlide === index
                    ? `bg-[${colors.primary}] w-4`
                    : `bg-[${colors.text.light}]/20`
                }`}
              />
            ))}
          </View>

          <Text style={tw`text-3xl font-bold text-center text-[${colors.text.primary}] mb-3`}>
            {slides[currentSlide].title}
          </Text>
          <Text style={tw`text-[${colors.text.secondary}] text-center text-lg mb-12`}>
            {slides[currentSlide].subtitle}
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={tw`flex-row justify-between items-center px-6 pb-8`}>
          <TouchableOpacity
            onPress={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            style={tw`
              w-12 h-12 rounded-full border-2 border-[${colors.border}]
              items-center justify-center
              ${currentSlide === 0 ? 'opacity-50' : ''}
            `}
            disabled={currentSlide === 0}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {currentSlide === slides.length - 1 ? (
            <Link href="/sign-up" asChild>
              <TouchableOpacity 
                style={tw`bg-[${colors.primary}] px-8 py-4 rounded-2xl flex-1 ml-4`}
              >
                <Text style={tw`text-white font-semibold text-lg text-center`}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <TouchableOpacity 
              style={tw`bg-[${colors.primary}] px-8 py-4 rounded-2xl flex-1 ml-4`}
              onPress={() => setCurrentSlide(currentSlide + 1)}
            >
              <Text style={tw`text-white font-semibold text-lg text-center`}>
                Next
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
} 