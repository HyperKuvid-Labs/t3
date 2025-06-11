
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Cpu, Cloud } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  badge: string;
  badgeColor: string;
}

const models: Model[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Lightning fast responses',
    icon: Zap,
    badge: 'Fast',
    badgeColor: 'bg-neon-green/20 text-neon-green border-neon-green/50'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Balanced performance',
    icon: Target,
    badge: 'Accurate',
    badgeColor: 'bg-neon-blue/20 text-neon-blue border-neon-blue/50'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Advanced reasoning',
    icon: Cloud,
    badge: 'Popular',
    badgeColor: 'bg-neon-purple/20 text-neon-purple border-neon-purple/50'
  },
  {
    id: 'gemini-ollama',
    name: 'Gemini via Ollama',
    description: 'Local processing power',
    icon: Cpu,
    badge: 'Fast',
    badgeColor: 'bg-neon-green/20 text-neon-green border-neon-green/50'
  }
];

interface ModelTabsProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ModelTabs = ({ selectedModel, onModelSelect }: ModelTabsProps) => {
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="w-full">
      <Tabs value={selectedModel} onValueChange={onModelSelect} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neon-dark/50 border border-neon-blue/20">
          {models.map((model) => {
            const Icon = model.icon;
            return (
              <TabsTrigger
                key={model.id}
                value={model.id}
                className="data-[state=active]:bg-neon-blue data-[state=active]:text-neon-dark transition-all duration-300 hover:bg-neon-blue/10 flex flex-col gap-1 p-3 h-auto"
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium truncate">{model.name}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${model.badgeColor}`}>
                  {model.badge}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {models.map((model) => (
          <TabsContent key={model.id} value={model.id} className="mt-4">
            <div className="flex items-center gap-3 p-3 bg-neon-dark/30 rounded-lg border border-neon-blue/20">
              <model.icon className="w-5 h-5 text-neon-blue" />
              <div>
                <h3 className="font-semibold text-neon-text">{model.name}</h3>
                <p className="text-sm text-neon-muted">{model.description}</p>
              </div>
              <Badge variant="outline" className={model.badgeColor}>
                {model.badge}
              </Badge>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ModelTabs;
