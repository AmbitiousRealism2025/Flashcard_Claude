# AI Flashcards App

A modern, feature-rich flashcard application built with React Native and Expo, designed to help users learn and memorize information through interactive digital flashcards.

## 🚀 Features

### Core Functionality
- **Interactive Flashcards**: Tap to flip cards and reveal answers
- **Multiple Card Sets**: Pre-loaded with AI essentials and customizable card collections
- **Gesture Support**: Intuitive swipe gestures for navigation
- **Progress Tracking**: Monitor your learning progress with built-in analytics

### User Experience
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Accessibility Support**: Full screen reader and keyboard navigation support
- **Responsive Design**: Optimized for various screen sizes
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Haptic Feedback**: Tactile responses for better engagement

### Technical Features
- **Performance Optimized**: Virtualized lists for handling large card sets
- **Offline Support**: Local storage for seamless offline usage
- **Error Boundaries**: Robust error handling and recovery
- **Loading States**: Smooth loading experiences throughout the app

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet with theme support
- **Development**: ESLint, Prettier, TypeScript

## 📱 Screenshots

*(Add screenshots of your app here)*

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmbitiousRealism2025/Flashcard_Claude.git
   cd Flashcard_Claude
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📖 Usage

### Basic Navigation
- **Home Screen**: Overview of available flashcard sets
- **Flashcards Screen**: Interactive learning with card flipping
- **Settings Screen**: Customize themes and preferences

### Learning Flow
1. Select a flashcard set from the home screen
2. Tap cards to flip and reveal answers
3. Use swipe gestures to navigate between cards
4. Track your progress as you learn

### Customization
- Toggle between dark and light themes
- Adjust accessibility settings
- Customize card sets and content

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FlashCard.tsx   # Main flashcard component
│   ├── Button.tsx      # Custom button component
│   ├── ThemeToggle.tsx # Theme switching component
│   └── ...
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── FlashcardsScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/         # Navigation configuration
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── data/               # Flashcard data and content
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── constants/          # App constants and themes
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

### Test Coverage
- **Accessibility**: Screen reader and keyboard navigation tests
- **Performance**: Component rendering and optimization tests
- **Integration**: Navigation and user flow tests

## 🔧 Development

### Code Quality
```bash
# Linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Development Best Practices
- Follow TypeScript strict mode
- Use ESLint and Prettier for code consistency
- Implement proper error boundaries
- Write accessible components
- Optimize for performance

## 🎨 Customization

### Adding New Flashcard Sets
1. Create a new data file in `src/data/`
2. Define your flashcard structure following the existing pattern
3. Import and register in the main data index

### Theming
The app supports comprehensive theming through the `ThemeContext`. Customize colors, fonts, and spacing in `src/constants/theme.ts`.

### Accessibility
Built with accessibility in mind:
- Screen reader support
- Keyboard navigation
- High contrast themes
- Proper focus management

## 🚀 Deployment

### Building for Production
```bash
# Build for all platforms
expo build

# Platform-specific builds
expo build:ios
expo build:android
```

### Publishing with Expo
```bash
expo publish
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native and Expo teams for the excellent development platform
- Contributors and community members
- AI learning resources and educational content providers

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [FAQ](FAQ.md) for common questions
- Review the documentation

---

**Happy Learning!** 🎓✨ 