
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smile } from 'lucide-react';

interface EmotionToken {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

const emotionTokens: EmotionToken[] = [
  { id: 'friendly', emoji: '🙂', label: 'Friendly', description: 'Warm and approachable tone' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', description: 'Professional and balanced' },
  { id: 'analytical', emoji: '🧐', label: 'Analytical', description: 'Detailed and thoughtful' },
  { id: 'assertive', emoji: '😠', label: 'Assertive', description: 'Direct and confident' },
  { id: 'creative', emoji: '🎨', label: 'Creative', description: 'Imaginative and inspiring' },
  { id: 'casual', emoji: '😎', label: 'Casual', description: 'Relaxed and informal' }
];

interface EmotionTokenPanelProps {
  selectedEmotion: string | null;
  onEmotionSelect: (emotionId: string | null) => void;
}

const EmotionTokenPanel = ({ selectedEmotion, onEmotionSelect }: EmotionTokenPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedToken = emotionTokens.find(token => token.id === selectedEmotion);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className={`border-neon-purple/50 hover:border-neon-purple text-neon-text hover:bg-neon-purple/10 ${
          selectedEmotion ? 'neon-glow-purple' : ''
        }`}
      >
        <Smile className="w-4 h-4 mr-2 text-neon-purple" />
        {selectedToken ? (
          <span className="flex items-center gap-1">
            <span>{selectedToken.emoji}</span>
            <span>{selectedToken.label}</span>
          </span>
        ) : (
          'Add Tone'
        )}
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-72 bg-neon-dark/95 backdrop-blur-sm border border-neon-purple/30 rounded-xl shadow-xl z-50 neon-glow-purple">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neon-text">Choose Your Tone</h3>
              {selectedEmotion && (
                <Button
                  onClick={() => {
                    onEmotionSelect(null);
                    setIsOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-neon-muted hover:text-neon-text"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {emotionTokens.map((token) => (
                <div
                  key={token.id}
                  onClick={() => {
                    onEmotionSelect(token.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedEmotion === token.id
                      ? 'bg-neon-purple/20 border border-neon-purple'
                      : 'hover:bg-neon-muted/10 border border-transparent hover:border-neon-purple/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{token.emoji}</span>
                    <span className="font-medium text-neon-text text-sm">{token.label}</span>
                  </div>
                  <p className="text-xs text-neon-muted">{token.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionTokenPanel;
