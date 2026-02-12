import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingSlide = {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  features?: string[];
};

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: '✝️',
    title: 'Welcome to\nScripture AI',
    subtitle: 'Your AI-powered spiritual companion for deeper biblical understanding and spiritual growth',
    features: [
      'AI-powered biblical insights',
      'Verse-by-verse explanations',
      'Multiple Bible translations'
    ]
  },
  {
    id: 2,
    icon: '📖',
    title: 'Study the Bible\nYour Way',
    subtitle: 'Get personalized spiritual guidance and contextual understanding tailored to your journey',
    features: [
      'Personalized study plans',
      'Context-aware responses',
      'Save your favorite verses'
    ]
  },
  {
    id: 3,
    icon: '🙏',
    title: 'Grow in Faith\nDaily',
    subtitle: 'Build a stronger relationship with Christ through daily scripture, prayer, and reflection',
    features: [
      'Daily devotionals',
      'Prayer journal',
      'Spiritual growth tracking'
    ]
  },
];

export default function WelcomeScreen() {
  const { user, setUserData } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, []);

  useEffect(() => {
    const checkIsAuth = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        setUserData(null);
      }
    };
    checkIsAuth();
  }, [user]);

  // Welcome Back Screen for Authenticated Users
  if (user) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <StatusBar barStyle="dark-content" />
        <View style={tw`flex-1 items-center justify-center px-6`}>
          {/* Logo */}
          <View style={tw`mb-8`}>
            <View style={tw`relative items-center justify-center`}>
              {/* Glow Effect */}
              <View style={[tw`absolute w-32 h-32 rounded-full`, { 
                // backgroundColor: '#4A7C59',
                opacity: 0.1,
              }]} />
              
              {/* Logo Container - Replace with your actual logo */}
              <View style={tw`w-28 h-28 rounded-3xl items-center justify-center `}>
                {/* If you have logo image, use this: */}
                <Image source={require('../assets/images/logo.png')} style={tw`w-40 h-40`} resizeMode="contain" />
                {/* <Text style={tw`text-6xl`}>✝️</Text> */}
              </View>
            </View>
          </View>

          <Text style={tw`text-3xl font-bold mb-2 text-gray-900 text-center`}>
            Welcome back,
          </Text>
          
          <Text style={tw`text-2xl font-bold mb-3 text-[#4A7C59] text-center`}>
            {user.name}!
          </Text>
          
          <Text style={tw`text-gray-600 text-center text-base mb-12 max-w-[300px] leading-6`}>
            Continue your spiritual journey with Scripture AI
          </Text>

          <TouchableOpacity 
            style={tw`bg-[#4A7C59] px-12 py-4 rounded-full flex-row items-center `}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={tw`text-white text-lg font-semibold mr-2`}>
              Continue to App
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Onboarding Slides
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="dark-content" />
      
      {/* Skip Button */}
      <View style={tw`absolute right-6 top-14 z-10`}>
        <TouchableOpacity 
          style={tw`px-5 py-2 rounded-full bg-gray-100`}
          onPress={() => router.push('/sign-up')}
        >
          <Text style={tw`text-gray-700 font-medium text-sm`}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={tw`flex-1 px-6 pt-20`}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Icon */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`relative`}>
            {/* Glow Ring */}
            <View style={[tw`absolute w-40 h-40 rounded-full -top-6 -left-6`, {
              // backgroundColor: '#4A7C59',
              opacity: 0.1,
            }]} />
            
            {/* Icon/Logo Container */}
            <View style={tw`w-28 h-28 rounded-3xl items-center justify-center `}>
              {/* Replace with your logo: */}
              <Image source={require('../assets/images/logo.png')} style={tw`w-40 h-40`} resizeMode="contain" />
              {/* <Text style={tw`text-6xl`}>{slides[currentSlide].icon}</Text> */}
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={tw`flex-1 items-center`}>
          <Text style={tw`text-3xl font-bold text-center text-gray-900 mb-4 leading-tight`}>
            {slides[currentSlide].title}
          </Text>
          
          <Text style={tw`text-gray-600 text-center text-base mb-8 max-w-[320px] leading-6`}>
            {slides[currentSlide].subtitle}
          </Text>

          {/* Feature List */}
          {slides[currentSlide].features && (
            <View style={tw`w-full max-w-[320px] mb-8`}>
              {slides[currentSlide].features.map((feature, idx) => (
                <View key={idx} style={tw`flex-row items-center mb-3`}>
                  <View style={tw`w-6 h-6 rounded-full bg-[#4A7C59] items-center justify-center mr-3`}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  <Text style={tw`text-gray-700 text-sm flex-1`}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Progress Dots */}
        <View style={tw`flex-row justify-center items-center mb-8`}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSlide(index)}
              style={[
                tw`h-2 rounded-full mx-1`,
                {
                  width: index === currentSlide ? 24 : 8,
                  backgroundColor: index === currentSlide 
                    ? '#4A7C59'
                    : '#E5E7EB',
                }
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={tw`pb-8`}>
          {currentSlide === slides.length - 1 ? (
            <View style={tw`gap-3`}>
              <TouchableOpacity 
                style={tw`bg-[#4A7C59] py-4 rounded-full items-center `}
                onPress={() => router.push('/sign-up')}
              >
                <Text style={tw`text-white text-base font-bold`}>
                  Create Account
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={tw`bg-gray-100 py-4 rounded-full items-center`}
                onPress={() => router.push('/sign-in')}
              >
                <Text style={tw`text-gray-700 text-base font-semibold`}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={tw`flex-row items-center gap-3`}>
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                style={[
                  tw`w-12 h-12 rounded-full items-center justify-center border-2 border-gray-200`,
                  {
                    opacity: currentSlide === 0 ? 0.5 : 1,
                  }
                ]}
                disabled={currentSlide === 0}
              >
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </TouchableOpacity>

              {/* Next Button */}
              <TouchableOpacity 
                style={tw`flex-1 bg-[#4A7C59] py-4 rounded-full items-center `}
                onPress={() => setCurrentSlide(currentSlide + 1)}
              >
                <Text style={tw`text-white text-base font-bold`}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}