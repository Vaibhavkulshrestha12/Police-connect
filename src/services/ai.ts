import { ChatMessage } from '../types';

const API_BASE_URL = "";
const API_KEY = "";
const MODEL = "";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; 
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    
    if (response.ok || retries === 0) {
      return response;
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : delay;
      await sleep(retryDelay);
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    await sleep(delay);
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}

interface ErrorWithDetails {
  name?: string;
  message?: string;
  stack?: string;
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages })
  };

  try {
    
    console.log('Sending request to AI service:', {
      url: `${API_BASE_URL}${MODEL}`,
      messages: messages.map(m => ({ role: m.role, contentLength: m.content.length }))
    });

    const response = await fetchWithRetry(`${API_BASE_URL}${MODEL}`, requestOptions);
    
    
    console.log('AI API Response Status:', response.status);
    console.log('AI API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error Response:', errorText);
      
     
      switch (response.status) {
        case 401:
          throw new Error('Authentication failed. Please check API credentials.');
        case 403:
          throw new Error('Access forbidden. Please verify API permissions.');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('AI service is experiencing issues. Please try again later.');
        default:
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('AI API Response Data:', data);

    
    if (data && typeof data === 'object') {
      
      if (data.result?.content && typeof data.result.content === 'string') {
        return data.result.content;
      }
      
      if (data.result && typeof data.result === 'string') {
        return data.result;
      }
      
      if (data.response && typeof data.response === 'string') {
        return data.response;
      }

      if (data.content && typeof data.content === 'string') {
        return data.content;
      }

      
      if (data.result && typeof data.result === 'object') {
        const resultString = JSON.stringify(data.result);
        if (resultString && resultString.length > 2) { 
          return resultString;
        }
      }

      
      console.error('Unexpected response format:', data);
      throw new Error('Received response in unexpected format');
    }

    throw new Error('Invalid response format from AI service');
  } catch (error: unknown) {
    const errorDetails: ErrorWithDetails = {};
    
    if (error instanceof Error) {
      errorDetails.name = error.name;
      errorDetails.message = error.message;
      errorDetails.stack = error.stack;
    } else if (error && typeof error === 'object') {
      errorDetails.message = String(error);
    } else {
      errorDetails.message = 'An unknown error occurred';
    }

    console.error('AI API Error:', errorDetails);
    
    
    if (error instanceof TypeError) {
      throw new Error('Network error: Please check your internet connection and try again');
    }
    
    if (error instanceof Error) {
      
      const message = error.message
        .replace(/^Error:\s*/, '')
        .replace(/\b(API|Bearer|Authorization)\b/gi, '')
        .trim();
      
      throw new Error(`AI Service Error: ${message}`);
    }
    
    throw new Error('An unexpected error occurred while getting AI response');
  }
}


export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'system', content: 'Health check' }]
      })
    });

    return response.ok;
  } catch {
    return false;
  }
}