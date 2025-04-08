// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import tw from "twrnc"
import { colors } from '@/constants/theme';
import { Text } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[${colors.background}]`}>
        <View style={tw`items-center space-y-6`}>
          <ActivityIndicator size="large" color={colors.primary} />
          <View style={tw`items-center`}>
            <Text style={tw`text-[${colors.text.primary}] text-lg font-semibold mb-1`}>
              Scripture AI
            </Text>
            <Text style={tw`text-[${colors.text.secondary}] text-base`}>
              Preparing your spiritual journey...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user?.token ? (
        <>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </>
      ) : (
        <Stack.Screen name="index" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
        <RootLayoutNav />
        <StatusBar style="dark" />
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}
