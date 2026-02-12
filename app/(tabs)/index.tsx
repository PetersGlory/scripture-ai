import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
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


export default function HomeScreen() {
  const { sessionId: routeSessionId, title } = useLocalSearchParams<{
    sessionId: string;
    title: string;
  }>();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(!routeSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, signOut, loading: authLoading } = useAuth();
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

  // console.log("this is the user", user)

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
    if (routeSessionId && user?.token) {
      loadSessionMessages(routeSessionId as string);
      setShowIntro(false);
    } else {
      setShowIntro(true);
    }
  }, [routeSessionId, user?.token]);

  const loadSessionMessages = async (sid: string) => {
    try {
      setIsLoading(true);
      const data = await getChatMessages(sid, user?.token || "");

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
    } catch (error) {
      console.error("Error loading session messages:", error);
      setAlert({
        visible: true,
        title: "Error",
        message: "Failed to load chat history. Please try again.",
        type: "error",
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

  const handleRetry = async (messageId: string) => {
    const messageToRetry = messages.find((m) => m.id === messageId);
    if (!messageToRetry || !messageToRetry.isUser) return;

    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setMessage(messageToRetry.text);
    handleSendMessage();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setShowIntro(false);

    try {
      const bodyData = {
        message: userMessage.text,
        sessionId: sessionId || "",
        context: {},
      };

      const response = await chatWithAi(bodyData, user?.token || "");
      const data = await response;

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
    } catch (error: any) {
      console.log(error.response?.data);
      console.error("Error sending message:", error.message);
      const errorMessage: Message = {
        id: Date.now().toString() + "_error",
        text:
          "Sorry, there was an error processing your message. Please try again.",
        isUser: false,
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 py-4 bg-white`}>
      {/* Header */}
      <View style={tw`px-4 pt-5 pb-3 bg-white border-b border-gray-100`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity onPress={() => {
            if(title){
              setShowIntro(true)
            }else{
              router.back();
            }
          }}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <Text style={tw`text-lg font-semibold text-gray-900`}>
            {title || "Study with Scripture AI"}
          </Text>

          <TouchableOpacity
            onPress={handleBookmark}
            disabled={isLoading || authLoading || isBookmarking || !sessionId}
          >
            {isBookmarking ? (
              <ActivityIndicator color="#4A7C59" size="small" />
            ) : (
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color="#1F2937"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Separator */}
      {!showIntro && messages.length > 0 && (
        <View style={tw`items-center py-4`}>
          <Text style={tw`text-xs text-gray-500`}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
      )}

      {showIntro ? (
        <WelcomeIntro features={features} onSkip={()=>setShowIntro(false)} setMessage={setMessage} user={user} />
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
    </SafeAreaView>
  );
}