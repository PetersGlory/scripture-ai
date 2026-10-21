import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import tw from "twrnc";

const Dot = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 400,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: 400,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        false
      )
    );
    return () => {
      progress.value = withTiming(0);
    };
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.6,
    transform: [{ scale: 0.75 + progress.value * 0.35 }],
  }));

  return (
    <Animated.View
      style={[tw`w-2 h-2 rounded-full bg-gray-400 mx-0.5`, style]}
    />
  );
};

export const TypingIndicator = () => (
  <View style={tw`mb-3 items-start`} accessibilityLabel="Scripture AI is typing">
    <View style={tw`bg-gray-100 px-5 py-3 rounded-3xl rounded-tl-md`}>
      <View style={tw`flex-row items-center`}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  </View>
);
