// api/chatService.ts
import axios, { AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:8000';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Add request interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive"
      });
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ChatResponse {
  query: string;
  response: string;
  model: string;
  user: string;
  query_id: string;
}

export interface ApiError {
  error: string;
  detail?: string;
  status?: number;
}

const modelEndpoints = {
  'gemini-2.5-flash': '/query/gemini_flash',
  'gemini-2.5-pro': '/query/gemini_pro',
  'ollama-gemma3': '/query/ollama_gemma3',
  'ollama-llama3': '/query/ollama_llama3',
  'ollama-deepseek': '/query/ollama_deepseek',
  'ollama-phi': '/query/ollama_phi'
} as const;

export type ModelType = keyof typeof modelEndpoints;

export async function sendQueryToBackend(
  query: string, 
  emotion: string, 
  model: ModelType
): Promise<ChatResponse> {
  if (!modelEndpoints[model]) {
    throw new Error(`Model ${model} not supported`);
  }

  if (!query.trim()) {
    throw new Error('Query cannot be empty');
  }

  try {
    const response: AxiosResponse<ChatResponse> = await axios.get(
      modelEndpoints[model],
      {
        params: { 
          query: query.trim(), 
          emotion: emotion || '' 
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment.');
    }
    
    throw new Error(error.message || 'Failed to send message. Please check your connection.');
  }
}

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await axios.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Get user info
export async function getCurrentUser() {
  try {
    const response = await axios.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error('Failed to get user information');
  }
}
