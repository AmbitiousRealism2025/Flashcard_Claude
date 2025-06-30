import { useState, useEffect, useCallback } from 'react';
import { FlashcardState, Flashcard } from '../types';

interface UseFlashcardStateProps {
  cards: Flashcard[];
  onComplete?: () => void;
}

export const useFlashcardState = ({ cards, onComplete }: UseFlashcardStateProps) => {
  const [state, setState] = useState<FlashcardState>({
    currentCardIndex: 0,
    isFlipped: false,
    isComplete: false,
    progress: 0,
  });

  // Calculate progress whenever current card index changes
  useEffect(() => {
    const newProgress = cards.length > 0 ? (state.currentCardIndex / cards.length) * 100 : 0;
    setState(prev => ({ ...prev, progress: newProgress }));
  }, [state.currentCardIndex, cards.length]);

  // Check if deck is complete
  useEffect(() => {
    if (state.currentCardIndex >= cards.length && cards.length > 0) {
      setState(prev => ({ ...prev, isComplete: true }));
      onComplete?.();
    }
  }, [state.currentCardIndex, cards.length, onComplete]);

  const flipCard = useCallback(() => {
    setState(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
  }, []);

  const nextCard = useCallback(() => {
    if (state.currentCardIndex < cards.length - 1) {
      setState(prev => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex + 1,
        isFlipped: false,
      }));
    } else {
      // Move to completion state
      setState(prev => ({
        ...prev,
        currentCardIndex: cards.length,
        isFlipped: false,
        isComplete: true,
      }));
    }
  }, [state.currentCardIndex, cards.length]);

  const previousCard = useCallback(() => {
    if (state.currentCardIndex > 0) {
      setState(prev => ({
        ...prev,
        currentCardIndex: prev.currentCardIndex - 1,
        isFlipped: false,
        isComplete: false,
      }));
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
    }
  }, [cards.length]);

  const resetDeck = useCallback(() => {
    setState({
      currentCardIndex: 0,
      isFlipped: false,
      isComplete: false,
      progress: 0,
    });
  }, []);

  const getCurrentCard = useCallback(() => {
    if (state.currentCardIndex < cards.length) {
      return cards[state.currentCardIndex];
    }
    return null;
  }, [cards, state.currentCardIndex]);

  const canGoNext = state.currentCardIndex < cards.length - 1;
  const canGoPrevious = state.currentCardIndex > 0;
  const isLastCard = state.currentCardIndex === cards.length - 1;
  const isFirstCard = state.currentCardIndex === 0;

  return {
    state,
    actions: {
      flipCard,
      nextCard,
      previousCard,
      goToCard,
      resetDeck,
    },
    selectors: {
      getCurrentCard,
      canGoNext,
      canGoPrevious,
      isLastCard,
      isFirstCard,
    },
  };
};