import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, AlertCircle, Book, Scale, FileText, Globe } from 'lucide-react';
import { Translation, Language, ChatMessage } from '../types';
import { getChatResponse } from '../services/ai';

interface ChatbotProps {
  showChatbot: boolean;
  setShowChatbot: (value: boolean) => void;
  t: Translation;
  language: Language;
  setLanguage: (value: Language) => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'error';
  content: string | React.ReactNode;
  options?: ChatOption[];
  loading?: boolean;
}

interface ChatOption {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
}

const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ'
};

const welcomeMessages: Record<Language, string> = {
  en: "Namaste! I'm your NyaySetu legal assistant. How may I help you today?",
  hi: "नमस्ते! मैं आपका न्यायसेतु कानूनी सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?",
  bn: "নমস্কার! আমি আপনার ন্যায়সেতু আইনি সহকারী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  te: "నమస్కారం! నేను మీ న్యాయసేతు చట్ట సహాయకుడిని. నేను మీకు ఎలా సహాయం చేయగలను?",
  ta: "வணக்கம்! நான் உங்கள் நியாயசேது சட்ட உதவியாளர். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
  mr: "नमस्कार! मी आपला न्यायसेतू कायदेशीर सहाय्यक आहे. मी आपली कशी मदत करू शकतो?",
  gu: "નમસ્તે! હું તમારો ન્યાયસેતુ કાનૂની સહાયક છું. હું તમને કેવી રીતે મદદ કરી શકું?",
  pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਨਿਆਂਸੇਤੂ ਕਾਨੂੰਨੀ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?"
};

const optionLabels: Record<Language, { legal: string; advice: string; document: string }> = {
  en: {
    legal: "Legal Code Lookup",
    advice: "Legal Advice",
    document: "Document Analysis"
  },
  hi: {
    legal: "कानूनी कोड खोज",
    advice: "कानूनी सलाह",
    document: "दस्तावेज़ विश्लेषण"
  },
  bn: {
    legal: "আইনি কোড অনুসন্ধান",
    advice: "আইনি পরামর্শ",
    document: "নথি বিশ্লেষণ"
  },
  te: {
    legal: "చట్ట కోడ్ లుక్అప్",
    advice: "చట్టపరమైన సలహా",
    document: "పత్రాల విశ్లేషణ"
  },
  ta: {
    legal: "சட்டக் குறியீடு தேடல்",
    advice: "சட்ட ஆலோசனை",
    document: "ஆவண பகுப்பாய்வு"
  },
  mr: {
    legal: "कायदा कोड शोध",
    advice: "कायदेशीर सल्ला",
    document: "दस्तऐवज विश्लेषण"
  },
  gu: {
    legal: "કાયદા કોડ શોધ",
    advice: "કાનૂની સલાહ",
    document: "દસ્તાવેજ વિશ્લેષણ"
  },
  pa: {
    legal: "ਕਾਨੂੰਨੀ ਕੋਡ ਖੋਜ",
    advice: "ਕਾਨੂੰਨੀ ਸਲਾਹ",
    document: "ਦਸਤਾਵੇਜ਼ ਵਿਸ਼ਲੇਸ਼ਣ"
  }
};

export const Chatbot: React.FC<ChatbotProps> = ({
  showChatbot,
  setShowChatbot,
  t,
  language,
  setLanguage
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showChatbot && messages.length === 0) {
      initializeChat();
    }
  }, [showChatbot]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getLanguageOptions = (): ChatOption[] => 
    Object.entries(languageNames).map(([code, name]) => ({
      icon: <Globe className="h-5 w-5" />,
      label: name,
      description: `Switch to ${name}`,
      action: () => handleLanguageChange(code as Language)
    }));

  const getInitialOptions = (currentLanguage: Language): ChatOption[] => [
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Change Language",
      description: `Current: ${languageNames[currentLanguage]}`,
      action: () => showLanguageSelection()
    },
    {
      icon: <Book className="h-5 w-5" />,
      label: optionLabels[currentLanguage].legal,
      description: "IPC/CPC sections",
      action: () => handleOptionSelect("I need help understanding a specific section of Indian law.")
    },
    {
      icon: <Scale className="h-5 w-5" />,
      label: optionLabels[currentLanguage].advice,
      description: "Legal guidance",
      action: () => handleOptionSelect("Can you provide legal guidance on a specific matter?")
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: optionLabels[currentLanguage].document,
      description: "FIR/Document analysis",
      action: () => handleOptionSelect("I need help analyzing a legal document.")
    }
  ];

  const showLanguageSelection = () => {
    const languageMessage: Message = {
      id: `lang-${Date.now()}`,
      type: 'bot',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
            <Globe className="h-5 w-5" />
            <span className="font-semibold">Select Language / भाषा चुनें</span>
          </div>
        </div>
      ),
      options: getLanguageOptions()
    };
    setMessages(prev => [...prev, languageMessage]);
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    const userMessage: Message = {
      id: `user-lang-${Date.now()}`,
      type: 'user',
      content: `Switched to ${languageNames[newLanguage]}`
    };

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are NyaySetu, an AI legal assistant specializing in Indian law. Communicate in ${languageNames[newLanguage]}. You have extensive knowledge of Indian legal system, IPC, and CrPC. Provide accurate, clear explanations while noting that your advice is informational and not a substitute for professional legal counsel.`
    };

    setChatHistory([systemMessage]);

    const botMessage: Message = {
      id: `bot-lang-${Date.now()}`,
      type: 'bot',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">NyaySetu Assistant</span>
          </div>
          <p>{welcomeMessages[newLanguage]}</p>
        </div>
      ),
      options: getInitialOptions(newLanguage)
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  const initializeChat = async () => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are NyaySetu, an AI legal assistant specializing in Indian law. Communicate in ${languageNames[language]}. You have extensive knowledge of Indian legal system, IPC, and CrPC. Provide accurate, clear explanations while noting that your advice is informational and not a substitute for professional legal counsel.`
    };

    setChatHistory([systemMessage]);

    const initialMessage: Message = {
      id: 'welcome',
      type: 'bot',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">NyaySetu Assistant</span>
          </div>
          <p>{welcomeMessages[language]}</p>
        </div>
      ),
      options: getInitialOptions(language)
    };

    setMessages([initialMessage]);
    setError(null);
  };

  const handleOptionSelect = async (query: string) => {
    setInput(query);
    await handleSend(query);
  };

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText.trim()
    };

    const loadingMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing your query...</span>
        </div>
      ),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const newUserMessage: ChatMessage = { 
        role: 'user', 
        content: messageText.trim() 
      };
      const updatedHistory = [...chatHistory, newUserMessage];
      setChatHistory(updatedHistory);

      const response = await getChatResponse(updatedHistory);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">NyaySetu Assistant</span>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              {response}
            </div>
          </div>
        ),
        options: getInitialOptions(language)
      };

      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingMessage.id),
        botMessage
      ]);

      const newAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingMessage.id),
        {
          id: `error-${Date.now()}`,
          type: 'error',
          content: (
            <div className="flex items-start gap-2 text-red-500 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">I apologize, but I'm having trouble responding right now.</p>
                <p className="text-sm text-red-400 dark:text-red-300">
                  {errorMessage}
                </p>
                <button
                  onClick={initializeChat}
                  className="text-sm text-gov-green-500 dark:text-gov-green-400 hover:underline"
                >
                  Reset conversation
                </button>
              </div>
            </div>
          )
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="bg-gov-green-500 hover:bg-gov-green-600 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 dark:shadow-gov-green-900/20"
      >
        <Bot className="h-6 w-6" />
      </button>
      
      {showChatbot && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm animate-slide-up">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-gov-green-500 dark:text-gov-green-300" />
              <h3 className="font-serif font-semibold dark:text-white">{t.support}</h3>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-gray-500 dark:text-gray-400 text-xl">×</span>
            </button>
          </div>

          <div 
            ref={chatContainerRef}
            className="h-[400px] overflow-y-auto py-4 px-4 space-y-6"
          >
            {messages.map((message) => (
              <div key={message.id} className="space-y-4 animate-fade-in">
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gov-green-500 text-white ml-4'
                        : message.type === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 mr-4'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white mr-4'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                {message.options && (
                  <div className="space-y-2 mt-4">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={option.action}
                        className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group"
                      >
                        <div className="text-gov-green-500 dark:text-gov-green-300 mt-0.5">
                          {option.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white group-hover:text-gov-green-500 dark:group-hover:text-gov-green-300 transition-colors">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'en' ? "Ask about legal matters..." : "कानूनी मामलों के बारे में पूछें..."}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gov-green-500 dark:text-white dark:placeholder-gray-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-gov-green-500 hover:bg-gov-green-600 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl dark:shadow-gov-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};