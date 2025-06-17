import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Mail, Share, Crown, Eye, UserPlus, Bot, ThumbsUp, 
  BarChart3, Send, Copy, Clock, AlertCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  createTempRoom,
  sendRoomInvitations,
  joinTempRoom,
  sendRoomMessage,
  getRoomMessages,
  getRoomInfo,
  TempRoomWebSocket,
  TempRoomCreate,
  TempRoomResponse,
  MessageResponse,
  RoomInfo,
  getCurrentUser
} from '@/api/chatService';

interface Participant {
  email: string;
  name: string;
  role: 'host' | 'member';
  isOnline: boolean;
  isTyping: boolean;
}

interface Message {
  message_id: string;
  user_email: string;
  content: string;
  timestamp: string;
  message_type: 'user' | 'ai' | 'system';
  is_ai_generated: boolean;
}

interface AIRoomProps {
  roomCode?: string;
  mode?: 'create' | 'join' | 'chat';
}

const AIRoom = ({ roomCode: initialRoomCode, mode = 'create' }: AIRoomProps) => {
  // State management
  const [currentMode, setCurrentMode] = useState<'create' | 'join' | 'chat'>(mode);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [room, setRoom] = useState<TempRoomResponse | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [roomName, setRoomName] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);
  const [expiryHours, setExpiryHours] = useState(24);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [inviteEmails, setInviteEmails] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // WebSocket
  const wsRef = useRef<TempRoomWebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to get current user:', error);
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive"
        });
      }
    };
    fetchCurrentUser();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket setup for chat mode
  useEffect(() => {
    if (currentMode === 'chat' && room?.room_id) {
      const ws = new TempRoomWebSocket(
        room.room_id,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketClose
      );
      ws.connect();
      wsRef.current = ws;

      return () => {
        ws.disconnect();
      };
    }
  }, [currentMode, room?.room_id]);

  // WebSocket handlers
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'new_message') {
      setMessages(prev => [...prev, data.message]);
    } else if (data.type === 'user_joined') {
      setParticipants(prev => [...prev, data.user]);
      toast({
        title: "User Joined",
        description: `${data.user.email} joined the room`,
      });
    } else if (data.type === 'user_left') {
      setParticipants(prev => prev.filter(p => p.email !== data.user.email));
      toast({
        title: "User Left",
        description: `${data.user.email} left the room`,
      });
    }
  };

  const handleWebSocketError = (error: Event) => {
    console.error('WebSocket error:', error);
    toast({
      title: "Connection Error",
      description: "Lost connection to the room. Trying to reconnect...",
      variant: "destructive"
    });
  };

  const handleWebSocketClose = () => {
    console.log('WebSocket connection closed');
  };

  // Create room handler
  const handleCreateRoom = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a room.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roomData: TempRoomCreate = {
        room_name: roomName || undefined,
        max_users: maxUsers,
        expiry_hours: expiryHours,
        ai_enabled: aiEnabled
      };

      const newRoom = await createTempRoom(roomData);
      setRoom(newRoom);
      setRoomCode(newRoom.room_code);
      setCurrentMode('chat');

      // Load initial messages
      await loadMessages(newRoom.room_id);

      toast({
        title: "Room Created!",
        description: `Room code: ${newRoom.room_code}`,
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Failed to Create Room",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Join room handler
  const handleJoinRoom = async () => {
    if (!currentUser || !roomCode) {
      toast({
        title: "Invalid Input",
        description: "Please enter a room code and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get room info first
      const info = await getRoomInfo(roomCode);
      setRoomInfo(info);

      // Join the room
      const joinResult = await joinTempRoom({
        room_code: roomCode,
        user_email: currentUser.email
      });

      // Set room data for chat mode
      setRoom({
        room_id: joinResult.room_id,
        room_code: roomCode,
        room_name: info.room_name,
        created_by: info.created_by,
        users_emails: [], // Will be updated via WebSocket
        expiry_time: info.expires_at,
        created_at: new Date().toISOString(),
        status: 'active',
        max_users: info.max_users,
        ai_enabled: info.ai_enabled
      });

      setCurrentMode('chat');

      // Load messages
      await loadMessages(joinResult.room_id);

      toast({
        title: "Joined Room!",
        description: `Welcome to ${info.room_name || 'the room'}`,
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Failed to Join Room",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (roomId: string) => {
    try {
      const response = await getRoomMessages(roomId);
      setMessages(response.messages || []);
      
      // Update participants from room info
      if (response.room_info) {
        // This would need to be enhanced to get actual participant details
        // For now, just show count
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !room?.room_id) return;

    try {
      await sendRoomMessage(room.room_id, {
        content: newMessage.trim(),
        message_type: 'user'
      });

      // Message will be added via WebSocket
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Send invitations handler
  const handleSendInvitations = async () => {
    if (!roomCode || !inviteEmails.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter email addresses to invite.",
        variant: "destructive"
      });
      return;
    }

    try {
      const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);

      console.log("Invitations to send:", emails);
      
      await sendRoomInvitations({
        room_code: roomCode,
        invite_emails: emails,
        custom_message: customMessage || undefined
      });

      setInviteEmails('');
      setCustomMessage('');

      toast({
        title: "Invitations Sent!",
        description: `Sent invitations to ${emails.length} people`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send Invitations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'member': return <Users className="h-4 w-4 text-blue-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Render create room form
  const renderCreateForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Create AI Room
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Room Name (Optional)</label>
          <Input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="My AI Room"
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Max Users</label>
          <Input
            type="number"
            value={maxUsers}
            onChange={(e) => setMaxUsers(Number(e.target.value))}
            min={2}
            max={50}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Expires In (Hours)</label>
          <Input
            type="number"
            value={expiryHours}
            onChange={(e) => setExpiryHours(Number(e.target.value))}
            min={1}
            max={168}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ai-enabled"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
          />
          <label htmlFor="ai-enabled" className="text-sm font-medium">
            Enable AI Assistant
          </label>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Button 
          onClick={handleCreateRoom} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setCurrentMode('join')}
          className="w-full"
        >
          Join Existing Room
        </Button>
      </CardContent>
    </Card>
  );

  // Render join room form
  const renderJoinForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Join AI Room
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Room Code</label>
          <Input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="ABCD-1234"
            className="mt-1"
          />
        </div>
        
        {roomInfo && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium">{roomInfo.room_name || 'AI Room'}</h4>
            <p className="text-sm text-gray-600">
              Created by: {roomInfo.created_by}
            </p>
            <p className="text-sm text-gray-600">
              Users: {roomInfo.users_count}/{roomInfo.max_users}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires: {new Date(roomInfo.expires_at).toLocaleString()}
            </p>
            {roomInfo.ai_enabled && (
              <Badge variant="secondary" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                AI Enabled
              </Badge>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Button 
          onClick={handleJoinRoom} 
          disabled={loading || !roomCode}
          className="w-full"
        >
          {loading ? 'Joining...' : 'Join Room'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setCurrentMode('create')}
          className="w-full"
        >
          Create New Room
        </Button>
      </CardContent>
    </Card>
  );

  // Render chat interface
  const renderChatInterface = () => (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Room Info */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{room?.room_name || 'AI Room'}</h2>
          <p className="text-sm text-gray-600">Real-time collaborative chat</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {participants.filter(p => p.isOnline).length} online
            </Badge>
            {room?.ai_enabled && (
              <Badge variant="secondary">
                <Bot className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
        </div>

        {/* Invite Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium mb-3">Invite Participants</h3>
          
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  value={roomCode} 
                  readOnly 
                  className="font-mono"
                />
                <Button size="sm" onClick={copyRoomCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-2">
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
              />
              <Input
                placeholder="Custom message (optional)"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
              <Button size="sm" onClick={handleSendInvitations} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Invites
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Participants */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium mb-3">Participants</h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.email} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                {getRoleIcon(participant.role)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{participant.name}</div>
                  <div className="text-xs text-gray-500">{participant.email}</div>
                </div>
                {participant.isTyping && (
                  <Badge variant="outline" className="text-xs">
                    typing...
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Features */}
        {room?.ai_enabled && (
          <div className="p-4">
            <h3 className="font-medium mb-3">AI Features</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bot className="h-4 w-4 mr-2" />
                Auto Summarize
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Vote on Suggestions
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-semibold">Welcome to {room?.room_name || 'AI Room'}</h1>
          <p className="text-gray-600">Real-time collaborative AI discussions</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.message_id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                  {message.message_type === 'ai' ? (
                    <Bot className="h-4 w-4" />
                  ) : message.message_type === 'system' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    message.user_email.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.message_type === 'ai' ? 'AI Assistant' : 
                       message.message_type === 'system' ? 'System' : 
                       message.user_email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.is_ai_generated && (
                      <Badge variant="secondary" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  if (currentMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {renderCreateForm()}
      </div>
    );
  }

  if (currentMode === 'join') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {renderJoinForm()}
      </div>
    );
  }

  return renderChatInterface();
};

export default AIRoom;
