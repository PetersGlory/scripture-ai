import { PRIMARY_COLOR } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc"
import AppText from "../ui/AppText";

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  error?: boolean;
};

export const MessageBubble = React.memo(
  ({
    item,
    index,
    onRetry,
  }: {
    item: Message;
    index: number;
    onRetry: (id: string) => void;
  }) => {
    return (
      <View style={tw`mb-3 ${item.isUser ? "items-end" : "items-start"}`}>
        {item.isUser ? (
          <View style={tw`bg-[${PRIMARY_COLOR}] px-5 py-3 rounded-3xl rounded-tr-md max-w-[75%]`}>
            <AppText style={tw`text-white text-xs leading-6`}>
              {item.text}
            </AppText>
            <AppText style={tw`text-white/60 text-xs mt-1 text-right`}>
              {item.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </AppText>
          </View>
        ) : (
          <View
            style={tw`${
              item.error
                ? "bg-red-50 border border-red-200"
                : "bg-gray-100"
            } px-5 py-3 rounded-3xl rounded-tl-md max-w-[85%]`}
          >
            <AppText
              style={tw`${
                item.error ? "text-red-700" : "text-gray-800"
              } text-xs leading-6`}
            >
              {item.text}
            </AppText>

            <View
              style={tw`flex-row items-center mt-1 ${
                item.error ? "justify-between" : "justify-end"
              }`}
            >
              {item.error && (
                <TouchableOpacity
                  onPress={() => onRetry(item.id)}
                  style={tw`flex-row items-center bg-red-100 px-3 py-1 rounded-full`}
                >
                  <Ionicons name="refresh" size={12} color="#dc2626" />
                  <AppText style={tw`text-xs text-red-600 ml-1 font-medium`}>
                    Retry
                  </AppText>
                </TouchableOpacity>
              )}
              <AppText
                style={tw`text-xs ${
                  item.error ? "text-red-400" : "text-gray-500"
                }`}
              >
                {item.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </AppText>
            </View>
          </View>
        )}
      </View>
    );
  }
);