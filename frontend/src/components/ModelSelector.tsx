import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Cpu, Zap, Sparkles, Clock, Database, Check } from 'lucide-react';
import ApiKeyDialog from './ApiKeyDialog';

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

export const models: Model[] = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Google's most advanced multimodal model",
    badge: "NEW",
    speed: "Medium",
    contextLength: "1M tokens",
    isNew: true,
    category: "main",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Google's most advanced model for fast responses",
    badge: "NEW",
    speed: "Fast",
    contextLength: "1M tokens",
    isNew: true,
    category: "main",
  },
  {
    id: "claude-4.0-sonnet",
    name: "Claude 4.0 Sonnet",
    provider: "Anthropic",
    description: "Anthropic's flagship reasoning model",
    badge: "Popular",
    speed: "Fast",
    contextLength: "200K tokens",
    category: "main",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "DeepSeek's most advanced model for long-term memory",
    badge: "NEW",
    speed: "Medium",
    contextLength: "128K tokens",
    category: "main",
  },
  {
    id: "gemma3_27b",
    name: "Gemma 3",
    provider: "Google",
    description: "Lightweight and efficient Multimodal model",
    speed: "Fast",
    contextLength: "128K tokens",
    category: "local",
  },
  {
    id: "llama-3.3",
    name: "LlaMA 3.3",
    provider: "Meta",
    description: "Meta's multilingual, instruction-tuned 70B model with top-tier performance.",
    speed: "Medium",
    contextLength: "128K tokens",
    category: "local",
  },
  {
    id: "deepseek-r1-70b",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "DeepSeek's most advanced model for long-term memory",
    speed: "Fast",
    contextLength: "128K tokens",
    category: "local",
  },
  {
    id: "phi4-14b",
    name: "Phi 4",
    provider: "Microsoft",
    description: "State-of-the-art open model from Microsoft.",
    speed: "Fast",
    contextLength: "16K tokens",
    category: "local",
  },
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
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [selectedModelForApiKey, setSelectedModelForApiKey] = useState<Model | null>(null);

  // Memoize to prevent unnecessary re-renders
  const selectedModelData = useMemo(() => 
    models.find(m => m.id === selectedModel), 
    [selectedModel]
  );

  const filteredModels = useMemo(() => 
    models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [searchTerm]
  );

  const mainModels = useMemo(() => 
    filteredModels.filter(m => m.category === 'main'), 
    [filteredModels]
  );

  const localModels = useMemo(() => 
    filteredModels.filter(m => m.category === 'local'), 
    [filteredModels]
  );

  // Use layoutEffect to prevent flickering on initial load
  useLayoutEffect(() => {
    const saved = localStorage.getItem('gidvion-selected-model');
    if (saved && models.find(m => m.id === saved) && saved !== selectedModel) {
      onModelSelect(saved);
    }
  }, []); // Remove onModelSelect from deps to prevent loops

  // Save selection to localStorage
  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('gidvion-selected-model', selectedModel);
    }
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

  // Debounced selection to prevent rapid updates
  const handleModelSelect = useCallback((modelId: string) => {
    if (modelId === selectedModel) return; // Prevent unnecessary updates

    const model = models.find(m => m.id === modelId);

    if (model && (model.provider === 'Anthropic' || model.provider === 'DeepSeek')) {
    const storedKey = localStorage.getItem(`apiKey_${model.provider.toLowerCase()}`);
    
    if (!storedKey) {
      setSelectedModelForApiKey(model);
      setShowApiKeyDialog(true);
      return;
    }
  }
    
    onModelSelect(modelId);
    setIsOpen(false);
    setSearchTerm('');
  }, [selectedModel, onModelSelect]);

  const handleApiKeySubmit = (apiKey: string) => {
    if (selectedModelForApiKey) {
      // Store API key securely
      localStorage.setItem(`apiKey_${selectedModelForApiKey.provider.toLowerCase()}`, apiKey);
      
      // Proceed with model selection
      onModelSelect(selectedModelForApiKey.id);
      setIsOpen(false);
      setSearchTerm('');
      setSelectedModelForApiKey(null);
    }
};

  const getSpeedIcon = useCallback((speed: string) => {
    switch (speed) {
      case 'Fast': return <Zap size={12} className="text-green-500" />;
      case 'Medium': return <Clock size={12} className="text-yellow-500" />;
      case 'Slow': return <Database size={12} className="text-red-500" />;
      default: return null;
    }
  }, []);

  const ModelItem = ({ model }: { model: Model }) => {
    const isSelected = selectedModel === model.id;
    const isHovered = hoveredModel === model.id;

    return (
      <motion.div
        key={`model-item-${model.id}`}
        layoutId={`model-item-${model.id}`}
        onClick={() => handleModelSelect(model.id)}
        onMouseEnter={() => setHoveredModel(model.id)}
        onMouseLeave={() => setHoveredModel(null)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
          isSelected
            ? 'border-neon-blue bg-neon-blue/10 text-white'
            : isHovered
            ? 'border-zinc-600 bg-zinc-800/50'
            : 'border-zinc-700 hover:border-zinc-600'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm text-white">{model.name}</h3>
              {model.isNew && (
                <Badge className="text-xs px-1.5 py-0.5 bg-neon-green/20 text-neon-green border-neon-green/50">
                  {model.badge}
                </Badge>
              )}
              {model.badge && !model.isNew && (
                <Badge className="text-xs px-1.5 py-0.5 bg-zinc-700 text-zinc-300 border-zinc-600">
                  {model.badge}
                </Badge>
              )}
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <Check size={16} className="text-neon-blue" />
              </motion.div>
            )}
          </div>
        </div>
        
        <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
          {model.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-zinc-400">
            {getSpeedIcon(model.speed)}
            <span>{model.speed}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>{model.contextLength}</span>
            <span>{model.provider}</span>
          </div>
        </div>
        
        {isSelected && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-0.5 bg-neon-blue mt-2 rounded-full"
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
        <div className="flex flex-col items-start">
          <span className="text-sm">{selectedModelData?.name || 'Select Model'}</span>
          <span className="text-xs text-zinc-500">{selectedModelData?.provider}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-700">
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all duration-200"
                autoFocus
              />
            </div>

            <div className="max-h-80 overflow-y-auto">
              {/* Main Models Section */}
              {mainModels.length > 0 && (
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    FEATURED MODELS
                  </h4>
                  <div className="space-y-2">
                    {mainModels.map((model) => (
                      <ModelItem key={model.id} model={model} />
                    ))}
                  </div>
                </div>
              )}

              {/* Local Models Section */}
              {localModels.length > 0 && (
                <div className="p-4 border-t border-zinc-700">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      LOCAL MODELS
                    </h4>
                    <Badge className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 border-zinc-600">
                      Ollama
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">
                    Faster inference, local deployment capable
                  </p>
                  <div className="space-y-2">
                    {localModels.map((model) => (
                      <ModelItem key={model.id} model={model} />
                    ))}
                  </div>
                </div>
              )}

              {filteredModels.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-zinc-400 mb-2">No models found</div>
                  <div className="text-xs text-zinc-500">Try adjusting your search terms</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        onClose={() => {
          setShowApiKeyDialog(false);
          setSelectedModelForApiKey(null);
        }}
        onSubmit={handleApiKeySubmit}
        modelName={selectedModelForApiKey?.name || ''}
        provider={selectedModelForApiKey?.provider || ''}
      />
    </div>
  );
};

export default ModelSelector;
