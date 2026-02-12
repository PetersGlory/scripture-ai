
import { colors } from "@/constants/theme";
import { User } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc"


export const WelcomeIntro = ({
  features,
  setMessage,
  user,
  onSkip
}: {
  features: any[];
  setMessage: (text: string) => void;
  user: User | null,
  onSkip: ()=>void
}) => (
  <ScrollView
    style={tw`flex-1`}
    contentContainerStyle={tw`px-6 py-8`}
    showsVerticalScrollIndicator={false}
  >
    {/* Header */}
    <View style={tw`mb-8`}>
      <Text style={tw`text-sm text-gray-500 uppercase italic font-bold`}>
        AI ASSISTANT
      </Text>
      <Text style={tw`text-xl text-gray-800 capitalize`}>
        Hello {user?.name}. {"\n"}I'm your Bible assistant,
      </Text>
      <Text style={tw`text-2xl font-semibold text-gray-900`}>
        What are <Text style={tw`font-semibold text-[${colors.text.primary}]`}>we studying today?</Text>
      </Text>
    </View>

    {/* Quick Actions */}
    <View style={tw`mb-8`}>
      {/* Voice Helper Card */}
      <LinearGradient
        colors={["#4A7C59", "#3A6347"]}
        style={tw`rounded-3xl p-6 mb-4`}
      >
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3`}>
            <Ionicons name="mic" size={20} color="white" />
          </View>
          <Text style={tw`text-white/80 text-sm`}>Bible Study</Text>
        </View>
        <Text style={tw`text-white text-lg mb-4`}>
          Let's find new things using voice recording
        </Text>
        <TouchableOpacity onPress={onSkip} style={tw`bg-white rounded-full py-3 items-center`}>
          <Text style={tw`text-[#4A7C59] font-semibold`}>
            Start Chatting
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Action Cards */}
      <View style={tw`flex-row justify-between mb-4`}>
        <TouchableOpacity onPress={onSkip} style={tw`flex-1 bg-gray-50 rounded-2xl p-4 mr-2 items-center`}>
          <Ionicons name="chatbubble-outline" size={24} color="#4A7C59" />
          <Text style={tw`text-gray-800 text-xs mt-2 text-center`}>
            Start New{"\n"}Chat
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={tw`flex-1 bg-gray-50 rounded-2xl p-4 ml-2 items-center`}>
          <Ionicons name="image-outline" size={24} color="#4A7C59" />
          <Text style={tw`text-gray-800 text-xs mt-2 text-center`}>
            Search by{"\n"}Image
          </Text>
        </TouchableOpacity> */}
      </View>
    </View>

    {/* Recent Chat */}
    <View style={tw`mb-6`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-lg font-bold text-gray-900`}>
          Quick Study
        </Text>
        <TouchableOpacity>
          <Text style={tw`text-sm text-[#4A7C59]`}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Suggested Questions */}
      {features.map((feature, index) => (
        <TouchableOpacity
          key={feature.id}
          style={tw`flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3`}
          onPress={() => setMessage(feature.description)}
        >
          <View style={tw`w-10 h-10 rounded-full bg-[#4A7C59]/10 items-center justify-center mr-3`}>
            <Ionicons name="chatbubble-outline" size={18} color="#4A7C59" />
          </View>
          <Text style={tw`flex-1 text-gray-700 text-sm`} numberOfLines={1}>
            {feature.description}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);