import axios, { AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';
import { FileProcessor, ProcessedFile } from './fileProcessing';

const API_BASE_URL = 'http://localhost:8000';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive"
      });
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

export interface TempRoomCreate {
  room_name?: string;
  max_users?: number;
  expiry_hours?: number;
  ai_enabled?: boolean;
}

export interface TempRoomResponse {
  room_id: string;
  room_code: string;
  room_name?: string;
  created_by: string;
  users_emails: string[];
  expiry_time: string;
  created_at: string;
  status: string;
  max_users: number;
  ai_enabled: boolean;
}

export interface RoomInvite {
  room_code: string;
  invite_emails: string[];
  custom_message?: string;
}

export interface JoinRoomRequest {
  room_code: string;
  user_email: string;
}

export interface SendMessageRequest {
  content: string;
  message_type?: string;
}

export interface MessageResponse {
  message_id: string;
  room_id: string;
  user_email: string;
  content: string;
  timestamp: string;
  message_type: string;
  is_ai_generated: boolean;
}

export interface RoomInfo {
  room_code: string;
  room_name?: string;
  created_by: string;
  users_count: number;
  max_users: number;
  expires_at: string;
  ai_enabled: boolean;
}

const modelEndpoints = {
  'gemini-2.5-flash': '/query/gemini_flash',
  'gemini-2.5-pro': '/query/gemini_pro',
  'claude-4.0-sonnet': '/query/claude_sonnet',
  'deepseek-v3': '/query/deepseekv3',
  'gemma3_27b': '/query/ollama_gemma3',
  'llama3_3_70b': '/query/ollama_llama3',
  'deepseek_r1_70b': '/query/ollama_deepseek',
  'phi4_14b': '/query/ollama_phi'
} as const;

export type ModelType = keyof typeof modelEndpoints;

const getApiKey = (provider: string): string | null => {
  return localStorage.getItem(`apiKey_${provider.toLowerCase()}`);
};

export async function sendQueryToBackend(
  query: string,
  previous_context: string, 
  emotion: string,
  model: string,
  currentConvId: number,
  files?: File[],
  webSearch?: boolean,
): Promise<ChatResponse> {
  let fileContent = '';
  if (files && files.length > 0) {
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

  let apiKey = "";
  if (model.includes('claude')) {
    apiKey = getApiKey('anthropic');
    if (!apiKey) {
      throw new Error('Claude API key is required. Please select the model again to enter your API key.');
    }
  } else if (model.includes('deepseek')) {
    apiKey = getApiKey('deepseek');
    if (!apiKey) {
      throw new Error('DeepSeek API key is required. Please select the model again to enter your API key.');
    }
  }

  console.log("apiKey", apiKey)

  // if (apiKey) {
  //     requestBody.api_key = apiKey;
  // }

  try {
    const response: AxiosResponse<ChatResponse> = await axios.post(
      modelEndpoints[model],
      {
        query: query.trim(),
        previous_context: previous_context,
        emotion: emotion || '',
        webSearch: webSearch || false,
        Conversation_id: currentConvId,
        apiKey : apiKey 
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
export async function createTempRoom(roomData: TempRoomCreate): Promise<TempRoomResponse> {
  try {
    const response = await axios.post('/temp-rooms/create', roomData);
    return response.data;
  } catch (error: any) {
    console.error('Create room error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create room');
  }
}

export async function sendRoomInvitations(inviteData: RoomInvite): Promise<any> {
  try {
    const response = await axios.post('/temp-rooms/invite', inviteData);
    return response.data;
  } catch (error: any) {
    console.error('Send invitations error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send invitations');
  }
}

export async function joinTempRoom(joinData: JoinRoomRequest): Promise<any> {
  try {
    const response = await axios.post('/temp-rooms/join', joinData);
    return response.data;
  } catch (error: any) {
    console.error('Join room error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to join room');
  }
}

export async function sendRoomMessage(roomId: string, messageData: SendMessageRequest): Promise<any> {
  try {
    const response = await axios.post(`/temp-rooms/${roomId}/messages`, messageData);
    return response.data;
  } catch (error: any) {
    console.error('Send message error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send message');
  }
}

export async function getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<any> {
  try {
    const response = await axios.get(`/temp-rooms/${roomId}/messages`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error: any) {
    console.error('Get messages error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get messages');
  }
}

export async function getRoomInfo(roomCode: string): Promise<RoomInfo> {
  try {
    const response = await axios.get(`/temp-rooms/${roomCode}/info`);
    return response.data;
  } catch (error: any) {
    console.error('Get room info error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get room info');
  }
}

export class TempRoomWebSocket {
  private ws: WebSocket | null = null;
  private roomId: string;
  private onMessage: (data: any) => void;
  private onError: (error: Event) => void;
  private onClose: () => void;

  constructor(
    roomId: string,
    onMessage: (data: any) => void,
    onError: (error: Event) => void = () => {},
    onClose: () => void = () => {}
  ) {
    this.roomId = roomId;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
  }

  connect(): void {
    const wsUrl = `ws://localhost:8000/temp-rooms/${this.roomId}/ws`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.onClose();
    };
  }

  //need to check
  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await axios.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

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

export async function newConversation(name: string, model: string): Promise<ConversationResponse> {
  try {
    const resp = await axios.post('/conversations/new', {
      name: name,
      model: model
    });
    console.log(resp.data);
    return resp.data;
  } catch (error) {
    throw new Error('Failed to create new conversation');
  }
}

export async function deleteTheConversation(conversationId: number) {
  try {
    const resp = await axios.delete(`/conversations/${conversationId}`);
    return resp.data;
  } catch (error) {
    throw new Error('Failed to delete conversation');
  }
}

export async function runProjectBuilder(prompt: string, email: string, stack_id: string) {
  try {
    const resp = await axios.post('/run_project_builder', {
      stack_id: stack_id,
      prompt: prompt,
      email: email
    });
  } catch (error) {
    throw new Error('Failed to develop the project');
  }
}

export async function getConversationWithId(conversationId: number) {
  try {
    const resp = await axios.get(`/conversations/${conversationId}/messages`);
    return resp.data;
  } catch (error) {
    throw new Error('Failed to get conversation');
  }
}
