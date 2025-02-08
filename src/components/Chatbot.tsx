import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Globe, Book, ArrowLeft, Search } from 'lucide-react';
import { Translation, Language } from '../types';
import { ipcData } from '../data/ipcSections';

interface ChatbotProps {
  showChatbot: boolean;
  setShowChatbot: (value: boolean) => void;
  t: Translation;
  language: Language;
  setLanguage: (value: Language) => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string | React.ReactNode;
  options?: ChatOption[];
}

interface ChatOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
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

const ipcTranslations: Record<Language, Record<string, string>> = {
  en: {
    welcome: "Hello! How may I assist you today?",
    selectLanguage: "Please select your preferred language:",
    languageSelected: "Language set to English. How can I help you?",
    selectSection: "Please select what you'd like to know about:",
    ipcOption: "Indian Penal Code (IPC)",
    sectionPrompt: "Please enter the IPC section number you'd like to know about:",
    sectionNotFound: "Section not found. Please try another section number.",
    backToMain: "Back to main menu"
  },
  hi: {
    welcome: "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूं?",
    selectLanguage: "कृपया अपनी पसंदीदा भाषा चुनें:",
    languageSelected: "भाषा हिंदी में सेट की गई। मैं आपकी कैसे सहायता कर सकता हूं?",
    selectSection: "कृपया चुनें आप क्या जानना चाहते हैं:",
    ipcOption: "भारतीय दंड संहिता (IPC)",
    sectionPrompt: "कृपया वह IPC धारा संख्या दर्ज करें जिसके बारे में आप जानना चाहते हैं:",
    sectionNotFound: "धारा नहीं मिली। कृपया दूसरी धारा संख्या आज़माएं।",
    backToMain: "मुख्य मेनू पर वापस जाएं"
  },
  bn: {
    welcome: "হ্যালো! আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    selectLanguage: "অনুগ্রহ করে আপনার পছন্দের ভাষা নির্বাচন করুন:",
    languageSelected: "ভাষা বাংলায় সেট করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    selectSection: "অনুগ্রহ করে নির্বাচন করুন আপনি কী জানতে চান:",
    ipcOption: "ভারতীয় দণ্ডবিধি (IPC)",
    sectionPrompt: "অনুগ্রহ করে যে IPC ধারা সম্পর্কে জানতে চান তার নম্বর লিখুন:",
    sectionNotFound: "ধারা পাওয়া যায়নি। অনুগ্রহ করে অন্য ধারা নম্বর চেষ্টা করুন।",
    backToMain: "মূল মেনুতে ফিরে যান"
  },
  te: {
    welcome: "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?",
    selectLanguage: "దయచేసి మీ అభీష్ట భాషను ఎంచుకోండి:",
    languageSelected: "భాష తెలుగుకు సెట్ చేయబడింది. నేను మీకు ఎలా సహాయం చేయగలను?",
    selectSection: "దయచేసి మీరు తెలుసుకోవాలనుకునేది ఎంచుకోండి:",
    ipcOption: "భారతీయ శిక్షా స్మృతి (IPC)",
    sectionPrompt: "దయచేసి మీరు తెలుసుకోవాలనుకునే IPC సెక్షన్ నంబర్‌ను నమోదు చేయండి:",
    sectionNotFound: "సెక్షన్ కనుగొనబడలేదు. దయచేసి మరొక సెక్షన్ నంబర్‌ను ప్రయత్నించండి.",
    backToMain: "ప్రధాన మెనుకు తిరిగి వెళ్ళండి"
  },
  ta: {
    welcome: "வணக்கம்! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    selectLanguage: "உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்:",
    languageSelected: "மொழி தமிழில் அமைக்கப்பட்டுள்ளது. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    selectSection: "நீங்கள் எதைப் பற்றி தெரிந்துகொள்ள விரும்புகிறீர்கள்:",
    ipcOption: "இந்திய தண்டனைச் சட்டம் (IPC)",
    sectionPrompt: "நீங்கள் அறிய விரும்பும் IPC பிரிவு எண்ணை உள்ளிடவும்:",
    sectionNotFound: "பிரிவு கிடைக்கவில்லை. வேறு பிரிவு எண்ணை முயற்சிக்கவும்.",
    backToMain: "முதன்மை பட்டிக்குத் திரும்பவும்"
  },
  mr: {
    welcome: "नमस्कार! मी आपली कशी मदत करू शकतो?",
    selectLanguage: "कृपया आपली पसंतीची भाषा निवडा:",
    languageSelected: "भाषा मराठीमध्ये सेट केली आहे. मी आपली कशी मदत करू शकतो?",
    selectSection: "कृपया आपल्याला काय जाणून घ्यायचे आहे ते निवडा:",
    ipcOption: "भारतीय दंड संहिता (IPC)",
    sectionPrompt: "कृपया आपल्याला जाणून घ्यायची असलेली IPC कलम संख्या टाका:",
    sectionNotFound: "कलम सापडले नाही. कृपया दुसरी कलम संख्या प्रयत्न करा.",
    backToMain: "मुख्य मेनूवर परत जा"
  },
  gu: {
    welcome: "નમસ્તે! હું તમને કેવી રીતે મદદ કરી શકું?",
    selectLanguage: "કૃપા કરીને તમારી પસંદગીની ભાષા પસંદ કરો:",
    languageSelected: "ભાષા ગુજરાતીમાં સેટ કરવામાં આવી છે. હું તમને કેવી રીતે મદદ કરી શકું?",
    selectSection: "કૃપા કરીને પસંદ કરો તમે શું જાણવા માંગો છો:",
    ipcOption: "ભારતીય દંડ સંહિતા (IPC)",
    sectionPrompt: "કૃપા કરીને તમે જાણવા માંગતા હોય તે IPC કલમ નંબર દાખલ કરો:",
    sectionNotFound: "કલમ મળી નથી. કૃપા કરીને બીજો કલમ નંબર પ્રયાસ કરો.",
    backToMain: "મુખ્ય મેનુ પર પાછા જાઓ"
  },
  pa: {
    welcome: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    selectLanguage: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ:",
    languageSelected: "ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਸੈੱਟ ਕੀਤੀ ਗਈ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    selectSection: "ਕਿਰਪਾ ਕਰਕੇ ਚੁਣੋ ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ:",
    ipcOption: "ਭਾਰਤੀ ਦੰਡ ਸੰਹਿਤਾ (IPC)",
    sectionPrompt: "ਕਿਰਪਾ ਕਰਕੇ ਉਹ IPC ਧਾਰਾ ਨੰਬਰ ਦਾਖਲ ਕਰੋ ਜਿਸ ਬਾਰੇ ਤੁਸੀਂ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ:",
    sectionNotFound: "ਧਾਰਾ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਹੋਰ ਧਾਰਾ ਨੰਬਰ ਅਜ਼ਮਾਓ।",
    backToMain: "ਮੁੱਖ ਮੀਨੂ 'ਤੇ ਵਾਪਸ ਜਾਓ"
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
  const [awaitingSection, setAwaitingSection] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showChatbot) {
      initializeChat();
    }
  }, [showChatbot]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">NyaySetu Assistant</span>
          </div>
          <p>{ipcTranslations[language].welcome}</p>
        </div>
      ),
      options: [
        {
          label: ipcTranslations[language].selectLanguage,
          value: 'language',
          icon: <Globe className="h-4 w-4" />,
          action: () => showLanguageOptions()
        }
      ]
    }]);
  };

  const simulateTyping = async (callback: () => void) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    setIsTyping(false);
    callback();
  };

  const showLanguageOptions = () => {
    simulateTyping(() => {
      setMessages(prev => [...prev, {
        id: `lang-options-${Date.now()}`,
        type: 'bot',
        content: ipcTranslations[language].selectLanguage,
        options: Object.entries(languageNames).map(([code, name]) => ({
          label: name,
          value: code,
          icon: <Globe className="h-4 w-4" />,
          action: () => handleLanguageSelect(code as Language)
        }))
      }]);
    });
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    simulateTyping(() => {
      setMessages(prev => [...prev, 
        { 
          id: `user-lang-${Date.now()}`,
          type: 'user',
          content: (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{languageNames[selectedLanguage]}</span>
            </div>
          )
        },
        {
          id: `bot-lang-confirm-${Date.now()}`,
          type: 'bot',
          content: (
            <div className="space-y-2">
              <p>{ipcTranslations[selectedLanguage].languageSelected}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ipcTranslations[selectedLanguage].selectSection}
              </p>
            </div>
          ),
          options: [
            {
              label: ipcTranslations[selectedLanguage].ipcOption,
              value: 'ipc',
              icon: <Book className="h-4 w-4" />,
              action: () => promptForSection(selectedLanguage)
            },
            {
              label: ipcTranslations[selectedLanguage].backToMain,
              value: 'back',
              icon: <ArrowLeft className="h-4 w-4" />,
              action: () => resetChat()
            }
          ]
        }
      ]);
    });
  };

  const promptForSection = (currentLanguage: Language) => {
    setAwaitingSection(true);
    simulateTyping(() => {
      setMessages(prev => [...prev,
        {
          id: `section-prompt-${Date.now()}`,
          type: 'bot',
          content: (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
                <Search className="h-4 w-4" />
                <span className="font-medium">{ipcTranslations[currentLanguage].sectionPrompt}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Example: Enter "1" for IPC Section 1
              </p>
            </div>
          )
        }
      ]);
    });
  };

  const handleSectionInput = (sectionNumber: string) => {
    const section = ipcData.find(s => s.Section.toString() === sectionNumber);
    
    simulateTyping(() => {
      if (section) {
        setMessages(prev => [...prev,
          {
            id: `user-section-${Date.now()}`,
            type: 'user',
            content: (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Section {sectionNumber}</span>
              </div>
            )
          },
          {
            id: `bot-section-${Date.now()}`,
            type: 'bot',
            content: (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
                  <Book className="h-4 w-4" />
                  <span className="font-semibold">IPC Section {sectionNumber}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                  <p className="font-medium">{section.section_title}</p>
                  <p className="text-sm">{section.section_desc}</p>
                </div>
              </div>
            ),
            options: [
              {
                label: ipcTranslations[language].backToMain,
                value: 'back',
                icon: <ArrowLeft className="h-4 w-4" />,
                action: () => resetChat()
              }
            ]
          }
        ]);
      } else {
        setMessages(prev => [...prev,
          {
            id: `user-section-${Date.now()}`,
            type: 'user',
            content: `Section ${sectionNumber}`
          },
          {
            id: `bot-error-${Date.now()}`,
            type: 'bot',
            content: (
              <div className="text-red-500 dark:text-red-400">
                {ipcTranslations[language].sectionNotFound}
              </div>
            ),
            options: [
              {
                label: ipcTranslations[language].backToMain,
                value: 'back',
                icon: <ArrowLeft className="h-4 w-4" />,
                action: () => resetChat()
              }
            ]
          }
        ]);
      }
    });
    setAwaitingSection(false);
  };

  const resetChat = () => {
    setMessages([{
      id: 'welcome-reset',
      type: 'bot',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gov-green-500 dark:text-gov-green-300">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">NyaySetu Assistant</span>
          </div>
          <p>{ipcTranslations[language].welcome}</p>
        </div>
      ),
      options: [
        {
          label: ipcTranslations[language].selectLanguage,
          value: 'language',
          icon: <Globe className="h-4 w-4" />,
          action: () => showLanguageOptions()
        }
      ]
    }]);
    setAwaitingSection(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    if (awaitingSection) {
      handleSectionInput(input.trim());
    }
    
    setInput('');
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white mr-4'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                {message.options && (
                  <div className="flex flex-col gap-2 px-4 animate-fade-in">
                    {message.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={option.action}
                        className="flex items-center gap-2 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors text-left"
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 px-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={awaitingSection ? ipcTranslations[language].sectionPrompt : t.chatPlaceholder}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gov-green-500 dark:text-white dark:placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                className="p-2 bg-gov-green-500 hover:bg-gov-green-600 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl dark:shadow-gov-green-900/20"
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