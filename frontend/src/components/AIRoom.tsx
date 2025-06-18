import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, Download, Share2, Heart, Copy, 
  Palette, Wand2, Image as ImageIcon, Loader2,
  RefreshCw, Settings, Grid3X3, List, Eye,
  Zap, Stars, WandSparkles, Brush
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { generateImage } from '@/api/chatService';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
  liked: boolean;
}

const ImageStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSettings, setShowSettings] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement[]>([]);

  // Style suggestions (like music genres in Suno)
  const stylePrompts = [
    'photorealistic portrait', 'digital art', 'oil painting', 'watercolor',
    'cyberpunk aesthetic', 'minimalist design', 'vintage photography',
    'abstract expressionism', 'anime style', 'concept art', 'surreal landscape',
    'street photography', 'macro photography', 'architectural visualization',
    'fantasy illustration', 'retro futurism', 'hyperrealistic', 'impressionist',
    'pop art', 'noir style', 'steampunk', 'art nouveau', 'bauhaus design'
  ];

  // GSAP animations on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }

    // Floating elements animation
    floatingElementsRef.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          y: -20,
          duration: 2 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: index * 0.3
        });
      }
    });
  }, []);

  // Generate images handler
  const handleGenerateImages = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: "Please describe what you want to generate",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await generateImage(prompt);
      
      // Convert base64 images to GeneratedImage objects
      const newImages: GeneratedImage[] = response.images.map((imageData: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        prompt: prompt,
        imageUrl: imageData,
        timestamp: new Date(),
        liked: false
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
      
      // Animate new images in
      if (imagesRef.current) {
        gsap.fromTo(imagesRef.current.children, 
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out" }
        );
      }

      toast({
        title: "Images Generated!",
        description: `Created ${newImages.length} images successfully`,
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle like
  const toggleLike = (imageId: string) => {
    setGeneratedImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, liked: !img.liked } : img
      )
    );
  };

  // Download image
  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${prompt.slice(0, 20)}-${Date.now()}.png`;
    link.click();
  };

  // Copy prompt
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
  };

  // Add style to prompt
  const addStyleToPrompt = (style: string) => {
    setPrompt(prev => prev ? `${prev}, ${style}` : style);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden mt-10">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            ref={el => floatingElementsRef.current[i] = el!}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Image Generation Studio
            </h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Wand2 className="w-8 h-8 text-pink-400" />
            </motion.div>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Transform your imagination into stunning visuals with AI-powered image generation
          </p>
        </motion.div>

        {/* Generation Interface */}
        <motion.div 
          ref={promptRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="p-8">
              {/* Prompt Input */}
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your vision... (e.g., 'A majestic dragon soaring through clouds at sunset')"
                    className="w-full h-16 text-lg bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 pr-20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isGenerating) {
                        handleGenerateImages();
                      }
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-2"
                  >
                    <Button
                      onClick={handleGenerateImages}
                      disabled={isGenerating || !prompt.trim()}
                      className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {/* Style Suggestions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Palette className="w-4 h-4" />
                    <span className="text-sm font-medium">Style Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    <AnimatePresence>
                      {stylePrompts.map((style, index) => (
                        <motion.div
                          key={style}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-slate-600"
                            onClick={() => addStyleToPrompt(style)}
                          >
                            {style}
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* View Controls */}
        {generatedImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">
                Generated Images ({generatedImages.length})
              </h2>
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                <Stars className="w-3 h-3 mr-1" />
                AI Created
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Images Grid */}
        <div ref={imagesRef}>
          <AnimatePresence>
            {generatedImages.length > 0 ? (
              <motion.div 
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 max-w-2xl mx-auto'
                }`}
                layout
              >
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleLike(image.id)}
                              className={`p-2 rounded-full ${
                                image.liked 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${image.liked ? 'fill-current' : ''}`} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => downloadImage(image.imageUrl, image.prompt)}
                              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyPrompt(image.prompt)}
                              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedImage(image)}
                              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{image.timestamp.toLocaleTimeString()}</span>
                          <div className="flex items-center gap-1">
                            <WandSparkles className="w-3 h-3" />
                            <span>AI Generated</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : !isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    <ImageIcon className="w-16 h-16 text-slate-500 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">
                    No images generated yet
                  </h3>
                  <p className="text-slate-400">
                    Enter a prompt above and click generate to create your first AI image
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading Animation */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-slate-800 rounded-2xl p-8 text-center max-w-md mx-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Sparkles className="w-full h-full text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Creating Magic...
                </h3>
                <p className="text-slate-300 mb-4">
                  AI is generating 4 unique images for you
                </p>
                <div className="flex justify-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageStudio;
