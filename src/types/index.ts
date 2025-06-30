export interface Flashcard {
  id: string;
  title: string;
  question: string;
  explanation: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
}

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Semantic colors
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  error: string;
  errorBackground: string;
  info: string;
  infoBackground: string;
  
  // Interactive colors
  link: string;
  linkPressed: string;
  border: string;
  borderFocus: string;
  shadow: string;
  accent: string;
  
  // Component-specific colors
  cardBackground: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDisabled: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
}

export type NavigationParamList = {
  Home: undefined;
  Flashcards: { deckId: string; title?: string };
  Settings: undefined;
};

export interface FlashcardState {
  currentCardIndex: number;
  isFlipped: boolean;
  isComplete: boolean;
  progress: number;
}
