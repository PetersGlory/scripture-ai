import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

// FAQ data
const faqItems = [
  {
    question: 'What is Scripture-ai?',
    answer: 'Scripture-ai is a Bible-based productivity and spiritual assistant app powered by AI. It helps you explore God\'s Word, seek clarity, and stay rooted in Scripture through meaningful, Spirit-led conversations.'
  },
  {
    question: 'Is Scripture-ai a replacement for Bible study?',
    answer: 'No. Scripture-ai is a tool to enhance your personal Bible study, not replace it. It\'s designed to support meditation, devotion, and spiritual growth by helping you find biblical answers quickly and reflect on God\'s Word.'
  },
  {
    question: 'What Bible translations does Scripture-ai use?',
    answer: 'We currently support multiple trusted Bible translations including the King James Version (KJV), American Standard Version (ASV), and in future updates: The Pastor\'s Study Bible by Grace Ministries India.'
  },
  {
    question: 'How does the AI give biblical answers?',
    answer: 'The AI doesn\'t "make up" answers. It uses an embedded search engine trained on Bible verses and study notes, retrieving relevant scriptures and commentary to answer your questions strictly from the Bible.'
  },
  {
    question: 'Can I chat with Scripture-ai like ChatGPT?',
    answer: 'Yes! Scripture-ai supports natural conversations including new chat sessions, conversation history, devotionals, encouragements, and scriptural reflections - all rooted in Scripture, not opinion.'
  },
  {
    question: 'Is Scripture-ai connected to external content?',
    answer: 'No. It does not search the internet. It works purely from the Bible knowledge base built into the app, ensuring every answer is grounded in Scripture alone.'
  },
  {
    question: 'Can Scripture-ai answer theological questions?',
    answer: 'Yes, to an extent. Scripture-ai can help you understand doctrinal themes, compare verses, and clarify teachings using contextual biblical references. However, for complex theology, we still encourage pastoral guidance.'
  },
  {
    question: 'Will my chat history be private?',
    answer: 'Yes. Your conversations are stored securely (or optionally not at all). In the future, we\'ll support encrypted local-only mode for sensitive spiritual journaling.'
  },
  {
    question: 'Is there a mobile app or web version?',
    answer: 'Yes! Scripture-ai is available as a mobile app (React Native-based) with a web version coming soon. Future plans include desktop and smartwatch support for daily devotion reminders.'
  },
  {
    question: 'What\'s planned for future versions?',
    answer: 'In Version 2.0, we\'re building our own AI engine with no third-party models. This means fully private AI model, Scripture-only embeddings, and faster, more context-aware spiritual help.'
  }
];

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View 
      entering={FadeInDown}
      exiting={FadeOutUp}
      style={tw`border-b border-[${colors.border}]`}
    >
      <TouchableOpacity
        style={tw`p-4 flex-row items-center justify-between`}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={tw`flex-1 text-[${colors.text.primary}] font-medium`}>
          {question}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.light}
        />
      </TouchableOpacity>
      {expanded && (
        <Animated.View 
          entering={FadeInDown}
          exiting={FadeOutUp}
          style={tw`px-4 pb-4`}
        >
          <Text style={tw`text-[${colors.text.secondary}]`}>
            {answer}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default function HelpFAQScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredFAQItems = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSupport = async () => {
    setIsLoading(true);
    try {
      await Linking.openURL('mailto:support@scriptureai.com');
    } catch (error) {
      console.error('Error opening email client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 pt-6 bg-[${colors.background}]`}>
      {/* Header */}
      <View style={tw`flex-row items-center p-4 border-b border-[${colors.border}]`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={tw`p-2`}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
          Help & FAQ
        </Text>
      </View>

      {/* Search Bar */}
      <View style={tw`p-4 border-b border-[${colors.border}]`}>
        <View style={tw`
          flex-row items-center
          bg-[${colors.surface}] rounded-xl
          px-4 py-2
        `}>
          <Ionicons name="search" size={20} color={colors.text.light} />
          <TextInput
            style={tw`flex-1 ml-2 text-[${colors.text.primary}]`}
            placeholder="Search FAQs..."
            placeholderTextColor={colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.light} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={tw`flex-1`}>
        {/* FAQ Section */}
        <View style={tw`p-4`}>
          <Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>
            Frequently Asked Questions
          </Text>
          
          {filteredFAQItems.length > 0 ? (
            filteredFAQItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))
          ) : (
            <View style={tw`items-center py-8`}>
              <Ionicons name="search-outline" size={48} color={colors.text.light} />
              <Text style={tw`text-[${colors.text.secondary}] mt-4 text-center`}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {/* Contact Support Section */}
        <View style={tw`p-4 mt-4`}>
          <Text style={tw`text-lg font-semibold text-[${colors.text.primary}] mb-4`}>
            Still Need Help?
          </Text>
          
          <TouchableOpacity
            style={tw`
              bg-[${colors.primary}] p-4 rounded-xl
              flex-row items-center justify-center
              ${isLoading ? 'opacity-50' : ''}
            `}
            onPress={handleContactSupport}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="mail-outline" size={20} color="white" />
                <Text style={tw`text-white font-semibold ml-2`}>
                  Contact Support
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={tw`text-center text-[${colors.text.secondary}] mt-4`}>
            Our support team is available 24/7 to help you
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 