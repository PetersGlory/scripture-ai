import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  TextInput, 
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';
import { chatWithAi, getChatMessages } from '../../services/api';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function HomeScreen() {
  const { sessionId: routeSessionId, title } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(routeSessionId ? false : true);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, signOut, loading: authLoading } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [sessionId, setSessionId] = useState<string | null>(routeSessionId as string || null);
  const router = useRouter();

  const features = [
    {
      id: 1,
      description: 'Deep biblical insights and\nverse-by-verse explanations',
    },
    {
      id: 2,
      description: 'Remembers context from your\nprevious spiritual discussions',
    },
    {
      id: 3,
      description: 'Access to multiple Bible versions\nand theological resources',
    },
  ];

  // Load session messages when navigating from history
  useEffect(() => {
    if (routeSessionId && user?.token) {
      loadSessionMessages(routeSessionId as string);
    }
  }, [routeSessionId, user?.token]);

  const loadSessionMessages = async (sid: string) => {
    try {
      setIsLoading(true);
      const data = await getChatMessages(sid, user?.token || '');
      
      if (data && Array.isArray(data)) {
        const convertedMessages: Message[] = [];
        data.forEach(msg => {
          // Add user message
          if (msg.message) {
            convertedMessages.push({
              id: msg._id + '_user',
              text: msg.message,
              isUser: true,
              timestamp: new Date(msg.createdAt)
            });
          }
          // Add AI response
          if (msg.response) {
            convertedMessages.push({
              id: msg._id + '_ai', 
              text: msg.response,
              isUser: false,
              timestamp: new Date(msg.createdAt)
            });
          }
        });
        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setShowIntro(false);

    try {
      const bodyData = {
        message: userMessage.text,
        sessionId: sessionId || '',
        context: {},
      };
      
      const response = await chatWithAi(bodyData, user?.token || '');
      const data = await response;
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.log(error.response?.data);
      console.error('Error sending message:', error.message);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        text: 'Sorry, there was an error processing your message. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={tw`
      mb-4 max-w-[95%]
      ${item.isUser ? 'self-end' : 'self-start'}
    `}>
      <View style={tw`
        p-3 rounded-2xl
        ${item.isUser 
          ? `bg-[${colors.primary}]` 
          : `bg-[${colors.surface}]`}
      `}>
        <Text style={tw`
          text-base leading-6
          ${item.isUser 
            ? 'text-white' 
            : `text-[${colors.text.primary}]`}
        `}>
          {item.text}
        </Text>
        <Text style={tw`
          text-xs mt-1 self-end
          ${item.isUser 
            ? 'text-white/80' 
            : `text-[${colors.text.light}]`}
        `}>
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[${colors.background}]`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-[${colors.border}]`}>
        <Text style={tw`text-xl font-semibold text-[${colors.text.primary}]`}>
          {title || 'Scripture AI'}
        </Text>
        <TouchableOpacity 
          onPress={() => alert('Comning Soon')}
          disabled={isLoading || authLoading}
          style={tw`p-2`}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={24} 
            color={isLoading || authLoading ? colors.text.light : colors.text.primary} 
          />
        </TouchableOpacity>
      </View>

      {showIntro ? (
        <ScrollView 
          style={tw`flex-1 px-4`}
          contentContainerStyle={tw`items-center justify-center flex-grow`}
        >
          <Text style={tw`text-[${colors.text.secondary}] text-center mb-12 px-6`}>
            Your AI-powered companion for deeper biblical understanding
          </Text>

          {features.map((feature, index) => (
            <View 
              key={feature.id}
              style={tw`
                w-full bg-[${colors.surface}] rounded-2xl p-4
                ${index !== features.length - 1 ? 'mb-4' : 'mb-0'}
              `}
            >
              <Text style={tw`text-[${colors.text.secondary}] text-center text-base leading-6`}>
                {feature.description}
              </Text>
            </View>
          ))}

          <View style={tw`w-full mt-8`}>
            <Text style={tw`text-[${colors.text.light}] text-sm mb-3 px-1`}>
              Try asking
            </Text>
            <TouchableOpacity 
              style={tw`w-full bg-[${colors.surface}] rounded-2xl p-4 mb-3`}
              onPress={() => setMessage("Explain the meaning of John 3:16 in detail")}
            >
              <Text style={tw`text-[${colors.text.secondary}]`}>
                "Explain the meaning of John 3:16 in detail"
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={tw`w-full bg-[${colors.surface}] rounded-2xl p-4`}
              onPress={() => setMessage("What does the Bible say about love and forgiveness?")}
            >
              <Text style={tw`text-[${colors.text.secondary}]`}>
                "What does the Bible say about love and forgiveness?"
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`p-4 pb-20`}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      {isLoading && (
        <View style={tw`flex-row items-center px-4 pb-2`}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={tw`ml-2 text-sm text-[${colors.text.light}]`}>
           Scripture AI is typing...
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={tw`px-4 pb-6`}
      >
        <View style={tw`
          flex-row items-end
          bg-[${colors.surface}] rounded-full
          px-4 py-3
          border border-[${colors.border}]
        `}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask about any Bible verse or topic..."
            placeholderTextColor={colors.text.light}
            style={tw`flex-1 text-[${colors.text.primary}] mr-2`}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={!message.trim() || isLoading}
            style={tw`
              ${message.trim() ? `opacity-100` : `opacity-50`}
              ${isLoading ? `opacity-50` : ``}
            `}
          >
            <View style={tw`
              w-8 h-8 rounded-full
              bg-[${colors.primary}]
              items-center justify-center
            `}>
              <Ionicons 
                name="arrow-up" 
                size={18} 
                color="white"
              />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
