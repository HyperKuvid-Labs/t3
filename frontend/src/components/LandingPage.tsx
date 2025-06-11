import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Zap, Shield, Globe, MessageSquare, Code, Users, Star, Play, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: 'Advanced AI Chat',
      description: 'Multi-model conversations with context awareness',
      color: 'from-neon-blue to-cyan-500'
    },
    {
      icon: Users,
      title: 'AI Room Collaboration',
      description: 'Team spaces for shared AI interactions',
      color: 'from-neon-purple to-pink-500'
    },
    {
      icon: Code,
      title: 'Project Builder',
      description: 'AI-powered development workflow automation',
      color: 'from-neon-green to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Lightning-fast response times',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Conversations' },
    { value: '50K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,191,255,0.4) 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full opacity-10 blur-xl`}
            style={{
              background: `radial-gradient(circle, ${['#00BFFF', '#C084FC', '#00FFA3'][i % 3]} 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 12)}%`,
            }}
          />
        ))}
      </div>

      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      {/* Dynamic gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '10%' }}
      />
      
      <motion.div
        className="absolute w-80 h-80 bg-gradient-to-r from-neon-green/20 to-cyan-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '10%', right: '10%' }}
      />

      {/* Cursor follower */}
      <motion.div
        className="fixed w-6 h-6 bg-neon-blue/30 rounded-full blur-sm pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-full mb-8"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="w-5 h-5 text-neon-blue" />
            <span className="text-sm font-medium text-neon-blue">Next Generation AI Platform</span>
            <Badge variant="outline" className="border-neon-purple/30 text-neon-purple">
              Beta
            </Badge>
          </motion.div>

          <motion.h1
            className="text-7xl font-bold mb-8 bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to{' '}
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Gidvion
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Experience the future of AI interaction with our revolutionary platform that combines 
            multiple AI models, collaborative workspaces, and intelligent project building capabilities.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-neon-blue to-cyan-500 hover:from-cyan-500 hover:to-neon-blue text-white font-medium px-8 py-4 rounded-xl text-lg group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Start Building
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-neon-purple/30 hover:border-neon-purple text-white hover:bg-neon-purple/10 font-medium px-8 py-4 rounded-xl text-lg group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-neon-blue/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className="text-3xl font-bold text-neon-blue mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + index * 0.1, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              Powerful Features
            </motion.h2>
            <motion.p
              className="text-xl text-slate-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              Everything you need to harness the full potential of AI technology
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={feature.title}
                  className={`relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-500 cursor-pointer group ${
                    isActive 
                      ? 'bg-slate-800/50 border-neon-blue/50 shadow-2xl shadow-neon-blue/10' 
                      : 'bg-slate-800/20 border-slate-700/30 hover:border-slate-600/50'
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-purple/5 rounded-2xl"
                      layoutId="activeFeature"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <motion.div
                    className={`relative w-16 h-16 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color}`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed relative z-10">
                    {feature.description}
                  </p>
                  
                  <motion.div
                    className="mt-6 flex items-center text-neon-blue font-medium group-hover:text-cyan-400 transition-colors relative z-10"
                    whileHover={{ x: 5 }}
                  >
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center py-20 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 rounded-3xl border border-neon-blue/10"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(0, 191, 255, 0.1)',
                '0 0 30px 10px rgba(0, 191, 255, 0.1)',
                '0 0 0 0 rgba(0, 191, 255, 0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative z-10">
            <motion.h2
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
            >
              Ready to Transform Your Workflow?
            </motion.h2>
            <motion.p
              className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 }}
            >
              Join thousands of developers and creators who are already building the future with Gidvion.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-neon-blue to-cyan-500 hover:from-cyan-500 hover:to-neon-blue text-white font-medium px-12 py-4 rounded-xl text-lg group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, rotate: 45 }}
                  whileHover={{ scale: 1.5, rotate: 45 }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now
                  <Star className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
