
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Cpu, Zap, Sparkles, Clock, Database, Check } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
  speed: 'Fast' | 'Medium' | 'Slow';
  contextLength: string;
  isNew?: boolean;
  category: 'main' | 'local';
}

const models: Model[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: "Google's most advanced multimodal model",
    badge: 'NEW',
    speed: 'Medium',
    contextLength: '2M tokens',
    isNew: true,
    category: 'main'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: "Anthropic's flagship reasoning model",
    badge: 'Popular',
    speed: 'Fast',
    contextLength: '200K tokens',
    category: 'main'
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: "OpenAI's most advanced model",
    speed: 'Medium',
    contextLength: '128K tokens',
    category: 'main'
  },
  {
    id: 'phi-3',
    name: 'Phi-3',
    provider: 'Microsoft',
    description: 'Lightweight and efficient local model',
    speed: 'Fast',
    contextLength: '32K tokens',
    category: 'local'
  },
  {
    id: 'llama-3',
    name: 'LLaMA 3',
    provider: 'Meta',
    description: "Meta's open-source powerhouse",
    speed: 'Medium',
    contextLength: '8K tokens',
    category: 'local'
  },
  {
    id: 'gemma',
    name: 'Gemma',
    provider: 'Google',
    description: 'Compact and efficient model',
    speed: 'Fast',
    contextLength: '8K tokens',
    category: 'local'
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ModelSelector = ({ selectedModel, onModelSelect }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedModelData = models.find(m => m.id === selectedModel);
  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mainModels = filteredModels.filter(m => m.category === 'main');
  const localModels = filteredModels.filter(m => m.category === 'local');

  // Load selection from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gidvion-selected-model');
    if (saved && models.find(m => m.id === saved)) {
      onModelSelect(saved);
    }
  }, [onModelSelect]);

  // Save selection to localStorage
  useEffect(() => {
    localStorage.setItem('gidvion-selected-model', selectedModel);
  }, [selectedModel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'Fast': return <Zap className="w-3 h-3 text-neon-green" />;
      case 'Medium': return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'Slow': return <Database className="w-3 h-3 text-orange-400" />;
      default: return null;
    }
  };

  const ModelItem = ({ model }: { model: Model }) => {
    const isSelected = selectedModel === model.id;
    const isHovered = hoveredModel === model.id;

    return (
      <motion.div
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
          isSelected
            ? 'bg-zinc-800 border-neon-blue shadow-lg shadow-neon-blue/10'
            : isHovered
            ? 'bg-zinc-800/50 border-zinc-600'
            : 'border-transparent hover:bg-zinc-800/30 hover:border-zinc-700'
        }`}
        onClick={() => handleModelSelect(model.id)}
        onMouseEnter={() => setHoveredModel(model.id)}
        onMouseLeave={() => setHoveredModel(null)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">{model.name}</span>
            {model.isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-neon-blue" />
                <Badge variant="outline" className="text-xs border-neon-blue/30 text-neon-blue bg-neon-blue/10">
                  {model.badge}
                </Badge>
              </motion.div>
            )}
            {model.badge && !model.isNew && (
              <Badge variant="outline" className="text-xs border-neon-purple/30 text-neon-purple bg-neon-purple/10">
                {model.badge}
              </Badge>
            )}
          </div>
          
          {isSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-neon-blue"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{model.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              {getSpeedIcon(model.speed)}
              <span className="text-zinc-500">{model.speed}</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-zinc-500" />
              <span className="text-zinc-500">{model.contextLength}</span>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-medium">{model.provider}</span>
        </div>

        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-neon-blue/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={`justify-between min-w-[240px] h-12 px-4 font-medium tracking-tight transition-all duration-200 ${
          isOpen
            ? 'border-neon-blue bg-zinc-800/50 text-white shadow-lg shadow-neon-blue/10'
            : 'border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:bg-zinc-800/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Cpu className="w-4 h-4 text-neon-blue" />
          </motion.div>
          <div className="text-left">
            <div className="text-sm font-medium">{selectedModelData?.name || 'Select Model'}</div>
            <div className="text-xs text-zinc-500">{selectedModelData?.provider}</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="absolute top-full mt-2 w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-800">
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all duration-200"
                autoFocus
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {/* Main Models Section */}
              {mainModels.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-neon-blue" />
                    <h3 className="text-sm font-semibold text-zinc-300 tracking-wide">FEATURED MODELS</h3>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {mainModels.map((model, index) => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ModelItem model={model} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Local Models Section */}
              {localModels.length > 0 && (
                <div className="p-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-neon-green" />
                    <h3 className="text-sm font-semibold text-zinc-300 tracking-wide">LOCAL MODELS</h3>
                    <Badge variant="outline" className="text-xs border-neon-green/30 text-neon-green bg-neon-green/10">
                      Ollama
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-500 mb-3 leading-relaxed">
                    Faster inference, local deployment capable
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {localModels.map((model, index) => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ModelItem model={model} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {filteredModels.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-zinc-500 mb-2">No models found</div>
                  <div className="text-xs text-zinc-600">Try adjusting your search terms</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
