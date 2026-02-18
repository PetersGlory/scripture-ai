import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

export const InputBar = ({
  message,
  setMessage,
  onSend,
  isLoading,
}: {
  message: string;
  setMessage: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}) => {
  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
    // >
      <View style={tw`px-4 pt-2 bg-white`}>
        <View
          style={tw`
            flex-row 
            items-end 
            bg-gray-100 
            px-4 
            py-3 
            rounded-2xl
          `}
        >
          {/* Attach */}
          <TouchableOpacity style={tw`mr-3`}>
            <Ionicons name="attach-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message Scripture AI..."
            placeholderTextColor="#9CA3AF"
            style={tw`
              flex-1 
              text-gray-800 
              text-base 
              min-h-[24px]
              max-h-32
            `}
            multiline
            editable={!isLoading}
          />

          {/* Emoji */}
          <TouchableOpacity style={tw`ml-3`}>
            <Ionicons name="happy-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Send */}
          <TouchableOpacity
            onPress={onSend}
            disabled={!message.trim() || isLoading}
            style={tw`ml-3`}
          >
            <Ionicons
              name="arrow-up-circle"
              size={28}
              color={
                message.trim() && !isLoading
                  ? "#4A7C59"
                  : "#D1D5DB"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    // </KeyboardAvoidingView>
  );
};
