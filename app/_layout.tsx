import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import tw from 'twrnc';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { setOnUnauthorized } from '@/services/api';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = ['index', 'sign-in', 'sign-up', '+not-found'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setOnUnauthorized(() => {
      signOut();
    });
    return () => setOnUnauthorized(null);
  }, [signOut]);

  useEffect(() => {
    if (loading) return;
    const route = segments[0] ? String(segments[0]) : 'index';
    const inPublicGroup = PUBLIC_ROUTES.includes(route);

    if (!user && !inPublicGroup) {
      router.replace('/');
    } else if (user && (route === 'sign-in' || route === 'sign-up' || route === 'index')) {
      // Signed-in users go straight to the app — no welcome/interstitial stop,
      // and never land back on the auth forms.
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

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

  // Keep the splash up for the one frame before a redirect fires, so users
  // never glimpse the welcome or auth screens they're being sent away from.
  const route = segments[0] ? String(segments[0]) : 'index';
  const redirectingAway = !!user && (route === 'sign-in' || route === 'sign-up' || route === 'index');
  const routeIsPublic = PUBLIC_ROUTES.includes(route);
  if (redirectingAway || (!user && !routeIsPublic)) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[${colors.background}]`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono_Regular: require('../assets/fonts/SpaceMono-Regular.ttf'),
    SpaceMono_Italic: require('../assets/fonts/SpaceMono-Italic.ttf'),
    SpaceMono_Bold: require('../assets/fonts/SpaceMono-Bold.ttf'),
    SpaceMono_BoldItalic: require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AuthGate>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </AuthProvider>
  );
}
