import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import tw from "twrnc";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { chatWithAi, getChatMessages } from "../../services/api";
import { useLocalSearchParams, router } from "expo-router";
import CustomAlert from "../../components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message, MessageBubble } from "@/components/app-ui/message-bouble";
import { WelcomeIntro } from "@/components/app-ui/welcome";
import { TypingIndicator } from "@/components/app-ui/typing-indicator";
import { InputBar } from "@/components/app-ui/InputBar";
import AppText from "@/components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {
  const { sessionId: routeSessionId, title } = useLocalSearchParams<{
    sessionId: string;
    title: string;
  }>();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(!routeSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, loading: authLoading } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [sessionId, setSessionId] = useState<string | null>(
    routeSessionId || null
  );
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "error" | "success" | "warning" | "info";
    onConfirm?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "error",
  });

  const features = [
    {
      id: 1,
      description: "Explain the meaning of John 3:16 in detail",
    },
    {
      id: 2,
      description: "What does the Bible say about love?",
    },
    {
      id: 3,
      description: "Help me understand Romans 8:28",
    },
    {
      id: 4,
      description: "Tell me about the life of David",
    },
  ];

  useEffect(() => {
    if (routeSessionId) {
      loadSessionMessages(routeSessionId as string);
      setShowIntro(false);
    } else {
      // Arriving at the chat root (fresh open or "Start New Chat" from History):
      // drop any session that a previous visit left behind so a new message
      // never appends to an old conversation.
      setSessionId(null);
      setMessages([]);
      setShowIntro(true);
    }
  }, [routeSessionId]);

  const resetToNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setMessage("");
    setShowIntro(true);
    if (routeSessionId) {
      router.setParams({ sessionId: "", title: "" });
    }
  };

  const loadSessionMessages = async (sid: string) => {
    try {
      setIsLoading(true);
      const data = await getChatMessages(sid);

      if (data && Array.isArray(data)) {
        const convertedMessages: Message[] = [];
        data.forEach((msg) => {
          if (msg.message) {
            convertedMessages.push({
              id: msg._id + "_user",
              text: msg.message,
              isUser: true,
              timestamp: new Date(msg.createdAt),
            });
          }
          if (msg.response) {
            convertedMessages.push({
              id: msg._id + "_ai",
              text: msg.response,
              isUser: false,
              timestamp: new Date(msg.createdAt),
            });
          }
        });
        setMessages(convertedMessages);
        setShowIntro(false);
      }
    } catch (error: any) {
      console.error("Error loading session messages:", error);
      const notFound = error?.response?.status === 404;
      setAlert({
        visible: true,
        title: notFound ? "Conversation unavailable" : "Error",
        message: notFound
          ? "This conversation is no longer available."
          : "Failed to load chat history. Please try again.",
        type: "error",
        onConfirm: resetToNewChat,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    setIsBookmarking(true);
    if (!sessionId) {
      setAlert({
        visible: true,
        title: "Error",
        message: "No session ID found",
        type: "error",
      });
      setIsBookmarking(false);
      return;
    }
    try {
      const bookmarkedSessions = await AsyncStorage.getItem(
        "bookmarkedSessions"
      );
      const sessions = bookmarkedSessions ? JSON.parse(bookmarkedSessions) : [];

      const sessionInfo = {
        id: sessionId,
        sessionId: sessionId,
        title: messages[0]?.text || "Untitled Conversation",
        lastMessage: messages[messages.length - 1]?.text || "",
        createdAt: new Date().toISOString(),
        messages: messages,
      };

      const existingIndex = sessions.findIndex(
        (s: any) => s.sessionId === sessionId
      );

      if (existingIndex === -1) {
        sessions.push(sessionInfo);
        await AsyncStorage.setItem(
          "bookmarkedSessions",
          JSON.stringify(sessions)
        );
        setAlert({
          visible: true,
          title: "Success",
          message: "Conversation bookmarked successfully",
          type: "success",
        });
      } else {
        setAlert({
          visible: true,
          title: "Info",
          message: "Conversation already bookmarked",
          type: "info",
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Failed to bookmark conversation",
        type: "error",
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const sendText = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setShowIntro(false);

    try {
      const data = await chatWithAi({
        message: trimmed,
        sessionId: sessionId || "",
      });

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMessage: Message = {
        id: Date.now().toString() + "_ai",
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + "_error",
        text: "Sorry, there was an error processing your message. Please try again.",
        isUser: false,
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendText(message);
  };

  const handleRetry = (messageId: string) => {
    const index = messages.findIndex((m) => m.id === messageId);
    if (index === -1) return;

    const target = messages[index];

    if (target.isUser) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      sendText(target.text);
      return;
    }

    if (target.error) {
      let userMessage: Message | undefined;
      for (let i = index - 1; i >= 0; i--) {
        if (messages[i].isUser) {
          userMessage = messages[i];
          break;
        }
      }
      if (!userMessage) return;
      setMessages(
        (prev) => prev.filter((m) => m.id !== messageId && m.id !== userMessage.id)
      );
      sendText(userMessage.text);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={tw`px-4 pt-5 pb-3 bg-white border-b border-gray-100`}>
          <View style={tw`flex-row items-center justify-between`}>
            {title ? (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
            ) : (
              <View style={tw`w-6`} />
            )}

            <AppText
              style={tw`flex-1 mx-3 text-xs text-gray-600 text-center`}
              accent
              numberOfLines={1}
            >
              {title || "Study with Scripture AI"}
            </AppText>

            <View style={tw`flex-row items-center gap-4`}>
              <TouchableOpacity onPress={resetToNewChat} accessibilityLabel="Start a new chat">
                <Ionicons name="create-outline" size={24} color="#1F2937" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBookmark}
                disabled={isLoading || authLoading || isBookmarking || !sessionId}
                accessibilityLabel="Bookmark this conversation"
              >
                {isBookmarking ? (
                  <ActivityIndicator color="#4A7C59" size="small" />
                ) : (
                  <Ionicons
                    name={
                      isLoading || authLoading || !sessionId
                        ? "bookmark-outline"
                        : "bookmark"
                    }
                    size={24}
                    color={sessionId ? "#4A7C59" : "#9CA3AF"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Separator */}
        {!showIntro && messages.length > 0 && (
          <View style={tw`items-center py-4`}>
            <AppText style={tw`text-xs text-gray-500`}>
              {messages[0].timestamp.toLocaleDateString()}
            </AppText>
          </View>
        )}

        {showIntro ? (
          <WelcomeIntro suggestions={features} onStartChat={()=>setShowIntro(false)} onSelectSuggestion={setMessage} user={user} />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item, index }) => (
                <MessageBubble item={item} index={index} onRetry={handleRetry} />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={tw`px-4 pt-2 pb-6`}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              onLayout={() => flatListRef.current?.scrollToEnd()}
              showsVerticalScrollIndicator={false}
            />
            {isLoading && <TypingIndicator />}
          </>
        )}

        <InputBar
          message={message}
          setMessage={setMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />

        {alert.visible && (
          <CustomAlert
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, visible: false })}
            onConfirm={alert.onConfirm}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}