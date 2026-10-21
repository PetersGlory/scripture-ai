import AppText from "@/components/ui/AppText";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";

/* -------------------------------------------------------------------------- */
/*  Configuration                                                              */
/* -------------------------------------------------------------------------- */

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/scriptureai";

/**
 * TODO: load these from your backend or remote config so you can change them
 * without shipping an app update.
 */
const BANK_DETAILS = [
  { key: "accountName", label: "Account name", value: "Peter Thomas Atomide" },
  { key: "accountNumber", label: "Account number", value: "9066730090" },
  { key: "bankName", label: "Bank", value: "Moniepoint" },
] as const;

const US_BANK_DETAILS = [
  { key: "accountName", label: "Account name", value: "Peter Thomas" },
  { key: "accountNumber", label: "Account number", value: "219795662225" },
  { key: "bankName", label: "Bank", value: "Lead Bank" },
  { key: "routingNumber", label: "Routing number", value: "101019644" },
  { key: "accountType", label: "Account type", value: "Personal Checking" },
  {
    key: "accountAddress",
    label: "Account address",
    value: "9450 Southwest Gemini Drive, Beaverton, OR, 97008, USA",
  },
] as const;

const SUPPORT_POINTS = [
  "Cover AI and server costs",
  "Develop new features and improvements",
  "Keep Scripture AI free for everyone",
] as const;

type BankRegion = "ng" | "us";

interface BankInfo {
  header: string;
  description: string;
  rows: readonly { key: string; label: string; value: string }[];
}

const BANKS: Record<BankRegion, BankInfo> = {
  ng: {
    header: "Bank transfer details",
    description:
      "Nigerian bank account (NGN). Please check the account name before you send.",
    rows: BANK_DETAILS,
  },
  us: {
    header: "Bank transfer details (US)",
    description:
      "US bank account (USD). Please check the account name before you send.",
    rows: US_BANK_DETAILS,
  },
};

/** System serif for the headline. Swap for a loaded font in your theme later. */
const SERIF =
  Platform.select({ ios: "Georgia", default: "serif" }) ?? "serif";


interface OptionRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  isLast?: boolean;
  testID?: string;
  onPress: () => void;
}

const OptionRow = memo(
  ({ icon, title, subtitle, isLast, testID, onPress }: OptionRowProps) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      testID={testID}
      style={({ pressed }) => [
        tw`flex-row items-center px-4 py-4`,
        !isLast && tw`border-b border-[${colors.border}]`,
        pressed && tw`opacity-70`,
      ]}
    >
      <View
        style={tw`w-11 h-11 rounded-full bg-[${colors.primary}]/10 items-center justify-center mr-4`}
      >
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>

      <View style={tw`flex-1 pr-2`}>
        <AppText
          style={tw`text-base text-[${colors.text.primary}]`}
          weight="bold"
        >
          {title}
        </AppText>
        <AppText style={tw`text-sm text-[${colors.text.secondary}]`}>
          {subtitle}
        </AppText>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
    </Pressable>
  ),
);
OptionRow.displayName = "DonateScreen.OptionRow";


interface DetailRowProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}

const DetailRow = memo(({ label, value, copied, onCopy }: DetailRowProps) => (
  <View style={tw`flex-row items-center justify-between py-3`}>
    <View style={tw`flex-1 pr-3`}>
      <AppText style={tw`text-xs text-[${colors.text.secondary}] mb-0.5`}>
        {label}
      </AppText>
      <AppText
        style={tw`text-base text-[${colors.text.primary}]`}
        weight="bold"
        selectable
      >
        {value}
      </AppText>
    </View>

    <Pressable
      onPress={onCopy}
      accessibilityRole="button"
      accessibilityLabel={`Copy ${label.toLowerCase()}`}
      hitSlop={8}
      style={({ pressed }) => [
        tw`flex-row items-center rounded-full border border-[${colors.border}] px-3 py-1.5`,
        pressed && tw`opacity-70`,
      ]}
    >
      <Ionicons
        name={copied ? "checkmark" : "copy-outline"}
        size={14}
        color={colors.primary}
      />
      <AppText style={tw`text-xs text-[${colors.primary}] ml-1`}>
        {copied ? "Copied" : "Copy"}
      </AppText>
    </Pressable>
  </View>
));
DetailRow.displayName = "DonateScreen.DetailRow";

export default function DonateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bankRegion, setBankRegion] = useState<BankRegion | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }, [router]);

  const handleOpenCoffee = useCallback(async () => {
    try {
      await Linking.openURL(BUY_ME_A_COFFEE_URL);
    } catch {
      Alert.alert(
        "Couldn't open the link",
        `Please visit ${BUY_ME_A_COFFEE_URL} in your browser.`,
      );
    }
  }, []);

  const handleCopy = useCallback(async (key: string, value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      setCopiedKey(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      Alert.alert("Couldn't copy", "Please copy the details manually.");
    }
  }, []);

  const closeBank = useCallback(() => setBankRegion(null), []);
  const openNigerianBank = useCallback(() => {
    setCopiedKey(null);
    setBankRegion("ng");
  }, []);
  const openUsBank = useCallback(() => {
    setCopiedKey(null);
    setBankRegion("us");
  }, []);

  return (
    <View style={tw`flex-1 bg-[${colors.background}]`}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={[
          tw`flex-row items-center px-2 pb-2 border-b border-[${colors.border}]`,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={tw`p-2`}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>

        <View style={tw`flex-1`} accessibilityRole="header">
          <AppText
            style={tw`text-base text-center text-[${colors.text.primary}]`}
            weight="bold"
          >
            Support Scripture AI
          </AppText>
        </View>

        <View style={tw`w-10`} />
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={[
          tw`px-6 pt-8`,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Text
          maxFontSizeMultiplier={1.3}
          style={[
            tw`text-3xl mb-3`,
            {
              fontFamily: SERIF,
              fontWeight: "600",
              lineHeight: 38,
              color: colors.text.primary,
            },
          ]}
        >
          Keep Scripture AI free for everyone.
        </Text>
        <AppText style={tw`text-base text-[${colors.text.secondary}] mb-8`}>
          Scripture AI has no ads and no subscriptions. Your gift helps cover
          the AI and server costs and pays for new features.
        </AppText>

        {/* Ways to give */}
        <View style={tw`mb-2`} accessibilityRole="header">
          <AppText
            style={tw`text-lg text-[${colors.text.primary}]`}
            weight="bold"
          >
            Ways to give
          </AppText>
        </View>
        <View
          style={tw`rounded-2xl border border-[${colors.border}] bg-[${colors.surface}] mb-8 mt-2 overflow-hidden`}
        >
          <OptionRow
            icon="cafe-outline"
            title="Buy a coffee"
            subtitle="Give any amount online"
            testID="donate-coffee"
            onPress={handleOpenCoffee}
          />
          <OptionRow
            icon="business-outline"
            title="Bank transfer (Nigeria)"
            subtitle="Send naira directly to our account"
            testID="donate-bank"
            onPress={openNigerianBank}
          />
          <OptionRow
            icon="globe-outline"
            title="Bank transfer (US)"
            subtitle="Send dollars directly to our account"
            testID="donate-bank-us"
            isLast
            onPress={openUsBank}
          />
        </View>

        {/* Where it goes */}
        <View style={tw`mb-3`} accessibilityRole="header">
          <AppText
            style={tw`text-lg text-[${colors.text.primary}]`}
            weight="bold"
          >
            Where your gift goes
          </AppText>
        </View>
        <View style={tw`mb-8`}>
          {SUPPORT_POINTS.map((point) => (
            <View key={point} style={tw`flex-row items-center mb-3`}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
              <AppText
                style={tw`text-sm text-[${colors.text.secondary}] ml-3 flex-1`}
              >
                {point}
              </AppText>
            </View>
          ))}
        </View>

        <AppText
          style={tw`text-xs text-center text-[${colors.text.secondary}]`}
        >
          Thank you for supporting this work. Gifts are voluntary and don't
          unlock any features.
        </AppText>
      </ScrollView>

      {/* Bank details */}
      <Modal
        animationType="fade"
        transparent
        visible={bankRegion !== null}
        onRequestClose={closeBank}
        statusBarTranslucent
      >
        {bankRegion && (
          <Pressable
            style={tw`flex-1 bg-black/50 justify-center px-6`}
            onPress={closeBank}
            accessibilityRole="button"
            accessibilityLabel="Close bank details"
          >
            {/* Inner Pressable stops taps on the card from closing the modal */}
            <Pressable
              onPress={() => {}}
              accessibilityViewIsModal
              style={tw`bg-white rounded-2xl p-6`}
            >
              <AppText
                style={tw`text-lg text-[${colors.text.primary}] mb-1`}
                weight="bold"
              >
                {BANKS[bankRegion].header}
              </AppText>
              <AppText style={tw`text-xs text-[${colors.text.secondary}] mb-3`}>
                {BANKS[bankRegion].description}
              </AppText>

              {BANKS[bankRegion].rows.map((item, index, rows) => (
                <View
                  key={item.key}
                  style={
                    index < rows.length - 1
                      ? tw`border-b border-[${colors.border}]`
                      : undefined
                  }
                >
                  <DetailRow
                    label={item.label}
                    value={item.value}
                    copied={copiedKey === item.key}
                    onCopy={() => handleCopy(item.key, item.value)}
                  />
                </View>
              ))}

              <Pressable
                onPress={closeBank}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={({ pressed }) => [
                  tw`mt-5 rounded-full py-3.5 items-center bg-[${colors.primary}]`,
                  pressed && tw`opacity-80`,
                ]}
              >
                <AppText style={tw`text-white`} weight="bold">
                  Done
                </AppText>
              </Pressable>
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </View>
  );
}