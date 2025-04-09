import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import tw from 'twrnc';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'info' | 'warning';

type CustomAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

const getIconName = (type: AlertType) => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    case 'warning':
      return 'warning';
    default:
      return 'information-circle';
  }
};

const getIconColor = (type: AlertType) => {
  switch (type) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    default:
      return colors.primary;
  }
};

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: CustomAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-center items-center bg-black/50 z-50`}>
        <View style={tw`bg-[${colors.surface}] w-[90%] rounded-2xl p-6`}>
          <View style={tw`items-center mb-4`}>
            <View style={tw`
              w-12 h-12 rounded-full
              bg-[${getIconColor(type)}]/10
              items-center justify-center
            `}>
              <Ionicons
                name={getIconName(type)}
                size={24}
                color={getIconColor(type)}
              />
            </View>
          </View>

          <Text style={tw`text-xl font-semibold text-[${colors.text.primary}] text-center mb-2`}>
            {title}
          </Text>
          <Text style={tw`text-[${colors.text.secondary}] text-center mb-6`}>
            {message}
          </Text>

          <View style={tw`flex-row justify-center space-x-4`}>
            {onConfirm && (
              <TouchableOpacity
                style={tw`
                  bg-[${colors.primary}] px-6 py-2 rounded-xl
                  flex-row items-center
                `}
                onPress={onConfirm}
              >
                <Text style={tw`text-white font-semibold`}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={tw`
                bg-[${colors.surface}] px-6 py-2 rounded-xl
                border border-[${colors.border}]
                flex-row items-center
              `}
              onPress={onClose}
            >
              <Text style={tw`text-[${colors.text.primary}] font-semibold`}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 