// app/profile/achievements.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAchievements } from '@/services/api';

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  type: string;
  rarity: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  percentage: number;
};

const BadgeCard = ({ badge }: { badge: Badge }) => {
  const rarityColors = {
    common: '#9CA3AF',
    rare: '#8B7BFF',
    epic: '#EC4899',
    legendary: '#F59E0B'
  };

  return (
    <View style={tw`bg-white rounded-2xl p-4 mb-3 border ${
      badge.unlocked ? `border-[${badge.color}]` : 'border-gray-200'
    } ${!badge.unlocked ? 'opacity-60' : ''}`}>
      <View style={tw`flex-row items-start`}>
        {/* Icon */}
        <View style={[tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`, {
          backgroundColor: badge.unlocked ? `${badge.color}20` : '#F3F4F6'
        }]}>
          <AppText style={tw`text-4xl`}>{badge.icon}</AppText>
          {badge.unlocked && (
            <View style={tw`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 items-center justify-center`}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <AppText style={tw`text-gray-900 text-base mr-2`} weight="bold">
              {badge.name}
            </AppText>
            <View style={[tw`px-2 py-0.5 rounded-full`, {
              backgroundColor: `${rarityColors[badge.rarity as keyof typeof rarityColors]}20`
            }]}>
              <AppText style={tw`text-[10px]`} weight="bold" 
                color={rarityColors[badge.rarity as keyof typeof rarityColors]}>
                {badge.rarity.toUpperCase()}
              </AppText>
            </View>
          </View>

          <AppText style={tw`text-gray-600 text-xs mb-2`}>
            {badge.description}
          </AppText>

          {badge.unlocked ? (
            <View style={tw`flex-row items-center`}>
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />
              <AppText style={tw`text-gray-500 text-[10px] ml-1`}>
                Unlocked {new Date(badge.unlockedAt!).toLocaleDateString()}
              </AppText>
            </View>
          ) : (
            <View>
              <View style={tw`flex-row items-center justify-between mb-1`}>
                <AppText style={tw`text-gray-600 text-[10px]`}>
                  Progress: {badge.progress}/{badge.maxProgress}
                </AppText>
                <AppText style={tw`text-gray-600 text-[10px]`}>
                  {badge.percentage}%
                </AppText>
              </View>
              <View style={tw`h-1.5 bg-gray-200 rounded-full overflow-hidden`}>
                <View 
                  style={[tw`h-full`, { 
                    width: `${badge.percentage}%`,
                    backgroundColor: badge.color
                  }]} 
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const StatCard = ({ icon, label, value, color }: { 
  icon: string; 
  label: string; 
  value: string | number;
  color: string;
}) => (
  <View style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-200`}>
    <View style={[tw`w-10 h-10 rounded-full items-center justify-center mb-2`, {
      backgroundColor: `${color}20`
    }]}>
      <AppText style={tw`text-xl`}>{icon}</AppText>
    </View>
    <AppText style={tw`text-gray-500 text-xs mb-1`}>{label}</AppText>
    <AppText style={tw`text-gray-900 text-xl`} weight="bold">{value}</AppText>
  </View>
);

export default function AchievementsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<Badge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await getUserAchievements(user?.token || '');
      setAchievements(data.achievements);
      setStats(data.stats);
      setTotalUnlocked(data.totalUnlocked);
      setTotalBadges(data.totalBadges);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAchievements();
  };

  const filteredAchievements = achievements.filter(badge => {
    if (filter === 'unlocked') return badge.unlocked;
    if (filter === 'locked') return !badge.unlocked;
    return true;
  });

  const completionPercentage = totalBadges > 0 
    ? Math.round((totalUnlocked / totalBadges) * 100)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`px-6 pt-8 pb-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center mb-4`}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={tw`mr-4`}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <AppText style={tw`text-2xl text-gray-900`} weight="bold">
              Achievements
            </AppText>
            <AppText style={tw`text-gray-600 text-sm`}>
              {totalUnlocked} of {totalBadges} unlocked ({completionPercentage}%)
            </AppText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden mb-4`}>
          <View 
            style={[tw`h-full bg-[${PRIMARY_COLOR}]`, { 
              width: `${completionPercentage}%` 
            }]} 
          />
        </View>

        {/* Filters */}
        <View style={tw`flex-row gap-2`}>
          {['all', 'unlocked', 'locked'].map((f) => (
            <TouchableOpacity
              key={f}
              style={tw`flex-1 py-2 rounded-full ${
                filter === f
                  ? `bg-[${PRIMARY_COLOR}]`
                  : 'bg-gray-100'
              }`}
              onPress={() => setFilter(f as any)}
            >
              <AppText 
                style={tw`text-center text-sm ${
                  filter === f ? 'text-white' : 'text-gray-600'
                }`}
                weight={filter === f ? 'bold' : 'regular'}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        {/* Stats */}
        {stats && (
          <View style={tw`flex-row gap-3 mb-6`}>
            <StatCard 
              icon="🎮" 
              label="Games Played" 
              value={stats.gamesPlayed}
              color={PRIMARY_COLOR}
            />
            <StatCard 
              icon="⭐" 
              label="Total Score" 
              value={stats.totalScore}
              color="#F59E0B"
            />
            <StatCard 
              icon="🔥" 
              label="Best Streak" 
              value={stats.longestStreak}
              color="#EF4444"
            />
          </View>
        )}

        {/* Badges */}
        <AppText style={tw`text-gray-900 text-base mb-4`} weight="bold">
          {filter === 'all' && 'All Badges'}
          {filter === 'unlocked' && 'Unlocked Badges'}
          {filter === 'locked' && 'Locked Badges'}
        </AppText>

        {filteredAchievements.length > 0 ? (
          filteredAchievements.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))
        ) : (
          <View style={tw`items-center py-12`}>
            <AppText style={tw`text-gray-500 text-center`}>
              No badges found
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}