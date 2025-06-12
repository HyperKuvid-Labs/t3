import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Smile, Heart, Zap, Brain, Target, Sparkles, 
  Coffee, Sun, Moon, Star, Flame, Leaf,
  X, ChevronDown, Palette, Volume2
} from 'lucide-react';

interface EmotionToken {
  id: string;
  emoji: string;
  label: string;
  description: string;
  category: 'positive' | 'neutral' | 'energetic' | 'creative' | 'professional' | 'playful';
  color: string;
  bgGradient: string;
  icon: React.ComponentType<any>;
}

const emotionTokens: EmotionToken[] = [
  // Positive Emotions
  { 
    id: 'joyful', 
    emoji: '😊', 
    label: 'Joyful', 
    description: 'Uplifting and cheerful tone',
    category: 'positive',
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/20 to-orange-500/20',
    icon: Sun
  },
  { 
    id: 'enthusiastic', 
    emoji: '🤩', 
    label: 'Enthusiastic', 
    description: 'Excited and passionate approach',
    category: 'positive',
    color: 'text-pink-400',
    bgGradient: 'from-pink-500/20 to-rose-500/20',
    icon: Star
  },
  { 
    id: 'supportive', 
    emoji: '🤗', 
    label: 'Supportive', 
    description: 'Encouraging and understanding',
    category: 'positive',
    color: 'text-green-400',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    icon: Heart
  },
  { 
    id: 'inspiring', 
    emoji: '✨', 
    label: 'Inspiring', 
    description: 'Motivational and uplifting',
    category: 'positive',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-violet-500/20',
    icon: Sparkles
  },

  // Neutral/Professional
  { 
    id: 'neutral', 
    emoji: '😐', 
    label: 'Neutral', 
    description: 'Professional and balanced',
    category: 'professional',
    color: 'text-slate-400',
    bgGradient: 'from-slate-500/20 to-gray-500/20',
    icon: Target
  },
  { 
    id: 'analytical', 
    emoji: '🧐', 
    label: 'Analytical', 
    description: 'Detailed and thoughtful',
    category: 'professional',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    icon: Brain
  },
  { 
    id: 'authoritative', 
    emoji: '👔', 
    label: 'Authoritative', 
    description: 'Confident and commanding',
    category: 'professional',
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 to-blue-600/20',
    icon: Target
  },

  // Energetic
  { 
    id: 'energetic', 
    emoji: '⚡', 
    label: 'Energetic', 
    description: 'Dynamic and high-energy',
    category: 'energetic',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-400/20 to-amber-500/20',
    icon: Zap
  },
  { 
    id: 'bold', 
    emoji: '🔥', 
    label: 'Bold', 
    description: 'Daring and impactful',
    category: 'energetic',
    color: 'text-red-400',
    bgGradient: 'from-red-500/20 to-orange-600/20',
    icon: Flame
  },
  { 
    id: 'adventurous', 
    emoji: '🚀', 
    label: 'Adventurous', 
    description: 'Exploratory and daring',
    category: 'energetic',
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 to-red-500/20',
    icon: Zap
  },

  // Creative
  { 
    id: 'creative', 
    emoji: '🎨', 
    label: 'Creative', 
    description: 'Imaginative and inspiring',
    category: 'creative',
    color: 'text-violet-400',
    bgGradient: 'from-violet-500/20 to-purple-600/20',
    icon: Palette
  },
  { 
    id: 'whimsical', 
    emoji: '🦄', 
    label: 'Whimsical', 
    description: 'Playful and fantastical',
    category: 'creative',
    color: 'text-pink-300',
    bgGradient: 'from-pink-400/20 to-purple-500/20',
    icon: Sparkles
  },
  { 
    id: 'artistic', 
    emoji: '🌈', 
    label: 'Artistic', 
    description: 'Expressive and colorful',
    category: 'creative',
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 to-teal-500/20',
    icon: Palette
  },

  // Playful
  { 
    id: 'casual', 
    emoji: '😎', 
    label: 'Casual', 
    description: 'Relaxed and informal',
    category: 'playful',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    icon: Coffee
  },
  { 
    id: 'humorous', 
    emoji: '😄', 
    label: 'Humorous', 
    description: 'Light-hearted and funny',
    category: 'playful',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-yellow-500/20',
    icon: Smile
  },
  { 
    id: 'quirky', 
    emoji: '🤪', 
    label: 'Quirky', 
    description: 'Unique and unconventional',
    category: 'playful',
    color: 'text-lime-400',
    bgGradient: 'from-lime-500/20 to-green-500/20',
    icon: Star
  },

  // Calm/Peaceful
  { 
    id: 'calm', 
    emoji: '😌', 
    label: 'Calm', 
    description: 'Peaceful and serene',
    category: 'neutral',
    color: 'text-sky-400',
    bgGradient: 'from-sky-500/20 to-blue-400/20',
    icon: Leaf
  },
  { 
    id: 'contemplative', 
    emoji: '🤔', 
    label: 'Contemplative', 
    description: 'Thoughtful and reflective',
    category: 'neutral',
    color: 'text-slate-300',
    bgGradient: 'from-slate-400/20 to-gray-500/20',
    icon: Moon
  }
];

const categoryLabels = {
  positive: 'Positive Vibes',
  neutral: 'Balanced',
  energetic: 'High Energy',
  creative: 'Creative Flow',
  professional: 'Professional',
  playful: 'Playful & Fun'
};

interface EmotionTokenPanelProps {
  selectedEmotion: string | null;
  onEmotionSelect: (emotionId: string | null) => void;
}

const EmotionTokenPanel = ({ selectedEmotion, onEmotionSelect }: EmotionTokenPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedToken = emotionTokens.find(token => token.id === selectedEmotion);
  
  // Group emotions by category
  const emotionsByCategory = emotionTokens.reduce((acc, emotion) => {
    if (!acc[emotion.category]) {
      acc[emotion.category] = [];
    }
    acc[emotion.category].push(emotion);
    return acc;
  }, {} as Record<string, EmotionToken[]>);

  const filteredCategories = selectedCategory 
    ? { [selectedCategory]: emotionsByCategory[selectedCategory] }
    : emotionsByCategory;

  useGSAP(() => {
    if (isOpen && panelRef.current) {
      gsap.fromTo(panelRef.current, 
        { 
          opacity: 0, 
          y: 10, 
          scale: 0.95 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.3, 
          ease: "back.out(1.7)" 
        }
      );
    }
  }, [isOpen]);

  const handleEmotionSelect = (emotionId: string) => {
    onEmotionSelect(emotionId);
    setIsOpen(false);
    
    // Animate button selection
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className={`relative overflow-hidden border-2 transition-all duration-300 ${
            selectedEmotion 
              ? `border-purple-500/70 bg-gradient-to-r ${selectedToken?.bgGradient} shadow-lg shadow-purple-500/20` 
              : 'border-slate-600 hover:border-purple-500/50 bg-slate-800/50 hover:bg-slate-700/50'
          }`}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative flex items-center gap-2">
            {selectedToken ? (
              <>
                <motion.span 
                  className="text-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedToken.emoji}
                </motion.span>
                <span className={`font-medium ${selectedToken.color}`}>
                  {selectedToken.label}
                </span>
              </>
            ) : (
              <>
                <Smile className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Choose Tone</span>
              </>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full mb-3 left-0 w-96 max-h-96 overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Choose Your Tone</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmotion && (
                      <Button
                        onClick={() => {
                          onEmotionSelect(null);
                          setIsOpen(false);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    onClick={() => setSelectedCategory(null)}
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                  >
                    All
                  </Button>
                  {Object.keys(categoryLabels).map((category) => (
                    <Button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                    >
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Emotions Grid */}
              <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {Object.entries(filteredCategories).map(([category, emotions]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {emotions.map((token) => {
                          const IconComponent = token.icon;
                          return (
                            <motion.div
                              key={token.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onHoverStart={() => setHoveredEmotion(token.id)}
                              onHoverEnd={() => setHoveredEmotion(null)}
                            >
                              <Card
                                onClick={() => handleEmotionSelect(token.id)}
                                className={`cursor-pointer transition-all duration-300 border-2 ${
                                  selectedEmotion === token.id
                                    ? `border-purple-500 bg-gradient-to-br ${token.bgGradient} shadow-lg shadow-purple-500/20`
                                    : hoveredEmotion === token.id
                                    ? `border-slate-500 bg-gradient-to-br ${token.bgGradient} shadow-md`
                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                      <motion.span 
                                        className="text-2xl"
                                        animate={hoveredEmotion === token.id ? { 
                                          scale: [1, 1.2, 1],
                                          rotate: [0, 5, -5, 0] 
                                        } : {}}
                                        transition={{ duration: 0.3 }}
                                      >
                                        {token.emoji}
                                      </motion.span>
                                      <IconComponent className={`w-3 h-3 ${token.color}`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-medium text-sm ${token.color}`}>
                                          {token.label}
                                        </span>
                                        {selectedEmotion === token.id && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 bg-purple-500 rounded-full"
                                          />
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-400 leading-relaxed">
                                        {token.description}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default EmotionTokenPanel;
