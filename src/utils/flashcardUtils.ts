import { Flashcard, FlashcardDeck, FlashcardState } from '../types/index';
import { storage } from './storage';

// Storage keys
export const STORAGE_KEYS = {
  FLASHCARD_PROGRESS: 'flashcard_progress',
  COMPLETED_DECKS: 'completed_decks',
  DECK_STATISTICS: 'deck_statistics',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Flashcard progress tracking
export interface FlashcardProgress {
  deckId: string;
  currentCardIndex: number;
  completedAt?: string;
  totalStudyTime: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface DeckStatistics {
  deckId: string;
  timesCompleted: number;
  averageScore: number;
  lastCompletedAt: string;
  totalStudyTime: number;
  favoriteCards: string[];
}

export interface UserPreferences {
  autoFlip: boolean;
  studyMode: 'sequential' | 'random' | 'spaced';
  showProgress: boolean;
  enableSound: boolean;
  cardAnimationSpeed: 'slow' | 'normal' | 'fast';
}

// Utility functions for flashcard operations
export const flashcardUtils = {
  /**
   * Shuffle an array of flashcards using Fisher-Yates algorithm
   */
  shuffleCards: (cards: Flashcard[]): Flashcard[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Calculate completion percentage
   */
  calculateProgress: (currentIndex: number, totalCards: number): number => {
    if (totalCards === 0) return 0;
    return Math.round((currentIndex / totalCards) * 100);
  },

  /**
   * Get estimated time remaining based on average time per card
   */
  getEstimatedTimeRemaining: (
    currentIndex: number,
    totalCards: number,
    averageTimePerCard: number = 30 // seconds
  ): number => {
    const remainingCards = totalCards - currentIndex;
    return remainingCards * averageTimePerCard;
  },

  /**
   * Format time in seconds to readable format
   */
  formatTime: (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  },

  /**
   * Calculate study score based on correct answers
   */
  calculateScore: (correctAnswers: number, totalAnswers: number): number => {
    if (totalAnswers === 0) return 0;
    return Math.round((correctAnswers / totalAnswers) * 100);
  },

  /**
   * Get next card based on study mode
   */
  getNextCardIndex: (
    currentIndex: number,
    totalCards: number,
    studyMode: UserPreferences['studyMode'] = 'sequential'
  ): number | null => {
    switch (studyMode) {
      case 'sequential':
        return currentIndex < totalCards - 1 ? currentIndex + 1 : null;
      
      case 'random':
        if (totalCards <= 1) return null;
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * totalCards);
        } while (nextIndex === currentIndex);
        return nextIndex;
      
      case 'spaced':
        // For spaced repetition, this would integrate with a more complex algorithm
        // For now, fall back to sequential
        return currentIndex < totalCards - 1 ? currentIndex + 1 : null;
      
      default:
        return currentIndex < totalCards - 1 ? currentIndex + 1 : null;
    }
  },

  /**
   * Save flashcard progress to storage
   */
  saveProgress: async (deckId: string, progress: FlashcardProgress): Promise<void> => {
    try {
      const existingProgresses = await storage.get<Record<string, FlashcardProgress>>(
        STORAGE_KEYS.FLASHCARD_PROGRESS
      ) || {};
      
      existingProgresses[deckId] = progress;
      await storage.set(STORAGE_KEYS.FLASHCARD_PROGRESS, existingProgresses);
    } catch (error) {
      console.error('Failed to save flashcard progress:', error);
    }
  },

  /**
   * Load flashcard progress from storage
   */
  loadProgress: async (deckId: string): Promise<FlashcardProgress | null> => {
    try {
      const progresses = await storage.get<Record<string, FlashcardProgress>>(
        STORAGE_KEYS.FLASHCARD_PROGRESS
      );
      return progresses?.[deckId] || null;
    } catch (error) {
      console.error('Failed to load flashcard progress:', error);
      return null;
    }
  },

  /**
   * Save deck statistics
   */
  saveDeckStatistics: async (deckId: string, stats: DeckStatistics): Promise<void> => {
    try {
      const existingStats = await storage.get<Record<string, DeckStatistics>>(
        STORAGE_KEYS.DECK_STATISTICS
      ) || {};
      
      existingStats[deckId] = stats;
      await storage.set(STORAGE_KEYS.DECK_STATISTICS, existingStats);
    } catch (error) {
      console.error('Failed to save deck statistics:', error);
    }
  },

  /**
   * Load deck statistics
   */
  loadDeckStatistics: async (deckId: string): Promise<DeckStatistics | null> => {
    try {
      const stats = await storage.get<Record<string, DeckStatistics>>(
        STORAGE_KEYS.DECK_STATISTICS
      );
      return stats?.[deckId] || null;
    } catch (error) {
      console.error('Failed to load deck statistics:', error);
      return null;
    }
  },

  /**
   * Save user preferences
   */
  saveUserPreferences: async (preferences: UserPreferences): Promise<void> => {
    try {
      await storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  },

  /**
   * Load user preferences with defaults
   */
  loadUserPreferences: async (): Promise<UserPreferences> => {
    try {
      const preferences = await storage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
      return {
        autoFlip: false,
        studyMode: 'sequential',
        showProgress: true,
        enableSound: false,
        cardAnimationSpeed: 'normal',
        ...preferences,
      };
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {
        autoFlip: false,
        studyMode: 'sequential',
        showProgress: true,
        enableSound: false,
        cardAnimationSpeed: 'normal',
      };
    }
  },

  /**
   * Mark deck as completed
   */
  markDeckCompleted: async (deckId: string): Promise<void> => {
    try {
      const completedDecks = await storage.get<string[]>(STORAGE_KEYS.COMPLETED_DECKS) || [];
      if (!completedDecks.includes(deckId)) {
        completedDecks.push(deckId);
        await storage.set(STORAGE_KEYS.COMPLETED_DECKS, completedDecks);
      }
    } catch (error) {
      console.error('Failed to mark deck as completed:', error);
    }
  },

  /**
   * Check if deck is completed
   */
  isDeckCompleted: async (deckId: string): Promise<boolean> => {
    try {
      const completedDecks = await storage.get<string[]>(STORAGE_KEYS.COMPLETED_DECKS) || [];
      return completedDecks.includes(deckId);
    } catch (error) {
      console.error('Failed to check deck completion:', error);
      return false;
    }
  },

  /**
   * Get all completed decks
   */
  getCompletedDecks: async (): Promise<string[]> => {
    try {
      return await storage.get<string[]>(STORAGE_KEYS.COMPLETED_DECKS) || [];
    } catch (error) {
      console.error('Failed to get completed decks:', error);
      return [];
    }
  },

  /**
   * Reset all progress for a deck
   */
  resetDeckProgress: async (deckId: string): Promise<void> => {
    try {
      const progresses = await storage.get<Record<string, FlashcardProgress>>(
        STORAGE_KEYS.FLASHCARD_PROGRESS
      ) || {};
      
      delete progresses[deckId];
      await storage.set(STORAGE_KEYS.FLASHCARD_PROGRESS, progresses);

      // Also remove from completed decks
      const completedDecks = await storage.get<string[]>(STORAGE_KEYS.COMPLETED_DECKS) || [];
      const updatedCompleted = completedDecks.filter(id => id !== deckId);
      await storage.set(STORAGE_KEYS.COMPLETED_DECKS, updatedCompleted);
    } catch (error) {
      console.error('Failed to reset deck progress:', error);
    }
  },

  /**
   * Validate flashcard data structure
   */
  validateFlashcard: (card: any): card is Flashcard => {
    return (
      typeof card === 'object' &&
      card !== null &&
      typeof card.id === 'string' &&
      typeof card.title === 'string' &&
      typeof card.question === 'string' &&
      typeof card.explanation === 'string' &&
      card.id.length > 0 &&
      card.title.length > 0 &&
      card.question.length > 0 &&
      card.explanation.length > 0
    );
  },

  /**
   * Validate flashcard deck structure
   */
  validateFlashcardDeck: (deck: any): deck is FlashcardDeck => {
    return (
      typeof deck === 'object' &&
      deck !== null &&
      typeof deck.id === 'string' &&
      typeof deck.title === 'string' &&
      typeof deck.description === 'string' &&
      Array.isArray(deck.cards) &&
      deck.id.length > 0 &&
      deck.title.length > 0 &&
      deck.cards.every((card: any) => flashcardUtils.validateFlashcard(card))
    );
  },

  /**
   * Search flashcards by text content
   */
  searchFlashcards: (cards: Flashcard[], query: string): Flashcard[] => {
    if (!query.trim()) return cards;
    
    const lowercaseQuery = query.toLowerCase();
    return cards.filter(card => 
      card.title.toLowerCase().includes(lowercaseQuery) ||
      card.question.toLowerCase().includes(lowercaseQuery) ||
      card.explanation.toLowerCase().includes(lowercaseQuery)
    );
  },

  /**
   * Get flashcards by difficulty (based on explanation length as a simple heuristic)
   */
  filterByDifficulty: (cards: Flashcard[], difficulty: 'easy' | 'medium' | 'hard'): Flashcard[] => {
    return cards.filter(card => {
      const explanationLength = card.explanation.length;
      switch (difficulty) {
        case 'easy':
          return explanationLength < 200;
        case 'medium':
          return explanationLength >= 200 && explanationLength < 400;
        case 'hard':
          return explanationLength >= 400;
        default:
          return true;
      }
    });
  },

  /**
   * Get random subset of cards for quick review
   */
  getRandomCards: (cards: Flashcard[], count: number): Flashcard[] => {
    if (count >= cards.length) return flashcardUtils.shuffleCards(cards);
    
    const shuffled = flashcardUtils.shuffleCards(cards);
    return shuffled.slice(0, count);
  },

  /**
   * Export flashcard deck to JSON string
   */
  exportDeck: (deck: FlashcardDeck): string => {
    return JSON.stringify(deck, null, 2);
  },

  /**
   * Import flashcard deck from JSON string
   */
  importDeck: (jsonString: string): FlashcardDeck | null => {
    try {
      const deck = JSON.parse(jsonString);
      return flashcardUtils.validateFlashcardDeck(deck) ? deck : null;
    } catch (error) {
      console.error('Failed to import deck:', error);
      return null;
    }
  },

  /**
   * Get study streak information
   */
  getStudyStreak: async (): Promise<{ currentStreak: number; longestStreak: number; lastStudyDate: string | null }> => {
    try {
      const streak = await storage.get<{ currentStreak: number; longestStreak: number; lastStudyDate: string | null }>('study_streak') || {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      };
      return streak;
    } catch (error) {
      console.error('Failed to get study streak:', error);
      return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
    }
  },

  /**
   * Update study streak
   */
  updateStudyStreak: async (): Promise<void> => {
    try {
      const today = new Date().toDateString();
      const streak = await flashcardUtils.getStudyStreak();
      
      if (streak.lastStudyDate === today) {
        // Already studied today, no change needed
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newCurrentStreak = 1;
      if (streak.lastStudyDate === yesterdayString) {
        // Continuing streak
        newCurrentStreak = streak.currentStreak + 1;
      }

      const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

      await storage.set('study_streak', {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: today,
      });
    } catch (error) {
      console.error('Failed to update study streak:', error);
    }
  },
};