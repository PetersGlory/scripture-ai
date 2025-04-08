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
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn, 
  SlideInRight, 
  BounceIn,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import CustomAlert from '../../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  error?: boolean;
};

const MessageBubble = React.memo(({ item, index, onRetry }: { 
  item: Message; 
  index: number;
  onRetry: (id: string) => void;
}) => {
  const isFirstMessage = index === 0;
  const showAvatar = !item.isUser;

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={tw`
        mb-4 max-w-[85%]
        ${item.isUser ? 'self-end' : 'self-start'}
        ${isFirstMessage ? 'mt-4' : ''}
      `}
    >
      <View style={tw`flex-row items-end ${item.isUser ? 'justify-end' : 'justify-start'}`}>
        {showAvatar && (
          <View style={tw`mr-2 mb-1`}>
            <View style={tw`
              w-8 h-8 rounded-full bg-[${colors.primary}]/10
              items-center justify-center
            `}>
              <Ionicons name="book" size={16} color={colors.primary} />
            </View>
          </View>
        )}
        
        <View style={tw`
          p-4 rounded-2xl
          ${item.isUser 
            ? `bg-[${colors.primary}] rounded-tr-none` 
            : item.error
              ? `bg-[${colors.error}]/10 rounded-tl-none`
              : `bg-[${colors.surface}] rounded-tl-none`}
          shadow-sm
        `}>
          <Text style={tw`
            text-base leading-6
            ${item.isUser 
              ? 'text-white' 
              : item.error
                ? `text-[${colors.error}]`
                : `text-[${colors.text.primary}]`}
          `}>
            {item.text}
          </Text>
          
          <View style={tw`
            flex-row items-center justify-end mt-2
            ${item.error ? 'justify-between' : 'justify-end'}
          `}>
            {item.error && (
              <TouchableOpacity
                onPress={() => onRetry(item.id)}
                style={tw`
                  flex-row items-center
                  bg-[${colors.error}]/10 
                  px-3 py-1 rounded-full
                  mr-2
                `}
              >
                <Ionicons name="refresh" size={14} color={colors.error} />
                <Text style={tw`text-xs text-[${colors.error}] ml-1`}>
                  Retry
                </Text>
              </TouchableOpacity>
            )}
            <Text style={tw`
              text-xs
              ${item.isUser 
                ? 'text-white/70' 
                : item.error
                  ? `text-[${colors.error}]/70`
                  : `text-[${colors.text.light}]`}
            `}>
              {item.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const TypingIndicator = () => (
  <MotiView
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 300 }}
    style={tw`flex-row items-center px-4 pb-2`}
  >
    <View style={tw`flex-row items-center bg-[${colors.surface}] px-4 py-2 rounded-full`}>
      <View style={tw`flex-row items-center mr-2`}>
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 600,
              loop: true,
              delay: i * 150,
            }}
            style={tw`
              w-2 h-2 rounded-full bg-[${colors.primary}]
              mx-0.5
            `}
          />
        ))}
      </View>
      <Text style={tw`text-sm text-[${colors.text.light}]`}>
        Scripture AI is thinking...
      </Text>
    </View>
  </MotiView>
);

const InputBar = ({ 
  message, 
  setMessage, 
  onSend, 
  isLoading 
}: { 
  message: string;
  setMessage: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}) => {
  const buttonScale = useAnimatedStyle(() => ({
    transform: [{ 
      scale: withSpring(message.trim() && !isLoading ? 1 : 0.8)
    }],
    opacity: withSpring(message.trim() && !isLoading ? 1 : 0.5),
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={tw`px-4 pb-6`}
    >
      <BlurView intensity={80} tint="dark" style={tw`rounded-2xl overflow-hidden`}>
        <View style={tw`
          flex-row items-end
          bg-[${colors.surface}]/90 
          px-4 py-3
          border border-[${colors.border}]
          rounded-2xl
        `}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask about any Bible verse or topic..."
            placeholderTextColor={colors.text.light}
            style={tw`
              flex-1 text-[${colors.text.primary}] 
              mr-2 min-h-[36px] max-h-[100px]
              text-sm
            `}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <Animated.View style={buttonScale}>
            <TouchableOpacity 
              onPress={onSend}
              disabled={!message.trim() || isLoading}
              style={tw`
                w-10 h-10 rounded-xl
                bg-[${colors.primary}]
                items-center justify-center
                shadow-lg shadow-[${colors.primary}]/20
              `}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

export default function HomeScreen() {
  const { sessionId: routeSessionId, title } = useLocalSearchParams<{ sessionId: string; title: string }>();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(!routeSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, signOut, loading: authLoading } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [sessionId, setSessionId] = useState<string | null>(routeSessionId || null);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

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
    console.log(routeSessionId)
    if (routeSessionId && user?.token) {
      loadSessionMessages(routeSessionId as string);
    }
  }, [routeSessionId, user?.token]);

  const loadSessionMessages = async (sid: string) => {
    console.log(sid)
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
        setShowIntro(false);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load chat history. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBookmark = async () => {
    setIsBookmarking(true);
    try {
      const bookmarkedSessions = await AsyncStorage.getItem('bookmarkedSessions');
      const sessions = bookmarkedSessions ? JSON.parse(bookmarkedSessions) : [];
      
      const sessionInfo = {
        id: sessionId,
        sessionId: sessionId,
        title: messages[0]?.text || 'Untitled Conversation',
        lastMessage: messages[messages.length - 1]?.text || '',
        createdAt: new Date().toISOString(),
        messages: messages
      };
      
      const existingIndex = sessions.findIndex((s: any) => s.sessionId === sessionId);
      
      if (existingIndex === -1) {
        sessions.push(sessionInfo);
        await AsyncStorage.setItem('bookmarkedSessions', JSON.stringify(sessions));
        setAlert({
          visible: true,
          title: 'Success',
          message: 'Conversation bookmarked successfully',
          type: 'success',
        });
      } else {
        setAlert({
          visible: true,
          title: 'Info',
          message: 'Conversation already bookmarked',
          type: 'info',
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to bookmark conversation',
        type: 'error',
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleRetry = async (messageId: string) => {
    const messageToRetry = messages.find(m => m.id === messageId);
    if (!messageToRetry || !messageToRetry.isUser) return;

    setMessages(prev => prev.filter(m => m.id !== messageId));
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
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[${colors.background}]`}>
      {/* Header */}
      <BlurView intensity={80} tint="systemMaterialDark" style={tw`overflow-hidden pt-6`}>
        <View style={tw`
          flex-row items-center justify-between 
          px-4 pt-4 pb-2 
          border-b border-[${colors.border}]
        `}>
          <View>
            <Text style={tw`text-xl font-semibold text-[${colors.surface}]`}>
              {title || 'Scripture AI'}
            </Text>
            {messages.length > 0 && (
              <Text style={tw`text-xs text-[${colors.text.light}]`}>
                {messages.length} messages
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={handleBookmark}
            disabled={isLoading || authLoading || isBookmarking}
            style={tw`
              p-2 rounded-full
              ${isBookmarking ? `bg-[${colors.primary}]/10` : ''}
            `}
          >
            {isBookmarking ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons 
                name="bookmark-outline" 
                size={24} 
                color={isLoading || authLoading ? colors.text.light : colors.surface} 
              />
            )}
          </TouchableOpacity>
        </View>
      </BlurView>

      {showIntro ? (
        <ScrollView 
          style={tw`flex-1 px-4`}
          contentContainerStyle={tw`items-center justify-center flex-grow`}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text 
            entering={FadeInUp}
            style={tw`text-[${colors.text.secondary}] text-center mb-3 px-6`}
          >
            Your AI-powered companion for deeper biblical understanding
          </Animated.Text>

          {features.map((feature, index) => (
            <Animated.View 
              key={feature.id}
              entering={FadeInUp.delay(index * 200)}
              style={tw`
                w-full bg-[${colors.surface}] rounded-xl p-4
                border border-[${colors.border}]
                shadow-sm
                ${index !== features.length - 1 ? 'mb-4' : 'mb-0'}
              `}
            >
              <View style={tw`flex-row items-center`}>
                <View style={tw`
                  w-8 h-8 rounded-full
                  bg-[${colors.primary}]/10
                  items-center justify-center
                  mr-3
                `}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                </View>
                <Text style={tw`
                  text-[${colors.text.secondary}] 
                  text-sm leading-4
                  flex-1
                `}>
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
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
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) => (
              <MessageBubble 
                item={item} 
                index={index}
                onRetry={handleRetry}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={tw`p-4 pb-20`}
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

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={alert.onConfirm}
      />
    </SafeAreaView>
  );
}
