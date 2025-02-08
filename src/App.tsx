import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FIRViewer } from './components/FIRViewer';
import { Chatbot } from './components/Chatbot';
import { Sidebar } from './components/Sidebar';
import { ColorblindMode, Language, FIRData } from './types';
import { Menu, X, BookOpenCheck, Loader2, AlertCircle } from 'lucide-react';
import { getFIRById, getStatusColor, getStatusTranslation } from './data/firData';
import { translations } from './translations';
import profile from "../src/assets/profile.png";

function App() {
  const [firId, setFirId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [firData, setFirData] = useState<FIRData | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  const [language, setLanguage] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getColorblindFilter = () => {
    switch (colorblindMode) {
      case 'protanopia':
        return 'saturate(0.5) sepia(0.2)';
      case 'deuteranopia':
        return 'saturate(0.7) hue-rotate(-10deg)';
      case 'tritanopia':
        return 'saturate(0.8) hue-rotate(180deg)';
      default:
        return 'none';
    }
  };

  const fetchFIR = async () => {
    if (!firId.trim()) {
      setError(t.invalidFirId);
      return;
    }

    setLoading(true);
    setError('');

    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fir = getFIRById(firId);
      
      if (fir) {
        setFirData({
          id: fir.id,
          url: fir.url,
          status: fir.status,
          station: fir.station,
          date: fir.date,
          type: fir.type,
          description: fir.description,
          language: fir.language
        });
      } else {
        throw new Error(t.firNotFound);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.firNotFound);
      setFirData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark bg-zinc-950' : 'bg-gray-50'}`}
      style={{ filter: getColorblindFilter() }}
    >
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        colorblindMode={colorblindMode}
        setColorblindMode={setColorblindMode}
        language={language}
        setLanguage={setLanguage}
        t={t}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex flex-col-reverse sm:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <Sidebar
          t={t}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'} overflow-y-auto`}>
          <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)] p-4 sm:p-8 border border-gray-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                
                <div className="w-full lg:w-[320px] lg:shrink-0">
                  <div className="lg:sticky lg:top-8">
                    <div className="relative aspect-square max-w-[280px] mx-auto">
                      <img
                        src={profile}
                        alt="Police Badge"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h2 className="mt-6 text-xl font-serif font-semibold text-gray-900 dark:text-white text-center">
                      {t.title}
                    </h2>
                  </div>
                </div>

                
                <div className="flex-1 min-w-0">
                  <div className="max-w-xl mx-auto lg:mx-0">
                    <div className="space-y-6">
                      <div className="relative group">
                        <input
                          type="text"
                          value={firId}
                          onChange={(e) => setFirId(e.target.value)}
                          placeholder={t.placeholder}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900/50 focus:ring-2 focus:ring-gov-green-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gov-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                      <button
                        onClick={fetchFIR}
                        disabled={loading}
                        className="w-full bg-gov-green-500 hover:bg-gov-green-600 text-white px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group shadow-lg dark:shadow-gov-green-900/20"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t.fetching}</span>
                          </>
                        ) : (
                          <>
                            <BookOpenCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span>{t.fetch}</span>
                          </>
                        )}
                      </button>

                      {error && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-xl text-sm animate-fade-in">
                          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      {firData && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-serif font-semibold text-gray-900 dark:text-white">
                                {firData.id}
                              </h3>
                              <span className={`text-sm font-medium ${getStatusColor(firData.status)}`}>
                                {getStatusTranslation(firData.status, language)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Station:</span> {firData.station}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Date:</span> {firData.date}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Type:</span> {firData.type}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Description:</span> {firData.description}
                              </p>
                            </div>
                          </div>
                          <FIRViewer firData={firData} t={t} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed left-4 bottom-4 p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200 z-50 border border-gray-200/50 dark:border-zinc-800/50 backdrop-blur-sm hover:scale-105`}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-gov-green-600 dark:text-gov-green-300" />
          ) : (
            <Menu className="h-6 w-6 text-gov-green-600 dark:text-gov-green-300" />
          )}
        </button>
      </div>

      <Chatbot
        showChatbot={showChatbot}
        setShowChatbot={setShowChatbot}
        t={t}
        language={language}
        setLanguage={setLanguage}
      />
    </div>
  );
}

export default App;