
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View } from "react-native";
import tw from "twrnc"

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={tw`px-4 pt-2 bg-white`}>
        <View style={tw`flex-row items-center bg-gray-100 px-4 py-2 rounded-full`}>
          <TouchableOpacity style={tw`mr-2`}>
            <Ionicons name="attach-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor="#9CA3AF"
            style={tw`flex-1 text-gray-800 text-base py-2`}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />

          <TouchableOpacity style={tw`ml-2`}>
            <Ionicons name="happy-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSend}
            disabled={!message.trim() || isLoading}
            style={tw`ml-2`}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() && !isLoading ? "#4A7C59" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};