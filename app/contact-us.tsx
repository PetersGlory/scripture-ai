import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ContactUsScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically send the message to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Success',
        'Your message has been sent. We will get back to you soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 pt-6 bg-[${colors.background}]`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View style={tw`flex-row items-center p-4 border-b border-[${colors.border}]`}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={tw`p-2`}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
          Contact Us
        </Text>
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
        <Text style={tw`text-[${colors.text.secondary}] mb-6`}>
          Have a question, suggestion, or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </Text>

        <View style={tw`space-y-4 mb-6`}>
          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Subject
            </Text>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
              `}
              placeholder="What is your message about?"
              placeholderTextColor={colors.text.light}
              value={subject}
              onChangeText={setSubject}
              editable={!loading}
            />
          </View>

          <View>
            <Text style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Message
            </Text>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                min-h-[150px] text-align-vertical-top
              `}
              placeholder="Type your message here..."
              placeholderTextColor={colors.text.light}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={tw`
            bg-[${colors.primary}] p-4 rounded-xl
            ${loading ? 'opacity-50' : ''}
          `}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator color="white" />
              <Text style={tw`text-white font-semibold ml-2`}>
                Sending...
              </Text>
            </View>
          ) : (
            <Text style={tw`text-white text-center font-semibold text-lg`}>
              Send Message
            </Text>
          )}
        </TouchableOpacity>

        <View style={tw`mt-8 items-center`}>
          <Text style={tw`text-[${colors.text.secondary}] text-center mb-2`}>
            Or reach out to us directly:
          </Text>
          <Text style={tw`text-[${colors.primary}] font-medium`}>
            support@scriptureai.com
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 