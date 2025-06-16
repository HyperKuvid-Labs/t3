// api/chatService.ts
import axios, { AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';
import { FileProcessor, ProcessedFile } from './fileProcessing';

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

export interface ConversationResponse {
  conversation_id: number;
  room_name: string;
  created_at: string;
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
  model: string,
  currentConvId : number,
  files? : File[],
  webSearch? : boolean,
): Promise<ChatResponse> {
  // const formData = new FormData();
  // formData.append('query', query);
  // formData.append('emotion', emotion);
  // formData.append("model", model);

  let fileContent = '';
  if(files && files.length > 0){
    try {
      const fileContents = await FileProcessor.processFiles(files);

      fileContent = fileContents.map(
        file => {
          if (file.error) {
            return `File ${file.filename}: Error - ${file.error}`;
          }
          return `File ${file.filename}:\n${file.content}`;
        })
        .join('\n\n');

      query = `${query}\n\nContent from uploaded files:\n${fileContent}`;

      console.log('Query with file content:', query);
    } catch (error) {
      console.error('File processing error:', error);
      throw new Error('Failed to process uploaded files');
    }
  }

  if (!modelEndpoints[model]) {
    throw new Error(`Model ${model} not supported`);
  }

  if (!query.trim()) {
    throw new Error('Query cannot be empty');
  }

  try {
    const response: AxiosResponse<ChatResponse> = await axios.post(
      modelEndpoints[model],
      {
        query: query.trim(),
        emotion: emotion || '',
        webSearch : webSearch || false,
        Conversation_id : currentConvId
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
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

export async function getConversations() {
  try {
    const resp = await axios.get('/conversations');
    return resp.data;
  } catch (error) {
    throw new Error('Failed to get conversations');
  }
}

export async function newConversation(name : string, model : string) : Promise<ConversationResponse> {
  try {
    const resp = await axios.post('/conversations/new', {
      name: name,
      model: model
    });
    console.log(resp.data)
    return resp.data;
  } catch (error) {
    throw new Error('Failed to create new conversation');
  }
}


export async function deleteTheConversation(conversationId : number) {
  try {
    const resp = await axios.delete(`/conversations/${conversationId}`);
    return resp.data;
  } catch (error) {
    throw new Error('Failed to delete conversation');
  }
}
