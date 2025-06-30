import { FlashcardDeck } from '../types/index';
import { aiBeginnerFlashcards } from './aiFlashcards';
import { aiEssentialsFlashcards } from './aiEssentials';

// Export individual decks
export { aiEssentialsFlashcards, aiBeginnerFlashcards };

export const aiForBusinessFlashcards: FlashcardDeck = {
  id: 'ai-business-essentials',
  title: 'AI Tools for Business & Marketing',
  description: 'Master essential AI tools that can transform your business operations, marketing strategies, and content creation workflows',
  cards: [
    {
      id: 'chatgpt-business',
      title: 'ChatGPT for Business',
      question: 'How can ChatGPT revolutionize your business communications and content strategy?',
      explanation: 'ChatGPT excels at creating email templates, writing product descriptions, generating social media content, brainstorming marketing campaigns, and drafting professional documents. It can maintain your brand voice consistently across all communications and help scale your content production without sacrificing quality.'
    },
    {
      id: 'claude-analysis',
      title: 'Claude for Document Analysis',
      question: 'What makes Claude particularly powerful for business document processing and analysis?',
      explanation: 'Claude can analyze lengthy documents, contracts, and reports with exceptional accuracy. It excels at summarizing key points, identifying risks, extracting important data, and providing actionable insights. Perfect for busy executives who need quick, reliable document reviews and strategic recommendations.'
    },
    {
      id: 'dalle-marketing',
      title: 'DALL-E for Marketing Visuals',
      question: 'How can DALL-E transform your visual marketing without expensive design resources?',
      explanation: 'DALL-E creates professional-quality images, social media graphics, product mockups, and marketing visuals from simple text descriptions. You can generate multiple concept variations instantly, create seasonal campaigns, and produce consistent branded imagery without hiring expensive designers or purchasing stock photos.'
    },
    {
      id: 'midjourney-branding',
      title: 'Midjourney for Brand Development',
      question: 'Why is Midjourney the preferred choice for creating sophisticated brand imagery and artistic content?',
      explanation: 'Midjourney produces highly artistic, professional-grade images perfect for brand storytelling, website headers, premium marketing materials, and creative campaigns. Its superior aesthetic quality makes it ideal for businesses wanting to project a high-end, creative image that stands out from competitors.'
    },
    {
      id: 'github-copilot-productivity',
      title: 'GitHub Copilot for Business Automation',
      question: 'How can GitHub Copilot help non-technical business owners automate repetitive tasks?',
      explanation: 'GitHub Copilot helps create simple automation scripts for data processing, report generation, and workflow optimization. Even with basic technical knowledge, you can build tools to automate email campaigns, organize customer data, generate reports, and streamline business processes that traditionally required expensive software solutions.'
    },
    {
      id: 'jasper-content-scaling',
      title: 'Jasper AI for Content Scaling',
      question: 'What makes Jasper AI particularly effective for scaling content marketing across multiple channels?',
      explanation: 'Jasper AI specializes in maintaining consistent brand voice across blog posts, email campaigns, social media, and ad copy. It uses your brand guidelines to create content that feels authentically yours, helps overcome writer\'s block, and can produce weeks of content in hours, making it perfect for small teams with big content needs.'
    },
    {
      id: 'copy-ai-conversion',
      title: 'Copy.ai for Conversion Optimization',
      question: 'How does Copy.ai help improve your sales and conversion rates through better copywriting?',
      explanation: 'Copy.ai generates high-converting sales pages, email sequences, ad copy, and product descriptions using proven copywriting formulas. It helps A/B test different messaging approaches, creates urgency-driven content, and optimizes your copy for better conversion rates, essentially giving you access to expert copywriting skills.'
    },
    {
      id: 'grammarly-business',
      title: 'Grammarly Business for Professional Communication',
      question: 'Why is Grammarly Business essential for maintaining professional communication standards?',
      explanation: 'Grammarly Business ensures all team communications maintain professional standards, catches embarrassing errors before they reach clients, suggests tone improvements for better relationships, and helps non-native speakers communicate confidently. It protects your brand reputation by ensuring every email, proposal, and document reflects your professionalism.'
    },
    {
      id: 'notion-ai-organization',
      title: 'Notion AI for Business Organization',
      question: 'How can Notion AI streamline your business operations and knowledge management?',
      explanation: 'Notion AI helps organize project documentation, creates meeting summaries, generates action plans, and maintains searchable knowledge bases. It can transform scattered information into structured databases, automate routine documentation tasks, and help teams stay aligned on goals and progress.'
    },
    {
      id: 'ai-strategy-implementation',
      title: 'AI Implementation Strategy',
      question: 'What\'s the most effective approach for integrating AI tools into your existing business workflows?',
      explanation: 'Start with one high-impact area like content creation or customer communication. Choose tools that integrate with your existing systems, train your team gradually, measure results, and scale successful implementations. Focus on AI tools that save time on repetitive tasks, allowing your team to focus on strategy and relationship-building where humans excel.'
    }
  ]
};

export const aiFoundationsFlashcards: FlashcardDeck = {
  id: 'ai-foundations',
  title: 'AI Foundations & Concepts',
  description: 'Understanding the fundamental concepts behind AI tools to make better strategic decisions',
  cards: [
    {
      id: 'ai-vs-ml',
      title: 'AI vs Machine Learning',
      question: 'What\'s the practical difference between AI and Machine Learning for business users?',
      explanation: 'AI is the broader concept of machines performing human-like tasks. Machine Learning is a subset where systems improve through data without explicit programming. For businesses, AI tools are the applications you use (like ChatGPT), while ML is the technology behind them that gets better with more data and usage.'
    },
    {
      id: 'prompt-engineering',
      title: 'Prompt Engineering Mastery',
      question: 'What are the key principles of effective prompt engineering for better AI results?',
      explanation: 'Effective prompts are specific, provide context, include examples, specify format, and set clear boundaries. Use role-playing ("Act as a marketing expert"), provide background information, ask for step-by-step processes, and iterate based on results. Good prompts can dramatically improve output quality and relevance.'
    },
    {
      id: 'ai-limitations',
      title: 'Understanding AI Limitations',
      question: 'What critical limitations should business leaders understand about current AI tools?',
      explanation: 'AI can hallucinate (create false information), has knowledge cutoff dates, lacks real-time data access, can\'t replace human judgment for critical decisions, and may have biases from training data. Always fact-check important information, verify claims, and use AI as a powerful assistant rather than a replacement for human expertise.'
    },
    {
      id: 'data-privacy',
      title: 'AI and Data Privacy',
      question: 'What data privacy considerations should businesses keep in mind when using AI tools?',
      explanation: 'Never input confidential customer data, proprietary information, or personal details into public AI tools. Use business/enterprise versions when available, understand data retention policies, implement clear usage guidelines for teams, and consider on-premise solutions for sensitive applications. Privacy should be built into your AI strategy from day one.'
    },
    {
      id: 'roi-measurement',
      title: 'Measuring AI ROI',
      question: 'How should businesses measure the return on investment from AI tool implementation?',
      explanation: 'Track time savings, quality improvements, cost reductions, and revenue increases. Measure before and after metrics like content production speed, customer response times, error rates, and team productivity. Also consider intangible benefits like improved employee satisfaction, better customer experiences, and competitive advantages in your market.'
    }
  ]
};

// Export all available decks
export const allFlashcardDecks = [
  aiEssentialsFlashcards,
  aiBeginnerFlashcards,
  aiForBusinessFlashcards,
  aiFoundationsFlashcards,
];

// Helper function to get deck by ID
export const getDeckById = (deckId: string): FlashcardDeck | undefined => {
  return allFlashcardDecks.find(deck => deck.id === deckId);
};

// Get total number of cards across all decks
export const getTotalCardCount = (): number => {
  return allFlashcardDecks.reduce((total, deck) => total + deck.cards.length, 0);
};

// Get deck statistics
export const getDeckPreview = () => {
  return allFlashcardDecks.map(deck => ({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck.cards.length,
    estimatedTime: `${Math.ceil(deck.cards.length * 0.5)} min`, // Rough estimate
  }));
};