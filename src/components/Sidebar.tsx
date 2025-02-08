import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Book, ChevronDown, ChevronRight } from 'lucide-react';
import { Translation } from '../types';
import { ipcData, transformIPCData } from '../data/ipcSections';
import { cpcData, transformCPCData } from '../data/cpcSections';

interface SidebarProps {
  t: Translation;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ t, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ipc' | 'cpc'>('ipc');

  const IPC_SECTIONS = useMemo(() => transformIPCData(ipcData), []);
  const CPC_SECTIONS = useMemo(() => transformCPCData(cpcData), []);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const searchSections = useCallback((sections: typeof IPC_SECTIONS, term: string) => {
    if (!term) return sections;

    const searchTerms = term.toLowerCase().split(' ').filter(Boolean);
    
    return sections.map(chapter => {
      const matchedSections = chapter.sections.filter(section => {
        const sectionText = `${section.number} ${section.description}`.toLowerCase();
        return searchTerms.every(term => 
          sectionText.includes(term) ||
          (term.match(/^\d+$/) && section.number.includes(term))
        );
      });

      return {
        ...chapter,
        sections: matchedSections
      };
    }).filter(chapter => chapter.sections.length > 0);
  }, []);

  const filteredSections = useMemo(() => {
    const sections = activeTab === 'ipc' ? IPC_SECTIONS : CPC_SECTIONS;
    return searchSections(sections, searchTerm);
  }, [activeTab, searchTerm, IPC_SECTIONS, CPC_SECTIONS, searchSections]);

  useEffect(() => {
    if (searchTerm) {
      const matchedChapterTitles = filteredSections.map(chapter => chapter.title);
      setExpandedSections(matchedChapterTitles);
    } else {
      setExpandedSections([]);
    }
  }, [searchTerm, filteredSections]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const searchTerms = searchTerm.toLowerCase().split(' ').filter(Boolean);
    let highlightedText = text;

    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900 rounded px-1">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 mt-14 sm:mt-16 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-4">
            {t.legalReference}
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchLaws}
              className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gov-green-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Found {filteredSections.reduce((acc, chapter) => acc + chapter.sections.length, 0)} results
            </div>
          )}
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('ipc')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'ipc'
                ? 'text-gov-green-500 dark:text-gov-green-300 border-b-2 border-gov-green-500 dark:border-gov-green-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.ipcTitle}
          </button>
          <button
            onClick={() => setActiveTab('cpc')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'cpc'
                ? 'text-gov-green-500 dark:text-gov-green-300 border-b-2 border-gov-green-500 dark:border-gov-green-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.cpcTitle}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <div key={section.title} className="border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {highlightText(section.title, searchTerm)}
                  </span>
                  {expandedSections.includes(section.title) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.includes(section.title) && (
                  <div className="bg-gray-50 dark:bg-gray-900">
                    {section.sections.map((s) => (
                      <div
                        key={s.number}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div className="flex items-start space-x-2">
                          <Book className="h-4 w-4 mt-1 text-gov-green-600 dark:text-gov-green-300" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Section {highlightText(s.number.toString(), searchTerm)}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {highlightText(s.description, searchTerm)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};