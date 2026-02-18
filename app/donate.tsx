import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { colors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { PRIMARY_COLOR } from "@/constants/Colors";
import AppText from "@/components/ui/AppText";

export default function DonateScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleDonate = (platform: string) => {
    const donationLinks = {
      buymeacoffee: "https://buymeacoffee.com/scriptureai",
    };
    Linking.openURL(donationLinks[platform as keyof typeof donationLinks]);
  };

  const bankDetails = {
    accountName: "Peter Thomas Atomide",
    accountNumber: "9066730090",
    bankName: "Moniepoint",
    // sortCode: "12-34-56",
  };

  return (
    <View style={tw`flex-1 bg-[${colors.background}]`}>
      <StatusBar style="dark" />
      <BlurView
        intensity={80}
        tint="systemMaterialDark"
        style={tw`overflow-hidden pt-6`}
      >
        <View style={tw`flex-row items-center justify-between px-4 py-4`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
            <Ionicons name="arrow-back" size={24} color={colors.surface} />
          </TouchableOpacity>
          <AppText style={tw`text-base text-[${colors.surface}]`} weight="bold">
            Support Our Mission
          </AppText>
          <View style={tw`w-8`} />
        </View>
      </BlurView>

      <ScrollView style={tw`flex-1`}>
        {/* Hero Section */}
        <View style={tw`items-center mt-2 mb-4`}>
          <View
            style={tw`w-24 h-24 rounded-full bg-[${colors.primary}]/10 items-center justify-center mb-4`}
          >
            <Ionicons name="heart" size={48} color={colors.primary} />
          </View>
          <AppText 
            style={tw`text-2xl text-[${colors.text.primary}] text-center mb-2`}
            weight="bold"
          >
            Support Scripture AI
          </AppText>
          <AppText style={tw`text-[${colors.text.secondary}] text-xs text-center`}>
            Help us continue developing and improving this app
          </AppText>
        </View>
        <View style={tw`p-4`}>
          {/* Donation Options */}
          <View style={tw`space-y-4`}>
            <TouchableOpacity
              style={tw`flex-row items-center p-4 bg-[${colors.surface}] rounded-xl border border-[${colors.border}] shadow-sm`}
              onPress={() => handleDonate("buymeacoffee")}
            >
              <View
                style={tw`w-12 h-12 bg-yellow-500 rounded-full items-center justify-center`}
              >
                <Ionicons name="cafe" size={24} color="white" />
              </View>
              <View style={tw`ml-4 flex-1`}>
                <AppText weight="bold"
                  style={tw`text-lg text-[${colors.text.primary}]`}
                >
                  Buy a Coffee
                </AppText>
                <AppText style={tw`text-xs text-[${colors.text.secondary}]`}>
                  Support with a small donation
                </AppText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.light}
              />
            </TouchableOpacity>

            {/* Bank Transfer Option */}
            <TouchableOpacity
              style={tw`flex-row items-center p-4 mt-2 bg-[${colors.surface}] rounded-xl border border-[${colors.border}] shadow-sm`}
              onPress={() => setModalVisible(true)}
            >
              <View
                style={tw`w-12 h-12 bg-green-500 rounded-full items-center justify-center`}
              >
                <Ionicons name="cash" size={24} color="white" />
              </View>
              <View style={tw`ml-4 flex-1`}>
                <AppText weight="bold"
                  style={tw`text-lg text-[${colors.text.primary}]`}
                >
                  Bank Transfer
                </AppText>
                <AppText style={tw`text-xs text-[${colors.text.secondary}]`}>
                  Transfer directly to our bank account
                </AppText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.light}
              />
            </TouchableOpacity>
          </View>
          {/* Benefits Section */}
          <View style={tw`mt-8 mb-6`}>
            <AppText 
              style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}
            >
              Your Support Helps Us:
            </AppText>
            <View style={tw`space-y-3`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                  style={tw`mt-1`}
                />
                <AppText style={tw`text-[${colors.text.secondary}] text-xs ml-2 flex-1`}>
                  Develop new features and improvements
                </AppText>
              </View>
            </View>
          </View>

          {/* Thank You Message */}
          <View style={tw`items-center mt-6 mb-8`}>
            <AppText style={tw`text-[${colors.text.secondary}] text-center text-sm`}>
              Thank you for being part of our journey! ❤️
            </AppText>
            <AppText 
              style={tw`text-[${colors.text.secondary}] text-center mt-1 text-sm`}
            >
              Every contribution makes a difference
            </AppText>
          </View>

          {/* Bank Details Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
            >
              <View style={tw`bg-white rounded-lg p-6 w-80`}>
                <AppText style={tw`text-lg mb-4`} italic weight="bold">
                  Bank Transfer Details
                </AppText>
                <AppText style={tw`mb-2`}>
                  Account Name: {bankDetails.accountName}
                </AppText>
                <AppText style={tw`mb-2`}>
                  Account Number: {bankDetails.accountNumber}
                </AppText>
                <AppText style={tw`mb-2`}>Bank Name: {bankDetails.bankName}</AppText>
                {/* <AppText style={tw`mb-2`}>Sort Code: {bankDetails.sortCode}</AppText> */}
                <TouchableOpacity
                  style={tw`mt-4 bg-[${PRIMARY_COLOR}] rounded-lg p-2`}
                  onPress={() => setModalVisible(false)}
                >
                  <AppText style={tw`text-white text-center`}>Close</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
}
