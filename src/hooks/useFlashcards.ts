import { useState, useEffect, useCallback, useRef } from 'react';
import { FlashcardState, Flashcard, FlashcardDeck } from '../types/index';
import { 
  flashcardUtils, 
  FlashcardProgress, 
  DeckStatistics, 
  UserPreferences 
} from '../utils/flashcardUtils';

interface UseFlashcardsProps {
  deck: FlashcardDeck;
  onComplete?: (statistics: DeckStatistics) => void;
  onCardChange?: (cardIndex: number, card: Flashcard) => void;
  autoSave?: boolean;
}

export interface FlashcardSession {
  startTime: number;
  currentCardTime: number;
  totalAnswers: number;
  correctAnswers: number;
}

export const useFlashcards = ({ 
  deck, 
  onComplete, 
  onCardChange,
  autoSave = true 
}: UseFlashcardsProps) => {
  const [state, setState] = useState<FlashcardState>({
    currentCardIndex: 0,
    isFlipped: false,
    isComplete: false,
    progress: 0,
  });

  const [cards, setCards] = useState<Flashcard[]>(deck.cards);
  const [session, setSession] = useState<FlashcardSession>({
    startTime: Date.now(),
    currentCardTime: Date.now(),
    totalAnswers: 0,
    correctAnswers: 0,
  });
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    autoFlip: false,
    studyMode: 'sequential',
    showProgress: true,
    enableSound: false,
    cardAnimationSpeed: 'normal',
  });

  const [isLoading, setIsLoading] = useState(true);
  const sessionRef = useRef<FlashcardSession>(session);
  
  // Update session ref when session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Load user preferences and progress on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load user preferences
        const preferences = await flashcardUtils.loadUserPreferences();
        setUserPreferences(preferences);

        // Load previous progress if exists
        const progress = await flashcardUtils.loadProgress(deck.id);
        if (progress && progress.currentCardIndex < deck.cards.length) {
          setState(prev => ({
            ...prev,
            currentCardIndex: progress.currentCardIndex,
            progress: flashcardUtils.calculateProgress(progress.currentCardIndex, deck.cards.length),
          }));
        }

        // Apply study mode preferences
        if (preferences.studyMode === 'random') {
          setCards(flashcardUtils.shuffleCards(deck.cards));
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [deck.id, deck.cards]);

  // Auto-save progress
  useEffect(() => {
    if (!autoSave || isLoading) return;

    const saveProgress = async () => {
      const progress: FlashcardProgress = {
        deckId: deck.id,
        currentCardIndex: state.currentCardIndex,
        totalStudyTime: Math.floor((Date.now() - session.startTime) / 1000),
        correctAnswers: session.correctAnswers,
        totalAnswers: session.totalAnswers,
      };

      await flashcardUtils.saveProgress(deck.id, progress);
    };

    const timeoutId = setTimeout(saveProgress, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [state.currentCardIndex, session, deck.id, autoSave, isLoading]);

  // Calculate progress whenever current card index changes
  useEffect(() => {
    const newProgress = flashcardUtils.calculateProgress(state.currentCardIndex, cards.length);
    setState(prev => ({ ...prev, progress: newProgress }));
  }, [state.currentCardIndex, cards.length]);

  // Handle completion
  useEffect(() => {
    if (state.currentCardIndex >= cards.length && cards.length > 0 && !state.isComplete) {
      const completeSession = async () => {
        const totalTime = Math.floor((Date.now() - session.startTime) / 1000);
        const score = flashcardUtils.calculateScore(session.correctAnswers, session.totalAnswers);
        
        const statistics: DeckStatistics = {
          deckId: deck.id,
          timesCompleted: 1,
          averageScore: score,
          lastCompletedAt: new Date().toISOString(),
          totalStudyTime: totalTime,
          favoriteCards: [], // Could be enhanced to track user favorites
        };

        // Load existing stats and merge
        const existingStats = await flashcardUtils.loadDeckStatistics(deck.id);
        if (existingStats) {
          statistics.timesCompleted = existingStats.timesCompleted + 1;
          statistics.averageScore = Math.round(
            (existingStats.averageScore * existingStats.timesCompleted + score) / 
            statistics.timesCompleted
          );
          statistics.totalStudyTime += existingStats.totalStudyTime;
          statistics.favoriteCards = existingStats.favoriteCards;
        }

        await flashcardUtils.saveDeckStatistics(deck.id, statistics);
        await flashcardUtils.markDeckCompleted(deck.id);

        setState(prev => ({ ...prev, isComplete: true }));
        onComplete?.(statistics);
      };

      completeSession();
    }
  }, [state.currentCardIndex, cards.length, session, deck.id, onComplete, state.isComplete]);

  // Notify about card changes
  useEffect(() => {
    const currentCard = getCurrentCard();
    if (currentCard) {
      onCardChange?.(state.currentCardIndex, currentCard);
    }
  }, [state.currentCardIndex, cards, onCardChange]);

  const flipCard = useCallback(() => {
    setState(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
    setSession(prev => ({ ...prev, currentCardTime: Date.now() }));
  }, []);

  const nextCard = useCallback(() => {
    const nextIndex = flashcardUtils.getNextCardIndex(
      state.currentCardIndex, 
      cards.length, 
      userPreferences.studyMode
    );

    if (nextIndex !== null) {
      setState(prev => ({
        ...prev,
        currentCardIndex: nextIndex,
        isFlipped: false,
      }));
    } else {
      // Move to completion state
      setState(prev => ({
        ...prev,
        currentCardIndex: cards.length,
        isFlipped: false,
      }));
    }

    setSession(prev => ({ ...prev, currentCardTime: Date.now() }));
  }, [state.currentCardIndex, cards.length, userPreferences.studyMode]);

  const previousCard = useCallback(() => {
    if (state.currentCardIndex > 0) {
      setState(prev => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex - 1,
        isFlipped: false,
        isComplete: false,
      }));
      setSession(prev => ({ ...prev, currentCardTime: Date.now() }));
    }
  }, [state.currentCardIndex]);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < cards.length) {
      setState(prev => ({
        ...prev,
        currentCardIndex: index,
        isFlipped: false,
        isComplete: false,
      }));
      setSession(prev => ({ ...prev, currentCardTime: Date.now() }));
    }
  }, [cards.length]);

  const resetDeck = useCallback(async () => {
    setState({
      currentCardIndex: 0,
      isFlipped: false,
      isComplete: false,
      progress: 0,
    });
    
    setSession({
      startTime: Date.now(),
      currentCardTime: Date.now(),
      totalAnswers: 0,
      correctAnswers: 0,
    });

    // Reset stored progress
    if (autoSave) {
      await flashcardUtils.resetDeckProgress(deck.id);
    }

    // Re-shuffle if in random mode
    if (userPreferences.studyMode === 'random') {
      setCards(flashcardUtils.shuffleCards(deck.cards));
    }
  }, [deck.id, deck.cards, userPreferences.studyMode, autoSave]);

  const markAnswer = useCallback((isCorrect: boolean) => {
    setSession(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
    }));
  }, []);

  const shuffleCards = useCallback(() => {
    const shuffled = flashcardUtils.shuffleCards(cards);
    setCards(shuffled);
    setState(prev => ({ ...prev, currentCardIndex: 0, isFlipped: false }));
  }, [cards]);

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...newPreferences };
    setUserPreferences(updated);
    
    if (autoSave) {
      await flashcardUtils.saveUserPreferences(updated);
    }

    // Apply study mode changes immediately
    if (newPreferences.studyMode && newPreferences.studyMode !== userPreferences.studyMode) {
      if (newPreferences.studyMode === 'random') {
        setCards(flashcardUtils.shuffleCards(deck.cards));
        setState(prev => ({ ...prev, currentCardIndex: 0, isFlipped: false }));
      } else {
        setCards(deck.cards);
        setState(prev => ({ ...prev, currentCardIndex: 0, isFlipped: false }));
      }
    }
  }, [userPreferences, autoSave, deck.cards]);

  const getCurrentCard = useCallback(() => {
    if (state.currentCardIndex < cards.length) {
      return cards[state.currentCardIndex];
    }
    return null;
  }, [cards, state.currentCardIndex]);

  const getEstimatedTimeRemaining = useCallback(() => {
    const avgTimePerCard = session.totalAnswers > 0 
      ? (Date.now() - session.startTime) / session.totalAnswers 
      : 30000; // 30 seconds default
    
    return flashcardUtils.getEstimatedTimeRemaining(
      state.currentCardIndex,
      cards.length,
      Math.floor(avgTimePerCard / 1000)
    );
  }, [session, state.currentCardIndex, cards.length]);

  const getSessionStatistics = useCallback(() => {
    const totalTime = Math.floor((Date.now() - session.startTime) / 1000);
    const score = flashcardUtils.calculateScore(session.correctAnswers, session.totalAnswers);
    
    return {
      totalTime: flashcardUtils.formatTime(totalTime),
      score,
      correctAnswers: session.correctAnswers,
      totalAnswers: session.totalAnswers,
      estimatedTimeRemaining: flashcardUtils.formatTime(getEstimatedTimeRemaining()),
    };
  }, [session, getEstimatedTimeRemaining]);

  // Computed values
  const canGoNext = state.currentCardIndex < cards.length - 1;
  const canGoPrevious = state.currentCardIndex > 0;
  const isLastCard = state.currentCardIndex === cards.length - 1;
  const isFirstCard = state.currentCardIndex === 0;

  return {
    // State
    state,
    cards,
    session: getSessionStatistics(),
    userPreferences,
    isLoading,

    // Actions
    actions: {
      flipCard,
      nextCard,
      previousCard,
      goToCard,
      resetDeck,
      markAnswer,
      shuffleCards,
      updatePreferences,
    },

    // Selectors
    selectors: {
      getCurrentCard,
      canGoNext,
      canGoPrevious,
      isLastCard,
      isFirstCard,
      getEstimatedTimeRemaining,
      getSessionStatistics,
    },

    // Utilities
    utils: {
      searchCards: (query: string) => flashcardUtils.searchFlashcards(cards, query),
      filterByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => 
        flashcardUtils.filterByDifficulty(cards, difficulty),
    },
  };
};