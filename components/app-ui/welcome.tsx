import { BRAND, colors } from "@/constants/theme";
import { User } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import tw from "twrnc";
import AppText from "../ui/AppText";


const HERO_GRADIENT = [BRAND.forest, BRAND.forestLight] as const;

/**
 * Serif used for Scripture and the headline. Falls back to the system serif.
 * To use Cormorant Garamond / Literata, load them with expo-font and put the
 * font names here (check the export names of the @expo-google-fonts packages).
 */
const SERIF = Platform.select({ ios: "Georgia", default: "serif" }) ?? "serif";

export interface Verse {
  text: string;
  reference: string;
}

const TRANSLATION = "KJV";

const VERSES: Verse[] = [
  {
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    reference: "Psalm 119:105",
  },
  {
    text: "The LORD is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    reference: "Matthew 11:28",
  },
  {
    text: "God is our refuge and strength, a very present help in trouble.",
    reference: "Psalm 46:1",
  },
  {
    text: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13",
  },
  {
    text: "The LORD is my light and my salvation; whom shall I fear?",
    reference: "Psalm 27:1",
  },
  {
    text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
    reference: "2 Timothy 1:7",
  },
];

const getDayOfYear = (date: Date): number =>
  Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86_400_000,
  );

const getVerseOfTheDay = (date: Date = new Date()): Verse =>
  VERSES[getDayOfYear(date) % VERSES.length];


export interface Suggestion {
  id: string | number;
  description: string;
}

export interface WelcomeIntroProps {
  /** Starter questions shown under "Try asking". */
  suggestions: Suggestion[];
  /** Signed-in user, used only for the greeting. */
  user: User | null;
  /** Opens the chat input. */
  onStartChat: () => void;
  /** Fills the chat input with the selected text. */
  onSelectSuggestion: (text: string) => void;
  /** Optional override for the verse shown in the hero. */
  verse?: Verse;
}

const getFirstName = (user: User | null): string | null => {
  const first = user?.name?.trim().split(/\s+/)[0];
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
};


const useEntrance = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      cancelled = true;
    };
  }, [opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
};


const Header = memo(({ firstName }: { firstName: string | null }) => (
  <View style={tw`mb-6`} accessibilityRole="header">
    <AppText style={tw`text-sm text-gray-500 mb-1`}>
      {firstName ? `Hello, ${firstName}.` : "Hello."}
    </AppText>
    <Text
      maxFontSizeMultiplier={1.3}
      style={[
        tw`text-3xl`,
        {
          fontFamily: SERIF,
          fontWeight: "600",
          lineHeight: 38,
          color: colors.text.primary,
        },
      ]}
    >
      What are we studying today?
    </Text>
  </View>
));
Header.displayName = "WelcomeIntro.Header";

/* -------------------------------------------------------------------------- */
/*  Verse of the day hero                                                      */
/* -------------------------------------------------------------------------- */

const VerseCard = memo(
  ({ verse, onExplore }: { verse: Verse; onExplore: () => void }) => {
    const entrance = useEntrance();

    return (
      <Animated.View style={[tw`mb-6`, entrance]}>
        <LinearGradient
          colors={HERO_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tw`rounded-3xl p-6`}
        >
          <AppText style={tw`text-sm text-[${BRAND.gold}] mb-4`}>
            Verse of the day
          </AppText>

          <Text
            maxFontSizeMultiplier={1.3}
            style={[
              tw`text-2xl mb-5`,
              { fontFamily: SERIF, lineHeight: 34, color: BRAND.paper },
            ]}
          >
            {`\u201C${verse.text}\u201D`}
          </Text>

          <View style={tw`flex-row items-center mb-6`}>
            <View
              style={[tw`h-px w-6 mr-3`, { backgroundColor: BRAND.gold }]}
            />
            <AppText style={tw`text-sm text-white/70`}>
              {`${verse.reference} (${TRANSLATION})`}
            </AppText>
          </View>

          <Pressable
            onPress={onExplore}
            accessibilityRole="button"
            accessibilityLabel={`Ask about ${verse.reference}`}
            testID="welcome-explore-verse"
            style={({ pressed }) => [
              tw`self-start rounded-full border px-5 py-3`,
              { borderColor: "rgba(245,240,227,0.4)" },
              pressed && tw`opacity-70`,
            ]}
          >
            <AppText style={tw`text-white font-semibold text-sm`}>
              Ask about this verse
            </AppText>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    );
  },
);
VerseCard.displayName = "WelcomeIntro.VerseCard";

/* -------------------------------------------------------------------------- */
/*  Ask field (looks like an input, opens the chat)                            */
/* -------------------------------------------------------------------------- */

const AskField = memo(({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Ask anything about Scripture"
    accessibilityHint="Opens the chat"
    testID="welcome-start-chat"
    style={({ pressed }) => [
      tw`flex-row items-center bg-gray-50 border border-gray-200 rounded-full pl-5 pr-2 h-14 mb-8`,
      pressed && tw`opacity-80`,
    ]}
  >
    <AppText style={tw`flex-1 text-gray-500 text-base`}>
      Ask anything about Scripture
    </AppText>
    <View
      style={[
        tw`w-10 h-10 rounded-full items-center justify-center`,
        { backgroundColor: BRAND.primary },
      ]}
    >
      <Ionicons name="arrow-up" size={20} color="white" />
    </View>
  </Pressable>
));
AskField.displayName = "WelcomeIntro.AskField";

/* -------------------------------------------------------------------------- */
/*  Suggestion row                                                             */
/* -------------------------------------------------------------------------- */

interface SuggestionRowProps {
  text: string;
  isLast: boolean;
  onSelect: (text: string) => void;
}

const SuggestionRow = memo(({ text, isLast, onSelect }: SuggestionRowProps) => {
  const handlePress = useCallback(() => onSelect(text), [onSelect, text]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint="Adds this question to the message box"
      android_ripple={{ color: "#00000010" }}
      style={({ pressed }) => [
        tw`flex-row items-center py-4`,
        !isLast && tw`border-b border-gray-100`,
        pressed && tw`opacity-70`,
      ]}
    >
      <AppText
        style={tw`flex-1 text-gray-800 text-base pr-3`}
        numberOfLines={2}
      >
        {text}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={BRAND.chevron} />
    </Pressable>
  );
});
SuggestionRow.displayName = "WelcomeIntro.SuggestionRow";

/* -------------------------------------------------------------------------- */
/*  Screen section                                                             */
/* -------------------------------------------------------------------------- */

export const WelcomeIntro = memo(
  ({
    suggestions,
    user,
    onStartChat,
    onSelectSuggestion,
    verse,
  }: WelcomeIntroProps) => {
    const firstName = useMemo(() => getFirstName(user), [user]);
    const todaysVerse = useMemo(() => verse ?? getVerseOfTheDay(), [verse]);

    const handleExploreVerse = useCallback(
      () => onSelectSuggestion(`Explain ${todaysVerse.reference} in detail`),
      [onSelectSuggestion, todaysVerse.reference],
    );

    return (
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-8`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header firstName={firstName} />

        <VerseCard verse={todaysVerse} onExplore={handleExploreVerse} />

        <AskField onPress={onStartChat} />

        {suggestions.length > 0 && (
          <View style={tw`mb-6`}>
            <View style={tw`mb-1`} accessibilityRole="header">
              <AppText style={tw`text-lg font-bold text-gray-900`}>
                Try asking
              </AppText>
            </View>

            {suggestions.map((item, index) => (
              <SuggestionRow
                key={item.id}
                text={item.description}
                isLast={index === suggestions.length - 1}
                onSelect={onSelectSuggestion}
              />
            ))}
          </View>
        )}

        <AppText style={tw`text-xs text-gray-400 text-center`}>
          Answers are AI-generated. Always check them against Scripture.
        </AppText>
      </ScrollView>
    );
  },
);
WelcomeIntro.displayName = "WelcomeIntro";

export default WelcomeIntro;
