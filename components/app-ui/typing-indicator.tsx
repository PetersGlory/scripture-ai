
import { View } from "react-native";
import tw from "twrnc"

export const TypingIndicator = () => (
  <View style={tw`mb-3 items-start`}>
    <View style={tw`bg-gray-100 px-5 py-3 rounded-3xl rounded-tl-md`}>
      <View style={tw`flex-row items-center`}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={tw`w-2 h-2 rounded-full bg-gray-400 mx-0.5`}
          />
        ))}
      </View>
    </View>
  </View>
);

