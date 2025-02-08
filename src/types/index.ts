export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type Language = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'pa';

export interface FIRData {
  id: string;
  url: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  station: string;
  date: string;
  type: string;
  description: string;
  language: Language;
}

export interface Translation {
  title: string;
  placeholder: string;
  fetch: string;
  fetching: string;
  support: string;
  chatPlaceholder: string;
  send: string;
  download: string;
  document: string;
  legalReference: string;
  ipcTitle: string;
  cpcTitle: string;
  searchLaws: string;
  invalidFirId: string;
  firNotFound: string;
}

export interface LegalSection {
  title: string;
  sections: {
    number: string;
    description: string;
  }[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}