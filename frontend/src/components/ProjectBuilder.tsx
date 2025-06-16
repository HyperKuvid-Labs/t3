import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Code, Upload, Download, Mail, Zap, Database, Globe, Coins, 
  Plus, Edit, X, ArrowDown, Play, Save, Settings, ChevronRight,
  Cpu, Clock, Thermometer, Hash, FileText, Workflow, Sparkles,
  Rocket, CheckCircle, AlertCircle, Send, Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { runProjectBuilder } from '@/api/chatService';

gsap.registerPlugin(useGSAP);

interface TechStack {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  technologies: string[];
  category: 'fullstack' | 'frontend' | 'backend' | 'mobile' | 'blockchain';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
}

interface AppRequest {
  techStack: TechStack | null;
  prompt: string;
  email: string;
  features: string[];
}

const techStacks: TechStack[] = [
  {
    id: 'mern',
    name: 'MERN Stack',
    description: 'MongoDB, Express, React, Node.js - Perfect for modern web apps',
    icon: Database,
    technologies: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JWT Auth'],
    category: 'fullstack',
    difficulty: 'intermediate',
    estimatedTime: '35-45 mins'
  },
  {
    id: 'nextjs',
    name: 'Next.js + Prisma',
    description: 'Full-stack React with Prisma ORM and TypeScript',
    icon: Globe,
    technologies: ['Next.js 14', 'Prisma', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
    category: 'fullstack',
    difficulty: 'intermediate',
    estimatedTime: '30-40 mins'
  },
  {
    id: 'django-react',
    name: 'Django + React',
    description: 'Python backend with React frontend - Robust and scalable',
    icon: Code,
    technologies: ['Django', 'Python', 'React', 'PostgreSQL', 'DRF'],
    category: 'fullstack',
    difficulty: 'advanced',
    estimatedTime: '40-50 mins'
  },
   {
    id: 'rust-solana-dapp',
    name: 'Solana dApp (Rust)',
    description: 'Decentralized application on Solana blockchain using Rust',
    icon: Globe,
    technologies: ['Rust', 'Anchor Framework', 'Solana', 'Web3.js', 'Phantom Wallet'],
    category: 'blockchain',
    difficulty: 'expert',
    estimatedTime: '60-90 mins'
  },
  {
    id: 'vue-nuxt',
    name: 'Vue + Nuxt',
    description: 'Vue.js with Nuxt for SSR and static generation',
    icon: Sparkles,
    technologies: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Pinia', 'TailwindCSS'],
    category: 'fullstack',
    difficulty: 'intermediate',
    estimatedTime: '30-40 mins'
  },
  {
    id: 'svelte-kit',
    name: 'SvelteKit',
    description: 'Modern, fast, and lightweight web applications',
    icon: Rocket,
    technologies: ['Svelte', 'SvelteKit', 'TypeScript', 'Vite', 'TailwindCSS'],
    category: 'fullstack',
    difficulty: 'intermediate',
    estimatedTime: '25-35 mins'
  },
  {
    id: 'go-gin-stack',
    name: 'Go + Gin Framework',
    description: 'High-performance REST API development with Go and Gin',
    icon: Zap,
    technologies: ['Go', 'Gin Framework', 'PostgreSQL', 'Redis', 'Docker'],
    category: 'backend',
    difficulty: 'intermediate',
    estimatedTime: '35-45 mins'
  },
  {
    id: 't3-stack',
    name: 'T3 Stack',
    description: 'Type-safe full-stack development with Next.js, tRPC, and Prisma',
    icon: Database,
    technologies: ['Next.js', 'TypeScript', 'tRPC', 'Prisma', 'Tailwind CSS'],
    category: 'fullstack',
    difficulty: 'advanced',
    estimatedTime: '50-70 mins'
  },
  {
    id: 'flutter-firebase',
    name: 'Flutter + Firebase',
    description: 'Cross-platform mobile development with Google\'s backend services',
    icon: Sparkles,
    technologies: ['Flutter', 'Firebase', 'Cloud Firestore', 'FCM', 'Firebase Auth'],
    category: 'mobile',
    difficulty: 'intermediate',
    estimatedTime: '40-60 mins'
  }
];

const popularFeatures = [
  // Core Backend Features
  'Authentication & Authorization',
  'Database Integration', 
  'API Development',
  'Microservices Architecture',
  
  // Modern Web Features
  'Real-time Features',
  'GraphQL Integration',
  'Server-Side Rendering (SSR)',
  'Static Site Generation (SSG)',
  
  // Blockchain & Web3
  'Smart Contract Integration',
  'Wallet Connection',
  'Cryptocurrency Payments',
  'NFT Marketplace Features',
  
  // Performance & Scalability
  'Caching Strategies',
  'Load Balancing',
  'CDN Integration',
  'WebAssembly (WASM) Support',
  
  // Developer Experience
  'Type Safety (TypeScript)',
  'Code Generation',
  'Hot Module Replacement',
  'Developer Tools Integration',
  
  // Traditional Features (Updated)
  'File Upload/Download',
  'Email Integration', 
  'Payment Processing',
  'Admin Dashboard',
  
  // Modern Frontend
  'Progressive Web App (PWA)',
  'Mobile Responsive',
  'Dark Mode Support',
  'Internationalization (i18n)',
  
  // DevOps & Quality
  'Container Orchestration',
  'CI/CD Pipelines',
  'Monitoring & Analytics',
  'Testing Setup',
  'Security Scanning',
  
  // Cloud & Deployment
  'Serverless Functions',
  'Edge Computing',
  'Multi-cloud Deployment',
  'Auto-scaling Configuration'
];


const AppBuilder = () => {
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stacksRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial animations
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    gsap.from(".tech-stack-card", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.3
    });

    gsap.from(".feature-badge", {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "back.out(1.7)",
      delay: 0.8
    });
  }, { scope: containerRef });

  const handleStackSelect = (stack: TechStack) => {
    setSelectedStack(stack);
    setCurrentStep(2);
    
    // Animate to next step
    gsap.to(window, {
      scrollTo: { y: formRef.current, offsetY: 100 },
      duration: 1,
      ease: "power2.inOut"
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleGenerate = async () => {
    if (!selectedStack || !prompt.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a tech stack, provide a prompt, and enter your email.",
        variant: "destructive"
      });
      return;
    }
  
    setIsGenerating(true);
  
    try {
      const appRequest = {
        email: email.trim(),
        stack_id : selectedStack.id,
        enhancedPrompt: `Project Requirements:
      ${prompt.trim()}

      Tech Stack: ${selectedStack.name}
      Technologies: ${selectedStack.technologies.join(', ')}
      Category: ${selectedStack.category}
      Difficulty: ${selectedStack.difficulty}
      Estimated Time: ${selectedStack.estimatedTime}

      Required Features:
      ${selectedFeatures.map(feature => `- ${feature}`).join('\n')}

      Please generate a complete project structure and implementation using the specified tech stack with all the required features integrated.`
      };
  
      const response = await fetch("http://localhost:8000/run_project_builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appRequest)
      });
  
      // const result = await runProjectBuilder(appRequest.enhancedPrompt, appRequest.email, appRequest.stack_id);
  
      if (!response.ok) {
        throw new Error("Backend error, our bad!!");
      }
  
      toast({
        title: "App Generation Started! 🚀",
        description: `Your ${selectedStack.name} app is being generated.`,
      });
  
      setSelectedStack(null);
      setPrompt('');
      setEmail('');
      setSelectedFeatures([]);
      setCurrentStep(1);
  
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fullstack': return Globe;
      case 'frontend': return Code;
      case 'backend': return Database;
      case 'mobile': return Cpu;
      default: return Code;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div ref={headerRef} className="relative z-10 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-500/30"
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI App Builder
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              Build Your Dream App
              <span className="block text-3xl md:text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mt-2">
                Ship in Minutes, Not Months (Debugging Speed May Vary)
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Choose your tech stack, describe your vision, and receive a fully functional app delivered to your inbox.
            </p>

            {/* Status Banner */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium">
                <b>Beta service: ~40 minute generation time with occasional import tweaks needed - enhanced version with faster, cleaner code coming soon!</b>
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </motion.div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-24 mt-4">
            <span className="text-sm text-slate-400">Choose Stack</span>
            <span className="text-sm text-slate-400">Configure</span>
            <span className="text-sm text-slate-400">Generate</span>
          </div>
        </div>

        {/* Tech Stack Selection */}
        <div ref={stacksRef} className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Tech Stack</h2>
            <p className="text-xl text-slate-400">Select the perfect foundation for your application</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStacks.map((stack, index) => {
              const CategoryIcon = getCategoryIcon(stack.category);
              return (
                <motion.div
                  key={stack.id}
                  className="tech-stack-card"
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    className={`relative overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                      selectedStack?.id === stack.id
                        ? 'border-purple-500 bg-purple-500/10 shadow-2xl shadow-purple-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
                    }`}
                    onClick={() => handleStackSelect(stack)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-700 rounded-xl">
                            <stack.icon className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{stack.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <CategoryIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-400 capitalize">{stack.category}</span>
                            </div>
                          </div>
                        </div>
                        {selectedStack?.id === stack.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="p-1 bg-purple-600 rounded-full"
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <CardDescription className="text-slate-300 mt-3">
                        {stack.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {stack.technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-xs border-slate-600 text-slate-300 bg-slate-700/50"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getDifficultyColor(stack.difficulty)}`}>
                          {stack.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{stack.estimatedTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Configuration Form */}
        <AnimatePresence>
          {selectedStack && (
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-4">Configure Your App</h3>
                <p className="text-lg text-slate-400">
                  Tell us about your vision for the <span className="text-purple-400 font-semibold">{selectedStack.name}</span> application
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Prompt */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Describe Your App
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Be specific about features, design, and functionality you want
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: Create a social media app for photographers with image sharing, comments, likes, user profiles, and a discovery feed. Include authentication, real-time notifications, and a clean, modern design..."
                      className="min-h-48 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                    />
                    <div className="mt-2 text-right">
                      <span className={`text-sm ${prompt.length < 50 ? 'text-red-400' : 'text-slate-400'}`}>
                        {prompt.length}/1000 characters
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Features & Email */}
                <div className="space-y-6">
                  {/* Popular Features */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        Popular Features
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Select features to include in your app
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {popularFeatures.map((feature) => (
                          <motion.div
                            key={feature}
                            className="feature-badge"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                              className={`cursor-pointer transition-all duration-200 text-xs p-2 ${
                                selectedFeatures.includes(feature)
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'border-slate-600 text-slate-300 hover:border-purple-500 hover:text-purple-400'
                              }`}
                              onClick={() => handleFeatureToggle(feature)}
                            >
                              {feature}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Input */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-400" />
                        Delivery Email
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        We’ll zip up your generated app and send it to your inbox. Please enter the email you signed up with — that’s all we need from you. Cheers! 🙂
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center pt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || !email.trim()}
                    className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                        Generating Your App...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-3" />
                        Generate My App
                      </>
                    )}
                  </Button>
                </motion.div>
                
                {selectedStack && (
                  <p className="text-slate-400 mt-4">
                    Estimated generation time: <span className="text-purple-400 font-semibold">{selectedStack.estimatedTime}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-400">
            Powered by AI • Built with ❤️ for developers
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppBuilder;
