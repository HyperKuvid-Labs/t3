import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Cpu, Zap, Clock, Check, Search, X } from 'lucide-react';
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
    description: "Google's most advanced multimodal model with exceptional reasoning capabilities",
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
    description: "Google's most advanced model for fast responses with multimodal understanding",
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
    description: "Anthropic's flagship reasoning model with superior analytical capabilities",
    badge: "Popular",
    speed: "Fast",
    contextLength: "200K tokens",
    category: "main",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "DeepSeek's most advanced model for long-term memory and complex reasoning",
    badge: "NEW",
    speed: "Medium",
    contextLength: "128K tokens",
    category: "main",
  },
  {
    id: "gemma3_27b",
    name: "Gemma 3",
    provider: "Google",
    description: "Lightweight and efficient multimodal model optimized for performance",
    speed: "Fast",
    contextLength: "128K tokens",
    category: "local",
  },
  {
    id: "llama-3.3",
    name: "LlaMA 3.3",
    provider: "Meta",
    description: "Meta's multilingual, instruction-tuned 70B model with top-tier performance",
    speed: "Medium",
    contextLength: "128K tokens",
    category: "local",
  },
  {
    id: "deepseek-r1-70b",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "DeepSeek's most advanced model for long-term memory and complex reasoning",
    speed: "Fast",
    contextLength: "128K tokens",
    category: "local",
  },
  {
    id: "phi4-14b",
    name: "Phi 4",
    provider: "Microsoft",
    description: "State-of-the-art open model from Microsoft with excellent efficiency",
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [selectedModelForApiKey, setSelectedModelForApiKey] = useState<Model | null>(null);

  const selectedModelData = useMemo(() =>
    models.find(m => m.id === selectedModel),
    [selectedModel]
  );

  const filteredModels = useMemo(() =>
    models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const allFilteredModels = useMemo(() =>
    [...mainModels, ...localModels],
    [mainModels, localModels]
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('gidvion-selected-model');
    if (saved && models.find(m => m.id === saved) && saved !== selectedModel) {
      onModelSelect(saved);
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('gidvion-selected-model', selectedModel);
    }
  }, [selectedModel]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev < allFilteredModels.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : allFilteredModels.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && allFilteredModels[focusedIndex]) {
          handleModelSelect(allFilteredModels[focusedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
    }
  }, [isOpen, focusedIndex, allFilteredModels]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleModelSelect = useCallback((modelId: string) => {
    if (modelId === selectedModel) return;
    
    const model = models.find(m => m.id === modelId);
    if (model && (model.provider === 'Anthropic' || model.provider === 'DeepSeek')) {
      const storedKey = sessionStorage.getItem(`apiKey_${model.provider.toLowerCase()}`);
      if (!storedKey) {
        setSelectedModelForApiKey(model);
        setShowApiKeyDialog(true);
        return;
      }
    }

    onModelSelect(modelId);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  }, [selectedModel, onModelSelect]);

  const handleApiKeySubmit = (apiKey: string) => {
    if (selectedModelForApiKey) {
      sessionStorage.setItem(`apiKey_${selectedModelForApiKey.provider.toLowerCase()}`, apiKey);
      onModelSelect(selectedModelForApiKey.id);
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
      setSelectedModelForApiKey(null);
    }
  };

  const getSpeedIcon = useCallback((speed: string) => {
    switch (speed) {
      case 'Fast': return <Zap className="w-4 h-4 text-emerald-600" />;
      case 'Medium': return <Cpu className="w-4 h-4 text-amber-600" />;
      case 'Slow': return <Clock className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  }, []);

  const ModelItem = ({ model, index }: { model: Model; index: number }) => {
    const isSelected = selectedModel === model.id;
    const isFocused = focusedIndex === index;

    return (
      <div
        onClick={() => handleModelSelect(model.id)}
        className={`p-3 cursor-pointer border rounded-lg transition-colors duration-200 ${
          isSelected
            ? "border-blue-500 bg-white shadow-sm"
            : isFocused
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 hover:border-indigo-300 hover:bg-slate-50"
        }`}
        role="option"
        aria-selected={isSelected}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">{model.name}</span>
              {model.badge && (
                <Badge
                  variant={model.isNew ? "default" : "secondary"}
                  className={`text-xs font-medium ${
                    model.badge === "NEW" 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300" 
                      : model.badge === "Popular"
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  {model.badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-2 leading-relaxed">{model.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                {getSpeedIcon(model.speed)}
                <span className="text-slate-700 font-medium">{model.speed}</span>
              </div>
              <span className="text-indigo-600 font-medium">{model.contextLength}</span>
              <span className="text-teal-600 font-medium">{model.provider}</span>
            </div>
          </div>
          {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="justify-between w-full h-12 px-4 border-slate-300 hover:border-indigo-400 hover:bg-slate-50 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select AI model"
      >
        <div className="text-left">
          <div className="font-semibold text-slate-800">{selectedModelData?.name || 'Select Model'}</div>
          <div className="text-sm text-slate-500">{selectedModelData?.provider || 'Choose your AI assistant'}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-600 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
          role="listbox"
        >
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFocusedIndex(-1);
                }}
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                autoComplete="off"
                role="searchbox"
                aria-label="Search models"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFocusedIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-b from-slate-50 to-white">
            {mainModels.length > 0 && (
              <div className="mb-4">
                <h3 className="px-2 py-1 text-sm font-semibold text-indigo-700 mb-3">Featured Models</h3>
                <div className="space-y-2">
                  {mainModels.map((model, index) => (
                    <ModelItem key={model.id} model={model} index={index} />
                  ))}
                </div>
              </div>
            )}

            {localModels.length > 0 && (
              <div>
                <h3 className="px-2 py-1 text-sm font-semibold text-teal-700">Local Models (Ollama)</h3>
                <p className='text-xs text-slate-500 px-2 py-1 mb-3'>For faster inference.</p>
                <div className="space-y-2">
                  {localModels.map((model, index) => (
                    <ModelItem key={model.id} model={model} index={mainModels.length + index} />
                  ))}
                </div>
              </div>
            )}

            {filteredModels.length === 0 && (
              <div className="p-6 text-center">
                <div className="text-slate-400 mb-2">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                </div>
                <p className="text-slate-600 font-medium">No models found</p>
                <p className="text-sm text-slate-500">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      )}

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
