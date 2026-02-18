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
import CustomAlert from '../components/CustomAlert';
import AppText from '@/components/ui/AppText';

const MAX_MESSAGE_LENGTH = 1000;

export default function ContactUsScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    subject?: string;
    message?: string;
  }>({});
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

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Here you would typically send the message to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Your message has been sent. We will get back to you soon.',
        type: 'success',
        onConfirm: () => router.back(),
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        type: 'error',
      });
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
        <AppText  style={tw`text-xl font-semibold text-[${colors.text.primary}] ml-2`}>
          Contact Us
        </AppText >
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
        <AppText  style={tw`text-[${colors.text.secondary}] mb-6 text-xs`} italic>
          Have a question, suggestion, or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </AppText >

        <View style={tw`space-y-4 mb-6`}>
          <View>
            <AppText  style={tw`text-[${colors.text.secondary}] mb-2 font-medium`}>
              Subject
            </AppText >
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                ${errors.subject ? 'border border-[${colors.error}]' : ''}
              `}
              placeholder="What is your message about?"
              placeholderTextColor={colors.text.light}
              value={subject}
              onChangeText={(text) => {
                setSubject(text);
                if (errors.subject) {
                  setErrors({ ...errors, subject: undefined });
                }
              }}
              editable={!loading}
            />
            {errors.subject && (
              <AppText  style={tw`text-[${colors.error}] text-sm mt-1`}>
                {errors.subject}
              </AppText >
            )}
          </View>

          <View>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <AppText  style={tw`text-[${colors.text.secondary}] font-medium`}>
                Message
              </AppText >
              <AppText  style={tw`text-[${colors.text.light}] text-sm`}>
                {message.length}/{MAX_MESSAGE_LENGTH}
              </AppText >
            </View>
            <TextInput
              style={tw`
                bg-[${colors.surface}] p-4 rounded-xl
                text-[${colors.text.primary}]
                min-h-[150px] text-align-vertical-top
                ${errors.message ? 'border border-[${colors.error}]' : ''}
              `}
              placeholder="Type your message here..."
              placeholderTextColor={colors.text.light}
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                if (errors.message) {
                  setErrors({ ...errors, message: undefined });
                }
              }}
              multiline
              numberOfLines={6}
              editable={!loading}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            {errors.message && (
              <AppText  style={tw`text-[${colors.error}] text-sm mt-1`}>
                {errors.message}
              </AppText >
            )}
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
              <AppText  style={tw`text-white font-semibold ml-2`}>
                Sending...
              </AppText >
            </View>
          ) : (
            <AppText  style={tw`text-white text-center font-semibold text-lg`}>
              Send Message
            </AppText >
          )}
        </TouchableOpacity>

        <View style={tw`mt-8 items-center`}>
          <AppText  style={tw`text-[${colors.text.secondary}] text-center mb-2`}>
            Or reach out to us directly:
          </AppText >
          <AppText  style={tw`text-[${colors.primary}] font-medium`}>
            getscriptureai@gmail.com
          </AppText >
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={alert.onConfirm}
      />
    </KeyboardAvoidingView>
  );
} 