
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Code, Upload, Download, Mail, Zap, Database, Globe, Coins, 
  Plus, Edit, X, ArrowDown, Play, Save, Settings, ChevronRight,
  Cpu, Clock, Thermometer, Hash, FileText, Workflow
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Block {
  id: string;
  type: 'input' | 'model' | 'output' | 'processor';
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  config: Record<string, any>;
}

interface TechStack {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  technologies: string[];
}

const techStacks: TechStack[] = [
  {
    id: 'mern',
    name: 'MERN',
    description: 'MongoDB, Express, React, Node.js',
    icon: Database,
    technologies: ['MongoDB', 'Express.js', 'React', 'Node.js']
  },
  {
    id: 'nextjs',
    name: 'Next.js + Prisma',
    description: 'Full-stack React with Prisma ORM',
    icon: Globe,
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'TypeScript']
  },
  {
    id: 'django',
    name: 'Django + React',
    description: 'Python backend with React frontend',
    icon: Code,
    technologies: ['Django', 'Python', 'React', 'PostgreSQL']
  }
];

const initialBlocks: Block[] = [
  {
    id: '1',
    type: 'input',
    title: 'User Input',
    subtitle: 'Text input processing',
    icon: FileText,
    config: { maxLength: 1000, validation: 'text' }
  },
  {
    id: '2',
    type: 'model',
    title: 'GPT-4 Turbo',
    subtitle: 'Primary reasoning model',
    icon: Cpu,
    config: { 
      temperature: 0.7, 
      maxTokens: 2000, 
      systemPrompt: 'You are a helpful AI assistant.' 
    }
  },
  {
    id: '3',
    type: 'output',
    title: 'Formatted Response',
    subtitle: 'JSON structure output',
    icon: Code,
    config: { format: 'json', schema: '{}' }
  }
];

const ProjectBuilder = () => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(blocks[0]);
  const [projectName, setProjectName] = useState('Multi-Agent Pipeline');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Project saved",
        description: "Your agent pipeline has been saved successfully.",
      });
    }, 1000);
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(blocks.find(b => b.id !== blockId) || null);
    }
  };

  const handleAddBlock = () => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: 'model',
      title: 'New Model Block',
      subtitle: 'Configure this block',
      icon: Cpu,
      config: { temperature: 0.7, maxTokens: 1000 }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock);
  };

  const updateBlockConfig = (key: string, value: any) => {
    if (!selectedBlock) return;
    
    const updatedBlocks = blocks.map(block => 
      block.id === selectedBlock.id 
        ? { ...block, config: { ...block.config, [key]: value } }
        : block
    );
    setBlocks(updatedBlocks);
    setSelectedBlock({ ...selectedBlock, config: { ...selectedBlock.config, [key]: value } });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top Navigation */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span>Builder</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{projectName}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsTestModalOpen(true)}
                variant="outline"
                className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              >
                <Play className="w-4 h-4 mr-2" />
                Test Run
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              >
                {isSaving ? (
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Pipeline
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Workflow Builder */}
        <div className="w-1/2 border-r border-zinc-800 bg-zinc-950 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">
                Agent Pipeline
              </h2>
              <p className="text-zinc-400 text-sm">
                Build your multi-model agent workflow with modular blocks
              </p>
            </div>

            {/* Workflow Blocks */}
            <div className="space-y-4">
              <AnimatePresence>
                {blocks.map((block, index) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`relative group rounded-xl bg-zinc-900 p-4 cursor-pointer transition-all duration-200 ${
                      selectedBlock?.id === block.id
                        ? 'ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'hover:ring-1 hover:ring-indigo-500/20 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <block.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white tracking-tight">
                            {block.title}
                          </h3>
                          <p className="text-sm text-zinc-400">{block.subtitle}</p>
                          {block.type === 'model' && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                Temp: {block.config.temperature}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                {block.config.maxTokens} tokens
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-zinc-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlock(block);
                          }}
                        >
                          <Edit className="w-4 h-4 text-zinc-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Connection Arrow */}
                    {index < blocks.length - 1 && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-px h-4 bg-zinc-700"></div>
                        <ArrowDown className="w-4 h-4 text-zinc-600 -mt-1" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Panel - Configuration */}
        <div className="w-1/2 bg-zinc-900 p-6 overflow-y-auto">
          {selectedBlock ? (
            <div className="space-y-6">
              {/* Block Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="p-2 rounded-lg bg-zinc-800">
                  <selectedBlock.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {selectedBlock.title}
                  </h3>
                  <p className="text-zinc-400 text-sm">{selectedBlock.subtitle}</p>
                </div>
              </div>

              {/* Configuration Sections */}
              <Accordion type="multiple" defaultValue={["basic", "advanced"]} className="space-y-4">
                <AccordionItem value="basic" className="border border-zinc-800 rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium">Basic Configuration</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {selectedBlock.type === 'model' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Temperature
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={selectedBlock.config.temperature || 0.7}
                                onChange={(e) => updateBlockConfig('temperature', parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="text-sm text-zinc-400 font-mono min-w-[3rem]">
                                {selectedBlock.config.temperature || 0.7}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Max Tokens
                            </label>
                            <Input
                              type="number"
                              value={selectedBlock.config.maxTokens || 1000}
                              onChange={(e) => updateBlockConfig('maxTokens', parseInt(e.target.value))}
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              System Prompt
                            </label>
                            <Textarea
                              value={selectedBlock.config.systemPrompt || ''}
                              onChange={(e) => updateBlockConfig('systemPrompt', e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white min-h-24 font-mono text-sm"
                              placeholder="Enter system prompt..."
                            />
                          </div>
                        </>
                      )}

                      {selectedBlock.type === 'input' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Max Length
                            </label>
                            <Input
                              type="number"
                              value={selectedBlock.config.maxLength || 1000}
                              onChange={(e) => updateBlockConfig('maxLength', parseInt(e.target.value))}
                              className="bg-zinc-800 border-zinc-700 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Validation Type
                            </label>
                            <select
                              value={selectedBlock.config.validation || 'text'}
                              onChange={(e) => updateBlockConfig('validation', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="url">URL</option>
                              <option value="json">JSON</option>
                            </select>
                          </div>
                        </>
                      )}

                      {selectedBlock.type === 'output' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Output Format
                            </label>
                            <select
                              value={selectedBlock.config.format || 'json'}
                              onChange={(e) => updateBlockConfig('format', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                            >
                              <option value="json">JSON</option>
                              <option value="text">Plain Text</option>
                              <option value="markdown">Markdown</option>
                              <option value="html">HTML</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Schema
                            </label>
                            <Textarea
                              value={selectedBlock.config.schema || '{}'}
                              onChange={(e) => updateBlockConfig('schema', e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white min-h-24 font-mono text-sm"
                              placeholder="Enter JSON schema..."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="advanced" className="border border-zinc-800 rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium">Advanced Settings</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Error Handling
                        </label>
                        <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white">
                          <option value="retry">Retry on failure</option>
                          <option value="fallback">Use fallback</option>
                          <option value="skip">Skip block</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Timeout (seconds)
                        </label>
                        <Input
                          type="number"
                          defaultValue={30}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-zinc-600" />
                          <span className="text-sm text-zinc-300">Enable caching</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-zinc-600" />
                          <span className="text-sm text-zinc-300">Log requests</span>
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 shadow-lg shadow-emerald-600/20"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a block to configure its settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleAddBlock}
          className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 border-0"
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </motion.div>

      {/* Test Modal */}
      <AnimatePresence>
        {isTestModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsTestModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Test Pipeline</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTestModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Test Input
                  </label>
                  <Textarea
                    placeholder="Enter test input for your pipeline..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-24"
                  />
                </div>
                
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectBuilder;
