import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../constants/theme";
import { KeyboardAvoidingView, Platform } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc"

type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

export function TabLayouts() {
  const { setUserData } = useAuth();
  useEffect(() => {
    const checkIsAuth = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        setUserData(null);
        router.replace('/sign-in');
      }
    };
    checkIsAuth();
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.light,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === "ios" ? 88 : 88,
          marginBottom: Platform.OS === "ios" ? 28 : 0,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily.sans,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: "600",
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.sans,
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scripture AI",
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AuthProvider>
      {/* <KeyboardAvoidingView style={tw`flex-1 w-full`}> */}
        <TabLayouts />
      {/* </KeyboardAvoidingView> */}
    </AuthProvider>
  );
}
