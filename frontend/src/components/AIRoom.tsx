
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail, Share, Crown, Eye, UserPlus, Bot, ThumbsUp, BarChart3 } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'member' | 'spectator';
  isOnline: boolean;
  isTyping: boolean;
}

interface AIRoomProps {
  roomId?: string;
}

const AIRoom = ({ roomId }: AIRoomProps) => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', role: 'host', isOnline: true, isTyping: false },
    { id: '2', name: 'Alex', role: 'member', isOnline: true, isTyping: true },
    { id: '3', name: 'Sarah', role: 'spectator', isOnline: true, isTyping: false },
  ]);
  const [inviteCode] = useState('GIDV-2024');
  const [emailInvite, setEmailInvite] = useState('');
  const [aiSummaryEnabled, setAiSummaryEnabled] = useState(true);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host': return <Crown className="w-4 h-4 text-neon-green" />;
      case 'member': return <Users className="w-4 h-4 text-neon-blue" />;
      case 'spectator': return <Eye className="w-4 h-4 text-neon-muted" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleEmailInvite = () => {
    if (emailInvite) {
      console.log('Sending invite to:', emailInvite);
      setEmailInvite('');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-neon-dark to-neon-dark/80 pt-16">
      {/* Sidebar */}
      <div className="w-80 bg-neon-dark/50 border-r border-neon-blue/20 p-4">
        <div className="space-y-6">
          {/* Room Info */}
          <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/30">
            <h2 className="text-lg font-bold text-neon-blue mb-2">AI Room</h2>
            <p className="text-sm text-neon-muted">Real-time collaborative chat</p>
            <Badge variant="outline" className="mt-2 border-neon-green/50 text-neon-green">
              {participants.filter(p => p.isOnline).length} online
            </Badge>
          </div>

          {/* Invite Section */}
          <div className="space-y-3">
            <h3 className="text-neon-text font-semibold">Invite Participants</h3>
            
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-neon-dark/50">
                <TabsTrigger value="code" className="data-[state=active]:bg-neon-blue data-[state=active]:text-neon-dark">
                  Code
                </TabsTrigger>
                <TabsTrigger value="email" className="data-[state=active]:bg-neon-purple data-[state=active]:text-neon-dark">
                  Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={inviteCode}
                    readOnly
                    className="bg-neon-dark/50 border-neon-blue/30 text-neon-text"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-neon-blue/50 hover:border-neon-blue"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="user@email.com"
                    value={emailInvite}
                    onChange={(e) => setEmailInvite(e.target.value)}
                    className="bg-neon-dark/50 border-neon-blue/30 text-neon-text"
                  />
                  <Button
                    onClick={handleEmailInvite}
                    variant="outline"
                    size="sm"
                    className="border-neon-purple/50 hover:border-neon-purple"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="text-neon-text font-semibold">Participants</h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-neon-muted/10"
                >
                  <div className="flex items-center gap-2">
                    {getRoleIcon(participant.role)}
                    <div className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-neon-green' : 'bg-neon-muted'}`} />
                  </div>
                  <span className="text-neon-text text-sm flex-1">{participant.name}</span>
                  {participant.isTyping && (
                    <Badge variant="outline" className="border-neon-blue/50 text-neon-blue text-xs">
                      typing...
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="space-y-3">
            <h3 className="text-neon-text font-semibold">AI Features</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setAiSummaryEnabled(!aiSummaryEnabled)}
                variant="outline"
                size="sm"
                className={`w-full justify-start ${
                  aiSummaryEnabled 
                    ? 'border-neon-green/50 text-neon-green hover:bg-neon-green/10' 
                    : 'border-neon-muted/50 text-neon-muted hover:bg-neon-muted/10'
                }`}
              >
                <Bot className="w-4 h-4 mr-2" />
                Auto Summarize
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Vote on Suggestions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neon-blue mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-neon-blue mb-2">Welcome to AI Room</h2>
            <p className="text-neon-muted mb-4">Real-time collaborative AI discussions</p>
            <p className="text-sm text-neon-muted">Chat interface will be integrated here...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRoom;
