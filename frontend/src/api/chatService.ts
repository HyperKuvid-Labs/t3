// api/chatService.ts
import axios, { AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';
// FileProcessor is removed as processing moves to backend for createMessageWithAttachments
// import { FileProcessor, ProcessedFile } from './fileProcessing';

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
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive"
      });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Old ChatResponse, may need update based on new createMessageWithAttachments response
export interface ChatResponse { // This might be part of BackendMessageCreationResponse now
  userMessage: MessageFromBackend; // Assuming MessageFromBackend is defined below
  aiMessage?: MessageFromBackend;
  conversationId: number;
}

// For messages received from backend (including attachmentsJson)
export interface MessageFromBackend {
    id: number; // Assuming ID is number from backend
    content: string;
    role: 'user' | 'assistant' | 'system'; // Matches backend 'role'
    messageType: string; // Matches backend 'messageType'
    conversationId: number;
    userId: number;
    parentMessageId?: number | null;
    isEdited: boolean;
    originalContent?: string | null;
    editReason?: string | null;
    modelId?: number | null;
    aiPrompt?: string | null;
    attachmentsJson?: string | null; // New field for attachments metadata
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    // Relations like user, model can be expanded if needed and sent by backend
    user?: { id: number; name?: string; email: string; };
    model?: { modelId: number; name?: string; nameOnline?: string; type: string; };
}


export interface BackendMessageCreationResponse {
    userMessage: MessageFromBackend;
    aiMessage?: MessageFromBackend | null; // AI message can be null
    conversationId: number;
}


export interface ApiError {
  error: string;
  detail?: string;
  status?: number;
}

// This is the old model mapping, keep if sendQueryToBackend is kept for other purposes
// For createMessageWithAttachments, model selection is primarily backend-driven via conversation settings
const modelEndpoints = {
  'gemini-2.5-flash': '/query/gemini_flash',
  'gemini-2.5-pro': '/query/gemini_pro',
  'ollama-gemma3': '/query/ollama_gemma3',
  'ollama-llama3': '/query/ollama_llama3',
  'ollama-deepseek': '/query/ollama_deepseek',
  'ollama-phi': '/query/ollama_phi'
} as const;
export type ModelType = keyof typeof modelEndpoints;


// This function is now replaced by createMessageWithAttachments for sending messages with files.
// It can be removed or kept if used for other specific model querying without full message context.
// For this subtask, we assume it's being replaced for the main chat message sending.
/*
export async function sendQueryToBackend(
  query: string, 
  emotion: string, 
  model: ModelType,
  files? : File[], // This was frontend processing
  webSearch? : boolean
): Promise<ChatResponse> {
  // ... old implementation ...
}
*/

// New function to create a message, potentially with attachments
export interface MessageRequestData {
    content: string;
    conversationId: number;
    // userId is handled by backend (current_user)
    parentMessageId?: number | null;
    modelType?: string | null; // Optional: user can suggest a model, but conversation setting takes precedence
    modelName?: string | null; // Optional
    emotion?: string | null;
}

export async function createMessageWithAttachments(
    messageData: MessageRequestData,
    attachments?: File[] | null // Changed from files: File[] to attachments to match backend
): Promise<BackendMessageCreationResponse> {
    const formData = new FormData();

    // Append message data fields to FormData
    // Need to handle optional fields carefully; FormData might convert null to "null" string
    Object.entries(messageData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value)); // Ensure all are string for FormData, or handle numbers specifically
        }
    });

    // Append files if any
    if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
            formData.append('attachments', file, file.name); // 'attachments' must match backend File() param name
        });
    }

    try {
        const response: AxiosResponse<BackendMessageCreationResponse> = await axios.post(
            '/conversation/message/', // Endpoint for creating messages
            formData,
            {
                headers: {
                    // 'Content-Type': 'multipart/form-data' is set automatically by axios for FormData
                },
            }
        );
        // Assuming successful response includes the created user message and potentially an AI message
        toast({
            title: "Message Sent",
            description: "Your message and any files were sent.",
        });
        return response.data;
    } catch (error: any) {
        console.error('API Error creating message:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to send message.';
        toast({
            title: "Error Sending Message",
            description: errorMessage,
            variant: "destructive"
        });
        throw new Error(errorMessage);
    }
}


export async function checkBackendHealth(): Promise<boolean> { /* ... (as before) ... */
  try { await axios.get('/health', { timeout: 5000 }); return true; }
  catch { return false; }
}
export async function getCurrentUser(): Promise<any> {  /* ... (as before, ensure 'any' is typed if possible) ... */
  try { const response = await axios.get('/auth/me'); return response.data; }
  catch (error) { throw new Error('Failed to get user information'); }
}

export interface Invitation { /* ... (as before) ... */ }
export interface SendInvitationRequest { /* ... (as before) ... */ }
export interface SendInvitationResponse { /* ... (as before) ... */ }
export async function sendConversationInvitation(data: SendInvitationRequest): Promise<SendInvitationResponse> { /* ... (as before) ... */
  try {
    const response: AxiosResponse<SendInvitationResponse> = await axios.post('/conversation/invite', data);
    toast({ title: "Invitation Sent", description: response.data.message || "Invitation sent."});
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Failed to send invitation.';
    toast({ title: "Error Sending Invitation", description: errorMessage, variant: "destructive"});
    throw new Error(errorMessage);
  }
}

export async function createNewConversationRoom(
  name: string,
  type: string = 'team' // Default type as 'team' or 'ai_enabled' as per backend default
): Promise<ConversationDetails> { // Assuming backend returns the full conversation details
  try {
    const response: AxiosResponse<ConversationDetails> = await axios.post(
      '/conversation/', // Matches the backend endpoint POST /conversation/
      {
        roomName: name, // Backend expects roomName
        type: type,
        // userIds is not sent; backend adds current_user automatically
      }
    );
    toast({
      title: "Conversation Created",
      description: `New conversation "${response.data.roomName}" started.`,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating new conversation room:', error);
    const errorMessage = error.response?.data?.detail || error.message || 'Failed to create conversation.';
    toast({
      title: "Error Creating Conversation",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }
}

export interface Model { /* ... (as before) ... */ }
export async function getAvailableModels(): Promise<Model[]> { /* ... (as before, ensure response.data.models is used) ... */
  try {
    const response: AxiosResponse<{message: string, models: Model[]}> = await axios.get('/models/');
    return response.data.models;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Failed to fetch AI models.';
    toast({ title: "Error Fetching Models", description: errorMessage, variant: "destructive"});
    throw new Error(errorMessage);
  }
}

export interface ConversationDetails { /* ... (as before) ... */ }
export async function updateConversationSettings(conversationId: number, aiModelId: number, aiEnabled: boolean): Promise<ConversationDetails> { /* ... (as before) ... */
  try {
    const response: AxiosResponse<ConversationDetails> = await axios.put(
      `/conversations/${conversationId}/settings`, { ai_model_id: aiModelId, ai_enabled: aiEnabled }
    );
    toast({ title: "Settings Updated", description: "Conversation AI settings updated."});
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Failed to update settings.';
    toast({ title: "Error Updating Settings", description: errorMessage, variant: "destructive"});
    throw new Error(errorMessage);
  }
}

export async function getMyInvitations(): Promise<Invitation[]> { /* ... (as before) ... */
  try { const response: AxiosResponse<Invitation[]> = await axios.get('/users/me/invitations'); return response.data; }
  catch (error: any) { const errorMessage = error.response?.data?.detail || 'Failed to fetch invitations.'; throw new Error(errorMessage); }
}
export interface AcceptInvitationResponse { /* ... (as before) ... */ }
export async function acceptInvitation(invitationId: number): Promise<AcceptInvitationResponse> { /* ... (as before) ... */
  try {
    const response: AxiosResponse<AcceptInvitationResponse> = await axios.post(`/invitations/${invitationId}/accept`);
    toast({ title: "Invitation Accepted", description: response.data.message || "Joined conversation."});
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Failed to accept invitation.';
    toast({ title: "Error Accepting Invitation", description: errorMessage, variant: "destructive"});
    throw new Error(errorMessage);
  }
}
export interface DeclineInvitationResponse { /* ... (as before) ... */ }
export async function declineInvitation(invitationId: number): Promise<DeclineInvitationResponse> { /* ... (as before) ... */
  try {
    const response: AxiosResponse<DeclineInvitationResponse> = await axios.post(`/invitations/${invitationId}/decline`);
    toast({ title: "Invitation Declined", description: response.data.message || "Invitation declined."});
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Failed to decline invitation.';
    toast({ title: "Error Declining Invitation", description: errorMessage, variant: "destructive"});
    throw new Error(errorMessage);
  }
}
