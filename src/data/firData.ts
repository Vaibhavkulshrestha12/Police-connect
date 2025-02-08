import { Language } from '../types';

export interface FIRMockData {
  id: string;
  url: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  language: Language;
  station: string;
  date: string;
  type: string;
  description: string;
}

export const firMockData: FIRMockData[] = [
  {
    id: "FIR2025001",
    url: "https://www.africau.edu/images/default/sample.pdf",
    status: "pending",
    language: "en",
    station: "Central Police Station, Delhi",
    date: "2025-01-15",
    type: "Theft",
    description: "Report of stolen vehicle from residential parking"
  },
  {
    id: "FIR2025002",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "in_progress",
    language: "hi",
    station: "Sector 20 Police Station, Noida",
    date: "2025-01-18",
    type: "Assault",
    description: "Physical altercation at public place"
  },
  {
    id: "FIR2025003",
    url: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
    status: "resolved",
    language: "bn",
    station: "Lake Police Station, Kolkata",
    date: "2025-01-20",
    type: "Cybercrime",
    description: "Online banking fraud case"
  },
  {
    id: "FIR2025004",
    url: "https://www.orimi.com/pdf-test.pdf",
    status: "closed",
    language: "te",
    station: "Banjara Hills PS, Hyderabad",
    date: "2025-01-22",
    type: "Property Dispute",
    description: "Illegal occupation of residential property"
  },
  {
    id: "FIR2025005",
    url: "https://www.africau.edu/images/default/sample.pdf",
    status: "pending",
    language: "ta",
    station: "Anna Nagar Police Station, Chennai",
    date: "2025-01-25",
    type: "Domestic Violence",
    description: "Report of domestic abuse and harassment"
  },
  {
    id: "FIR2025006",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "in_progress",
    language: "mr",
    station: "Deccan Police Station, Pune",
    date: "2025-01-28",
    type: "Fraud",
    description: "Investment scheme fraud case"
  },
  {
    id: "FIR2025007",
    url: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
    status: "resolved",
    language: "gu",
    station: "Vastrapur Police Station, Ahmedabad",
    date: "2025-01-30",
    type: "Missing Person",
    description: "Report of missing elderly person"
  },
  {
    id: "FIR2025008",
    url: "https://www.orimi.com/pdf-test.pdf",
    status: "closed",
    language: "pa",
    station: "Civil Lines Police Station, Amritsar",
    date: "2025-02-01",
    type: "Burglary",
    description: "Break-in at commercial establishment"
  }
];

export const getStatusColor = (status: FIRMockData['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500 dark:text-yellow-400';
    case 'in_progress':
      return 'text-blue-500 dark:text-blue-400';
    case 'resolved':
      return 'text-green-500 dark:text-green-400';
    case 'closed':
      return 'text-gray-500 dark:text-gray-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

export const getStatusTranslation = (status: FIRMockData['status'], language: Language): string => {
  const translations: Record<Language, Record<FIRMockData['status'], string>> = {
    en: {
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    },
    hi: {
      pending: 'लंबित',
      in_progress: 'प्रगति में',
      resolved: 'समाधान हो गया',
      closed: 'बंद'
    },
    bn: {
      pending: 'বিচারাধীন',
      in_progress: 'চলমান',
      resolved: 'সমাধান হয়েছে',
      closed: 'বন্ধ'
    },
    te: {
      pending: 'పెండింగ్',
      in_progress: 'ప్రగతిలో ఉంది',
      resolved: 'పరిష్కరించబడింది',
      closed: 'మూసివేయబడింది'
    },
    ta: {
      pending: 'நிலுவையில்',
      in_progress: 'செயல்பாட்டில்',
      resolved: 'தீர்க்கப்பட்டது',
      closed: 'மூடப்பட்டது'
    },
    mr: {
      pending: 'प्रलंबित',
      in_progress: 'प्रगतीपथावर',
      resolved: 'सोडवले',
      closed: 'बंद'
    },
    gu: {
      pending: 'બાકી',
      in_progress: 'પ્રગતિમાં',
      resolved: 'ઉકેલાયું',
      closed: 'બંધ'
    },
    pa: {
      pending: 'ਬਕਾਇਆ',
      in_progress: 'ਜਾਰੀ',
      resolved: 'ਹੱਲ ਹੋ ਗਿਆ',
      closed: 'ਬੰਦ'
    }
  };

  return translations[language][status];
};

export const getFIRById = (id: string): FIRMockData | undefined => {
  return firMockData.find(fir => fir.id === id);
};

export const searchFIR = (query: string): FIRMockData[] => {
  const searchTerm = query.toLowerCase();
  return firMockData.filter(fir => 
    fir.id.toLowerCase().includes(searchTerm) ||
    fir.station.toLowerCase().includes(searchTerm) ||
    fir.type.toLowerCase().includes(searchTerm) ||
    fir.description.toLowerCase().includes(searchTerm)
  );
};