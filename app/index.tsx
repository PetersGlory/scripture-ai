import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { Link, router } from 'expo-router';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type OnboardingSlide = {
  id: number;
  image: any;
  title: string;
  subtitle: string;
  color: string;
};

const slides: OnboardingSlide[] = [
  {
    id: 1,
    image: require('../assets/images/logo.jpeg'),
    title: 'Explore Scripture\nWith AI',
    subtitle: 'Discover deeper insights into God\'s word through advanced AI technology',
    color: '#4A90E2',
  },
  {
    id: 2,
    image: require('../assets/images/ai-bible.jpg'),
    title: 'Personalized\nSpiritual Journey',
    subtitle: 'Get tailored spiritual guidance and biblical insights just for you',
    color: '#FF7B92',
  },
  {
    id: 3,
    image: require('../assets/images/cross.jpg'),
    title: 'Join Our Growing\nCommunity',
    subtitle: 'Connect with fellow believers in meaningful spiritual discussions',
    color: '#8B7BFF',
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function WelcomeScreen() {
  const { user, setUserData } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideProgress = useSharedValue(0);
  const imageScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    slideProgress.value = withTiming(currentSlide);
    imageScale.value = withSequence(
      withTiming(1.1, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [currentSlide]);

  useEffect(() => {
    const checkIsAuth = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        setUserData(null);
        router.replace('/sign-in');
      }
    };
    checkIsAuth();
  }, [user]);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      const shouldSwipeNext = event.velocityX < -500 || (event.translationX < -width / 3);
      const shouldSwipePrev = event.velocityX > 500 || (event.translationX > width / 3);

      if (shouldSwipeNext && currentSlide < slides.length - 1) {
        translateX.value = withSpring(-width, {}, () => {
          runOnJS(setCurrentSlide)(currentSlide + 1);
          translateX.value = 0;
        });
      } else if (shouldSwipePrev && currentSlide > 0) {
        translateX.value = withSpring(width, {}, () => {
          runOnJS(setCurrentSlide)(currentSlide - 1);
          translateX.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: imageScale.value },
      { translateX: translateX.value },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, width / 2],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  if (user) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[${slides[0].color}]`}>
        <StatusBar barStyle="light-content" />
        <AnimatedBlurView
          intensity={20}
          tint="dark"
          style={tw`absolute w-full h-full`}
        />
        <Animated.View 
          entering={FadeIn}
          style={tw`flex-1 items-center justify-center p-6`}
        >
          <Animated.View 
            entering={FadeInDown.delay(300)}
            style={tw`w-40 h-40 mb-8`}
          >
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={tw`w-full h-full rounded-[32px] shadow-2xl`}
              resizeMode="cover"
            />
          </Animated.View>
          <Animated.Text 
            entering={FadeInDown.delay(400)}
            style={tw`text-4xl font-bold mb-3 text-white text-center`}
          >
            Welcome back,{'\n'}{user.name}!
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.delay(500)}
            style={tw`text-white/80 text-center text-lg mb-12 max-w-[280px]`}
          >
            Continue your spiritual journey with Scripture AI
          </Animated.Text>
            <AnimatedTouchableOpacity 
              entering={FadeInUp.delay(600)}
              style={[
                tw`bg-white/90 px-8 py-4 rounded-2xl flex-row items-center shadow-lg`,
                buttonAnimatedStyle,
              ]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={[tw`text-lg font-semibold mr-2`, { color: slides[0].color }]}>
                Continue to App
              </Text>
              <Ionicons name="arrow-forward" size={20} color={slides[0].color} />
            </AnimatedTouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <SafeAreaView style={[tw`flex-1 pt-20`, { backgroundColor: slides[currentSlide].color }]}>
        <StatusBar barStyle="light-content" />
        <AnimatedTouchableOpacity 
          entering={FadeIn.delay(800)}
          style={tw`absolute right-6 top-10 z-10 bg-white/20 rounded-full px-6 py-2 backdrop-blur-lg`}
          onPress={() => router.push('/sign-up')}
        >
          <Text style={tw`text-white font-medium`}>Skip</Text>
        </AnimatedTouchableOpacity>

        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View style={tw`flex-1`}>
            <View style={tw`flex-1 items-center justify-center px-6`}>
              {/* Main Content */}
              <View style={tw`items-center mb-12`}>
                <Animated.View 
                  style={[
                    tw`w-72 h-72 mb-12 rounded-[40px] overflow-hidden bg-white/20`,
                    imageAnimatedStyle,
                  ]}
                >
                  <Image
                    source={slides[currentSlide].image}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={tw`absolute bottom-0 w-full h-16 justify-end px-4 py-2`}
                  >
                    <Text style={tw`text-white/60 text-xs font-medium`}>
                      {currentSlide + 1} of {slides.length}
                    </Text>
                  </BlurView>
                </Animated.View>

                <Animated.View style={contentStyle}>
                  <Animated.Text 
                    entering={SlideInRight}
                    exiting={SlideOutLeft}
                    style={tw`text-4xl font-bold text-center text-white mb-4 max-w-[300px]`}
                  >
                    {slides[currentSlide].title}
                  </Animated.Text>
                  <Animated.Text 
                    entering={SlideInRight.delay(100)}
                    exiting={SlideOutLeft}
                    style={tw`text-white/80 text-center text-lg mb-8 max-w-[280px]`}
                  >
                    {slides[currentSlide].subtitle}
                  </Animated.Text>
                </Animated.View>

                {/* Progress Dots */}
                <View style={tw`flex-row justify-center space-x-2`}>
                  {slides.map((_, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        tw`h-2 rounded-full bg-white/70`,
                        index === currentSlide ? tw`w-8` : tw`w-2`,
                        { opacity: index === currentSlide ? 1 : 0.5 }
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Navigation */}
              <View style={tw`flex-row justify-between items-center w-full px-4 pb-8`}>
                <AnimatedTouchableOpacity
                  entering={FadeIn}
                  onPress={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  style={tw`
                    w-12 h-12 rounded-full 
                    items-center justify-center
                    ${currentSlide === 0 ? 'opacity-50' : ''}
                    bg-white/20 backdrop-blur-lg
                  `}
                  disabled={currentSlide === 0}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </AnimatedTouchableOpacity>

                {currentSlide === slides.length - 1 ? (
                    <AnimatedTouchableOpacity 
                      entering={FadeInUp}
                      style={[
                        tw`bg-white/90 px-8 w-auto py-4 rounded-2xl flex-1 ml-4`,
                        buttonAnimatedStyle,
                      ]}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      onPress={() => router.push('/sign-up')}
                    >
                      <Text style={[tw`text-lg w-full text-center font-semibold`, { color: slides[currentSlide].color }]}>
                        Get Started
                      </Text>
                    </AnimatedTouchableOpacity>
                ) : (
                  <AnimatedTouchableOpacity 
                    entering={FadeInUp}
                    style={[
                      tw`bg-white/90 px-8 py-4 rounded-2xl flex-1 ml-4`,
                      buttonAnimatedStyle,
                    ]}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => setCurrentSlide(currentSlide + 1)}
                  >
                    <Text style={[tw`text-lg text-center font-semibold`, { color: slides[currentSlide].color }]}>
                      Next
                    </Text>
                  </AnimatedTouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
} 