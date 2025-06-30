import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ListRenderItem,
  ViewToken,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { FlashCard } from './FlashCard';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { Flashcard } from '../types';
import { OptimizationHelpers, useVirtualizedList } from '../utils/performance';
import { AccessibilityHelpers, useAccessibilityContext } from '../utils/accessibility';
import { SPACING, ANIMATION_DURATION } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VirtualizedFlashcardListProps {
  flashcards: Flashcard[];
  onCardFlip: (cardId: string) => void;
  onCardSwipe: (cardId: string, direction: 'left' | 'right') => void;
  flippedCards: Set<string>;
  loading?: boolean;
  numColumns?: number;
  itemHeight?: number;
  onScrollToIndex?: (index: number) => void;
  initialScrollIndex?: number;
  horizontal?: boolean;
  pagingEnabled?: boolean;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[] }) => void;
}

export const VirtualizedFlashcardList: React.FC<VirtualizedFlashcardListProps> = React.memo(({
  flashcards,
  onCardFlip,
  onCardSwipe,
  flippedCards,
  loading = false,
  numColumns = 1,
  itemHeight = 280,
  onScrollToIndex,
  initialScrollIndex = 0,
  horizontal = false,
  pagingEnabled = false,
  onViewableItemsChanged,
}) => {
  const { colors } = useTheme();
  const { shouldReduceMotion, announce } = useAccessibilityContext();
  const flatListRef = useRef<FlatList>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Memoized styles
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Performance optimization: Use FlatList's built-in virtualization
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  // Memoized render item function
  const renderFlashcard: ListRenderItem<Flashcard> = useCallback(({ item, index }) => {
    const isFlipped = flippedCards.has(item.id);
    
    const handleFlip = () => {
      onCardFlip(item.id);
    };

    const handleSwipeLeft = () => {
      onCardSwipe(item.id, 'left');
      if (index < flashcards.length - 1) {
        announce('Moving to next card', 'polite');
      }
    };

    const handleSwipeRight = () => {
      onCardSwipe(item.id, 'right');
      if (index > 0) {
        announce('Moving to previous card', 'polite');
      }
    };

    return (
      <View style={[styles.cardContainer, { height: itemHeight }]}>
        <FlashCard
          card={item}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          style={styles.card}
        />
      </View>
    );
  }, [flashcards.length, flippedCards, onCardFlip, onCardSwipe, itemHeight, styles, announce]);

  // Optimized key extractor
  const keyExtractor = useCallback((item: Flashcard) => item.id, []);

  // Scroll event handlers
  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setIsScrolling(false);
  }, []);

  const handleMomentumScrollEnd = useCallback(() => {
    setIsScrolling(false);
  }, []);

  // Viewable items changed handler
  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      if (onViewableItemsChanged) {
        onViewableItemsChanged(info);
      }
      
      // Announce current card for accessibility
      if (info.viewableItems.length > 0 && !isScrolling) {
        const currentCard = info.viewableItems[0];
        if (currentCard?.item) {
          announce(
            `Card ${currentCard.index! + 1} of ${flashcards.length}: ${currentCard.item.title}`,
            'polite'
          );
        }
      }
    },
    [onViewableItemsChanged, isScrolling, flashcards.length, announce]
  );

  // Viewable items config for performance
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }), []);

  // Scroll to index function
  const scrollToIndex = useCallback((index: number, animated: boolean = true) => {
    if (flatListRef.current && index >= 0 && index < flashcards.length) {
      flatListRef.current.scrollToIndex({
        index,
        animated: animated && !shouldReduceMotion,
        viewPosition: 0.5,
      });
    }
  }, [flashcards.length, shouldReduceMotion]);

  // Expose scroll to index function
  React.useImperativeHandle(onScrollToIndex as any, () => ({
    scrollToIndex,
  }), [scrollToIndex]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner 
          size="large" 
          message="Loading flashcards..."
          overlay={false}
        />
      </View>
    );
  }

  // Empty state
  if (flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No flashcards available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={flashcards}
        renderItem={renderFlashcard}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        numColumns={numColumns}
        horizontal={horizontal}
        pagingEnabled={pagingEnabled}
        showsVerticalScrollIndicator={!horizontal}
        showsHorizontalScrollIndicator={horizontal}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={3}
        decelerationRate={shouldReduceMotion ? 'fast' : 'normal'}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
        {...AccessibilityHelpers.createListProps(
          'Flashcard list',
          flashcards.length,
          'Navigate through flashcards by scrolling'
        )}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.flashcards.length === nextProps.flashcards.length &&
    prevProps.flippedCards.size === nextProps.flippedCards.size &&
    prevProps.loading === nextProps.loading &&
    prevProps.numColumns === nextProps.numColumns &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.horizontal === nextProps.horizontal &&
    prevProps.pagingEnabled === nextProps.pagingEnabled &&
    prevProps.initialScrollIndex === nextProps.initialScrollIndex
  );
});

VirtualizedFlashcardList.displayName = 'VirtualizedFlashcardList';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingVertical: SPACING.MD,
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  card: {
    width: '100%',
    maxWidth: 350,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: SPACING.XL,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

// Additional utility component for grid layout
export const VirtualizedFlashcardGrid: React.FC<VirtualizedFlashcardListProps> = React.memo((props) => {
  return (
    <VirtualizedFlashcardList
      {...props}
      numColumns={2}
      itemHeight={200}
    />
  );
});

VirtualizedFlashcardGrid.displayName = 'VirtualizedFlashcardGrid';