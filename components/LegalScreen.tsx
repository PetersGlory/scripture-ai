import React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
import tw from 'twrnc';
import AppText from '@/components/ui/AppText';
import ScreenHeader from '@/components/ui/ScreenHeader';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export default function LegalScreen({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScreenHeader title={title} />
      <ScrollView contentContainerStyle={tw`px-6 pb-12`}>
        <AppText style={tw`text-gray-500 text-xs mb-1`} italic>
          Last updated {updated}
        </AppText>
        <AppText style={tw`text-gray-700 text-sm leading-6 mt-2`}>{intro}</AppText>

        {sections.map((section) => (
          <View key={section.heading} style={tw`mt-7`}>
            <AppText
              style={tw`text-gray-900 text-base mb-2`}
              weight="bold"
            >
              {section.heading}
            </AppText>
            {section.paragraphs.map((paragraph, index) => (
              <AppText
                key={index}
                style={tw`text-gray-700 text-sm leading-6 mb-2`}
              >
                {paragraph}
              </AppText>
            ))}
          </View>
        ))}

        <View style={tw`mt-8 pt-4 border-t border-gray-100`}>
          <AppText style={tw`text-gray-500 text-sm`}>
            Questions about this page? Contact us at getscriptureai@gmail.com
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
