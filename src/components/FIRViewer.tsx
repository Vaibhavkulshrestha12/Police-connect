import React from 'react';
import { Download } from 'lucide-react';
import { FIRData, Translation } from '../types';

interface FIRViewerProps {
  firData: FIRData;
  t: Translation;
}

export const FIRViewer: React.FC<FIRViewerProps> = ({ firData, t }) => {
  return (
    <div className="mt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-semibold text-gray-900 dark:text-white">{t.document}</h2>
        <a
          href={firData.url}
          download
          className="flex items-center space-x-2 text-gov-green-600 dark:text-gov-green-300 hover:text-gov-green-700 dark:hover:text-gov-green-200 group"
        >
          <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>{t.download}</span>
        </a>
      </div>
      <div className="border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden bg-white dark:bg-gray-800/95">
        <iframe
          src={firData.url}
          className="w-full h-[600px]"
          title="FIR Document"
        />
      </div>
    </div>
  );
};