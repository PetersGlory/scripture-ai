// app/games/bible-trivia.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import CustomAlert from '@/components/CustomAlert';
import { triviaService, updateGameStats } from '@/services/api';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  reference: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type GameMode = 'quick' | 'challenge' | 'daily';

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: 'apps-outline' },
  { id: 'old-testament', name: 'Old Testament', icon: 'book-outline' },
  { id: 'new-testament', name: 'New Testament', icon: 'book-outline' },
  { id: 'jesus', name: 'Life of Jesus', icon: 'star-outline' },
  { id: 'prophets', name: 'Prophets', icon: 'people-outline' },
  { id: 'miracles', name: 'Miracles', icon: 'flash-outline' },
  { id: 'parables', name: 'Parables', icon: 'chatbubble-outline' },
];

export default function BibleTriviaScreen() {
  const { user } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as 'error' | 'success' | 'warning' | 'info',
  });
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [newAchievements, setNewAchievements] = useState<any[]>([]);
    const [showAchievementModal, setShowAchievementModal] = useState(false);



  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0 && !showExplanation) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, showExplanation]);

  const handleTimeout = () => {
    setTimerActive(false);
    setLives(prev => {
    const newLives = prev - 1;
        if (newLives <= 0) {
            endGame();
        }
        return newLives;
    });

    setStreak(0);
    setShowExplanation(true);
  };

  const startGame = async () => {
    setLoading(true);
    try {
      // Generate questions using AI
      const generatedQuestions = await generateQuestions(selectedCategory, difficulty);
      setQuestions(generatedQuestions);
      setGameStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setLives(3);
      setStreak(0);
      setTimeLeft(30);
      setTimerActive(true);
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to generate questions. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async (category: string, difficulty: string): Promise<Question[]> => {
    // This would call your backend API that uses Gemini to generate questions
    // For now, returning mock data
    // console.log("generating")
    try {
        const response = await triviaService.generateTriviaQuestions(category, difficulty, 10);
        // console.log("generated the following: ", response)
        return response.questions;
    } catch (error) {
        console.error('Error generating questions:', error);
        
        return [
        {
            id: '1',
            question: 'Who was the first king of Israel?',
            options: ['David', 'Saul', 'Solomon', 'Samuel'],
            correctAnswer: 1,
            explanation: 'Saul was anointed as the first king of Israel by the prophet Samuel, as described in 1 Samuel 10:1.',
            reference: '1 Samuel 10:1',
            difficulty: 'easy',
        },
        {
            id: '2',
            question: 'How many days did God take to create the world?',
            options: ['5 days', '6 days', '7 days', '8 days'],
            correctAnswer: 1,
            explanation: 'God created the world in 6 days and rested on the 7th day, as described in Genesis 1-2.',
            reference: 'Genesis 1-2',
            difficulty: 'easy',
        },
        {
            id: '3',
            question: 'What was the name of the garden where Adam and Eve lived?',
            options: ['Garden of Gethsemane', 'Garden of Eden', 'Garden of Peace', 'Garden of Paradise'],
            correctAnswer: 1,
            explanation: 'Adam and Eve lived in the Garden of Eden before the fall, as described in Genesis 2:8.',
            reference: 'Genesis 2:8',
            difficulty: 'easy',
        },
        {
            id: '4',
            question: 'Who built the ark to survive the flood?',
            options: ['Moses', 'Abraham', 'Noah', 'Joseph'],
            correctAnswer: 2,
            explanation: 'Noah built the ark according to God\'s instructions to save his family and the animals from the flood.',
            reference: 'Genesis 6-9',
            difficulty: 'easy',
        },
        {
            id: '5',
            question: 'What did Jesus turn water into at the wedding in Cana?',
            options: ['Milk', 'Wine', 'Juice', 'Oil'],
            correctAnswer: 1,
            explanation: 'Jesus performed his first miracle by turning water into wine at a wedding in Cana.',
            reference: 'John 2:1-11',
            difficulty: 'medium',
        },
        ];
        throw new Error('Failed to generate questions. Please try again.');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setTimerActive(false);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const streakBonus = streak * 5;
      setScore(score + points + streakBonus);
      setStreak(streak + 1);
      setCorrectAnswers(prev => prev + 1);

    } else {
      setLives(lives - 1);
      setStreak(0);
      if (lives <= 1) {
        endGame();
        return;
      }
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setTimerActive(false);
    setGameOver(true);

    const questionsAnswered = currentQuestionIndex + 1;
    const isPerfect = lives === 3 && correctAnswers === questions.length;

    try {
        const result = await updateGameStats(
        {
            score,
            questionsAnswered,
            correctAnswers,
            isPerfect,
            longestStreak: streak
        },
        user?.token || ''
        );

        if (result?.newAchievements?.length > 0) {
        setNewAchievements(result.newAchievements);
        setShowAchievementModal(true);
        }

    } catch (error) {
        console.error('Error updating stats:', error);
    }
    };


  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setLives(3);
    setStreak(0);
    setShowExplanation(false);
    setTimeLeft(30);
    setTimerActive(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Game Setup Screen
  if (!gameStarted) {
    return (
      <SafeAreaView style={tw`flex-1 py-5 bg-gray-50`}>
        {/* Header */}
        <View style={tw`px-6 pt-6 pb-4 bg-white border-b border-gray-200`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={tw`mr-4`}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={tw`flex-1`}>
              <AppText style={tw`text-2xl text-gray-900`} weight="bold">
                Bible Trivia
              </AppText>
              <AppText style={tw`text-gray-600 text-sm`}>
                Test your biblical knowledge
              </AppText>
            </View>
          </View>
        </View>

        <ScrollView 
          style={tw`flex-1`}
          contentContainerStyle={tw`px-6 py-6`}
          showsVerticalScrollIndicator={false}
        >
          {/* Difficulty Selection */}
          <View style={tw`mb-6`}>
            <AppText style={tw`text-gray-900 text-base mb-3`} weight="bold">
              Select Difficulty
            </AppText>
            <View style={tw`flex-row gap-3`}>
              {['easy', 'medium', 'hard'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={tw`flex-1 py-4 rounded-2xl border-2 ${
                    difficulty === level
                      ? `border-[${PRIMARY_COLOR}] bg-[${PRIMARY_COLOR}]/10`
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setDifficulty(level as any)}
                >
                  <AppText 
                    style={tw`text-center ${
                      difficulty === level ? `text-[${PRIMARY_COLOR}]` : 'text-gray-600'
                    }`}
                    weight={difficulty === level ? 'bold' : 'regular'}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={tw`mb-6`}>
            <AppText style={tw`text-gray-900 text-base mb-3`} weight="bold">
              Choose Category
            </AppText>
            <View style={tw`gap-3`}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={tw`flex-row items-center p-4 rounded-2xl border ${
                    selectedCategory === category.id
                      ? `border-[${PRIMARY_COLOR}] bg-[${PRIMARY_COLOR}]/10`
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={tw`w-10 h-10 rounded-full ${
                    selectedCategory === category.id
                      ? `bg-[${PRIMARY_COLOR}]`
                      : 'bg-gray-100'
                  } items-center justify-center mr-3`}>
                    <Ionicons 
                      name={category.icon as any} 
                      size={20} 
                      color={selectedCategory === category.id ? 'white' : '#6B7280'}
                    />
                  </View>
                  <AppText 
                    style={tw`${
                      selectedCategory === category.id 
                        ? `text-[${PRIMARY_COLOR}]` 
                : 'text-gray-700'
                    } text-base`}
                    weight={selectedCategory === category.id ? 'bold' : 'regular'}
                  >
                    {category.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={tw`bg-[${PRIMARY_COLOR}] py-4 rounded-2xl mt-4 shadow-lg`}
            onPress={startGame}
            disabled={loading}
          >
            {loading ? (
              <View style={tw`flex-row items-center justify-center`}>
                <ActivityIndicator color="white" />
                <AppText style={tw`text-white ml-2`} weight="bold">
                  Generating Questions...
                </AppText>
              </View>
            ) : (
              <AppText style={tw`text-white text-center text-base`} weight="bold">
                Start Game
              </AppText>
            )}
          </TouchableOpacity>
        </ScrollView>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
        />
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (gameOver) {
    const percentage = Math.round((score / (questions.length * 30)) * 100);
    
    return (
      <SafeAreaView style={tw`flex-1 py-4 bg-gray-50`}>
        <ScrollView 
          contentContainerStyle={tw`flex-grow items-center justify-center px-6 py-12`}
          showsVerticalScrollIndicator={false}
        >
          {/* Trophy Icon */}
          <View style={tw`w-24 h-24 rounded-full bg-[${PRIMARY_COLOR}]/10 items-center justify-center mb-6`}>
            <Ionicons name="trophy" size={48} color={PRIMARY_COLOR} />
          </View>

          <AppText style={tw`text-3xl text-gray-900 mb-2`} weight="bold">
            Game Over!
          </AppText>
          
          <AppText style={tw`text-gray-600 text-center mb-8`}>
            Great job! Keep learning Scripture
          </AppText>

          {/* Stats */}
          <View style={tw`w-full bg-white rounded-3xl p-6 mb-6 border border-gray-200`}>
            <View style={tw`flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100`}>
              <AppText style={tw`text-gray-600`}>Final Score</AppText>
              <AppText style={tw`text-3xl text-[${PRIMARY_COLOR}]`} weight="bold">
                {score}
              </AppText>
            </View>

            <View style={tw`gap-3`}>
              <View style={tw`flex-row items-center justify-between`}>
                <AppText style={tw`text-gray-600`}>Questions Answered</AppText>
                <AppText style={tw`text-gray-900`} weight="bold">
                  {currentQuestionIndex + 1} / {questions.length}
                </AppText>
              </View>

              <View style={tw`flex-row items-center justify-between`}>
                <AppText style={tw`text-gray-600`}>Accuracy</AppText>
                <AppText style={tw`text-gray-900`} weight="bold">
                  {percentage}%
                </AppText>
              </View>

              <View style={tw`flex-row items-center justify-between`}>
                <AppText style={tw`text-gray-600`}>Best Streak</AppText>
                <AppText style={tw`text-gray-900`} weight="bold">
                  {streak} 🔥
                </AppText>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`w-full gap-3`}>
            <TouchableOpacity
              style={tw`bg-[${PRIMARY_COLOR}] py-4 rounded-2xl`}
              onPress={resetGame}
            >
              <AppText style={tw`text-white text-center text-base`} weight="bold">
                Play Again
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`bg-gray-100 py-4 rounded-2xl`}
              onPress={() => router.back()}
            >
              <AppText style={tw`text-gray-700 text-center text-base`} weight="bold">
                Back to Games
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Game Play Screen
  return (
    <SafeAreaView style={tw`flex-1 py-4 bg-gray-50`}>
      {/* Header */}
      <View style={tw`px-6 pt-3 pb-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Lives */}
          <View style={tw`flex-row items-center gap-1`}>
            {[...Array(3)].map((_, i) => (
              <Ionicons
                key={i}
                name="heart"
                size={20}
                color={i < lives ? '#EF4444' : '#E5E7EB'}
              />
            ))}
          </View>

          {/* Score */}
          <View style={tw`flex-row items-center`}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <AppText style={tw`text-gray-900 ml-1`} weight="bold">
              {score}
            </AppText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <AppText style={tw`text-xs text-gray-600`}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </AppText>
          {streak > 0 && (
            <View style={tw`flex-row items-center`}>
              <AppText style={tw`text-xs text-[${PRIMARY_COLOR}]`} weight="bold">
                {streak} streak 🔥
              </AppText>
            </View>
          )}
        </View>
        <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
          <View 
            style={[tw`h-full bg-[${PRIMARY_COLOR}]`, { 
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
            }]} 
          />
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer */}
        <View style={tw`items-center mb-6`}>
          <View style={tw`w-20 h-20 rounded-full border-4 ${
            timeLeft <= 10 ? 'border-red-500' : `border-[${PRIMARY_COLOR}]`
          } items-center justify-center`}>
            <AppText 
              style={tw`text-3xl ${timeLeft <= 10 ? 'text-red-500' : `text-[${PRIMARY_COLOR}]`}`} 
              weight="bold"
            >
              {timeLeft}
            </AppText>
          </View>
        </View>

        {/* Question */}
        <View style={tw`bg-white rounded-3xl p-6 mb-6 border border-gray-200`}>
          <AppText style={tw`text-gray-900 text-lg text-center leading-7`} weight="bold">
            {currentQuestion?.question}
          </AppText>
        </View>

        {/* Options */}
        <View style={tw`gap-3 mb-6`}>
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = showExplanation;

            let backgroundColor = 'bg-white';
            let borderColor = 'border-gray-200';
            let textColor = 'text-gray-900';

            if (showResult) {
              if (isCorrect) {
                backgroundColor = 'bg-green-50';
                borderColor = 'border-green-500';
                textColor = 'text-green-700';
              } else if (isSelected && !isCorrect) {
                backgroundColor = 'bg-red-50';
                borderColor = 'border-red-500';
                textColor = 'text-red-700';
              }
            } else if (isSelected) {
              backgroundColor = `bg-[${PRIMARY_COLOR}]/10`;
              borderColor = `border-[${PRIMARY_COLOR}]`;
              textColor = `text-[${PRIMARY_COLOR}]`;
            }

            return (
              <TouchableOpacity
                key={index}
                style={tw`${backgroundColor} border-2 ${borderColor} p-4 rounded-2xl flex-row items-center`}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null || showExplanation}
              >
                <View style={tw`w-8 h-8 rounded-full border-2 ${borderColor} items-center justify-center mr-3`}>
                  {showResult && isCorrect && (
                    <Ionicons name="checkmark" size={18} color="#10B981" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Ionicons name="close" size={18} color="#EF4444" />
                  )}
                  {!showResult && (
                    <AppText style={tw`${textColor} text-sm`} weight="bold">
                      {String.fromCharCode(65 + index)}
                    </AppText>
                  )}
                </View>
                <AppText style={tw`${textColor} flex-1 text-xs`} weight="regular" italic>
                  {option}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View style={tw`bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6`}>
            <View style={tw`flex-row items-start mb-3`}>
              <Ionicons name="book-outline" size={20} color="#3B82F6" style={tw`mt-0.5 mr-2`} />
              <View style={tw`flex-1`}>
                <AppText style={tw`text-blue-900 text-sm mb-1`} weight="bold">
                  {currentQuestion.reference}
                </AppText>
                <AppText style={tw`text-blue-800 text-sm leading-5`}>
                  {currentQuestion.explanation}
                </AppText>
              </View>
            </View>
          </View>
        )}

        {/* Next Button */}
        {showExplanation && (
          <TouchableOpacity
            style={tw`bg-[${PRIMARY_COLOR}] py-4 rounded-2xl`}
            onPress={handleNextQuestion}
          >
            <AppText style={tw`text-white text-center text-base`} weight="bold">
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Game'}
            </AppText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}