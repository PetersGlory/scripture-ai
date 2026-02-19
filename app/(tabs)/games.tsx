// app/(tabs)/games.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';

type GameCard = {
  id: string;
  title: string;
  description: string;
  icon: any; // Ionicons name
  iconColor: string;
  available: boolean;
  difficulty?: string;
  playCount?: number;
  route?: string;
  badge?: string;
};

const games: GameCard[] = [
  {
    id: '1',
    title: 'Bible Trivia',
    description: 'Test your biblical knowledge with AI-generated questions',
    icon: 'book-outline',
    iconColor: '#4A7C59',
    available: true,
    difficulty: 'All Levels',
    playCount: 1234,
    route: '/games/bible-trivia',
    badge: 'New',
  },
  {
    id: '2',
    title: 'Verse Memory',
    description: 'Memorize scripture through interactive challenges',
    icon: 'bulb-outline',
    iconColor: '#F59E0B',
    available: false,
    difficulty: 'Medium',
    badge: 'Coming Soon',
  },
  {
    id: '3',
    title: 'Biblical Characters',
    description: 'Guess the character from biblical clues',
    icon: 'people-outline',
    iconColor: '#8B5CF6',
    available: false,
    difficulty: 'Easy',
    badge: 'Coming Soon',
  },
  {
    id: '4',
    title: 'Parable Puzzle',
    description: 'Complete parables and learn their meanings',
    icon: 'extension-puzzle-outline',
    iconColor: '#EC4899',
    available: false,
    difficulty: 'Hard',
    badge: 'Coming Soon',
  },
];

const GameCardComponent = ({ game }: { game: GameCard }) => {
  const handlePress = () => {
    if (game.available && game.route) {
      router.push(game.route as any);
    }
  };

  return (
    <TouchableOpacity
      style={tw`mb-3 ${!game.available ? 'opacity-50' : ''}`}
      onPress={handlePress}
      activeOpacity={game.available ? 0.7 : 1}
      disabled={!game.available}
    >
      <View style={tw`bg-white rounded-2xl p-4 border border-gray-200 shadow-sm`}>
        <View style={tw`flex-row items-center`}>
          {/* Icon */}
          <View style={[tw`w-14 h-14 rounded-2xl items-center justify-center mr-4`, {
            backgroundColor: `${game.iconColor}15`
          }]}>
            <Ionicons name={game.icon} size={28} color={game.iconColor} />
          </View>

          {/* Content */}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              <AppText style={tw`text-gray-900 text-base mr-2`} weight="bold">
                {game.title}
              </AppText>
              {game.badge && (
                <View style={tw`px-2 py-0.5 rounded-full ${game.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <AppText style={tw`text-[10px] ${game.available ? 'text-green-700' : 'text-gray-600'}`} weight="bold">
                    {game.badge}
                  </AppText>
                </View>
              )}
            </View>
            
            <AppText style={tw`text-gray-600 text-xs mb-2`} numberOfLines={2}>
              {game.description}
            </AppText>

            {/* Meta Info */}
            {game.available && (
              <View style={tw`flex-row items-center gap-3`}>
                {game.difficulty && (
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="speedometer-outline" size={12} color="#9CA3AF" />
                    <AppText style={tw`text-gray-500 text-[10px] ml-1`}>
                      {game.difficulty}
                    </AppText>
                  </View>
                )}
                
                {game.playCount && (
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="people-outline" size={12} color="#9CA3AF" />
                    <AppText style={tw`text-gray-500 text-[10px] ml-1`}>
                      {game.playCount}+ plays
                    </AppText>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Arrow */}
          {game.available && (
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function GamesScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`px-6 pt-8 pb-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1`}>
            <AppText style={tw`text-xl text-gray-900 mb-1`} weight="bold">
              Faith Games
            </AppText>
            <AppText style={tw`text-gray-600 text-xs`}>
              Learn Scripture through play
            </AppText>
          </View>
          <TouchableOpacity 
            style={tw`w-11 h-11 rounded-full bg-gray-100 items-center justify-center`}
            onPress={() => router.push('/achievements' as any)}
          >
            <Ionicons name="trophy-outline" size={22} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge Banner */}
        <TouchableOpacity 
          style={tw`mb-6`}
          activeOpacity={0.8}
        >
          <View style={tw`bg-[${PRIMARY_COLOR}] rounded-2xl p-5`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-1 pr-4`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <Ionicons name="calendar-outline" size={14} color="white" />
                  <AppText style={tw`text-white/80 text-[10px] ml-1.5`} weight="bold">
                    DAILY CHALLENGE
                  </AppText>
                </View>
                <AppText style={tw`text-white text-base mb-1`} weight="bold">
                  Today's Scripture Quiz
                </AppText>
                <AppText style={tw`text-white/80 text-xs`}>
                  Complete to earn bonus points!
                </AppText>
              </View>
              <View style={tw`w-12 h-12 rounded-full bg-white/20 items-center justify-center`}>
                <Ionicons name="flash" size={24} color="white" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section Title */}
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <AppText style={tw`text-base text-gray-900`} weight="bold">
            All Games
          </AppText>
          <AppText style={tw`text-xs text-gray-500`}>
            {games.filter(g => g.available).length} of {games.length} available
          </AppText>
        </View>

        {/* Games List */}
        {games.map(game => (
          <GameCardComponent key={game.id} game={game} />
        ))}

        {/* Coming Soon Message */}
        <View style={tw`bg-blue-50 rounded-2xl p-4 mt-3 border border-blue-100`}>
          <View style={tw`flex-row items-start`}>
            <Ionicons name="information-circle" size={18} color="#3B82F6" style={tw`mt-0.5`} />
            <View style={tw`flex-1 ml-3`}>
              <AppText style={tw`text-gray-900 text-sm mb-1`} weight="bold">
                More games coming soon!
              </AppText>
              <AppText style={tw`text-gray-600 text-xs leading-4`}>
                We're working on new ways to help you learn Scripture through interactive games.
              </AppText>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={tw`h-6`} />
      </ScrollView>
    </SafeAreaView>
  );
}