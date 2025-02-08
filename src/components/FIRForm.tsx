import React from 'react';
import { BookOpenCheck, Loader2 } from 'lucide-react';
import { Translation } from '../types';

interface FIRFormProps {
  firId: string;
  setFirId: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
  t: Translation;
}

export const FIRForm: React.FC<FIRFormProps> = ({
  firId,
  setFirId,
  loading,
  onSubmit,
  t
}) => {
  return (
    <div className="relative">
      <div className="relative group">
        <input
          type="text"
          value={firId}
          onChange={(e) => setFirId(e.target.value)}
          placeholder={t.placeholder}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800/95 focus:ring-2 focus:ring-gov-green-500 focus:border-transparent outline-none transition-all dark:text-white dark:placeholder-gray-400"
        />
        <div className="absolute inset-0 rounded-xl bg-gov-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="mt-4 w-full bg-gov-green-500 hover:bg-gov-green-600 text-white px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group shadow-lg dark:shadow-gov-green-900/20"
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
    </div>
  );
};