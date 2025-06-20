# GIDEON

> An advanced LLM aggregator with emotional intelligence and creative features - Built for the T3 Chat Cloneathon

## 🏆 Hackathon Submission

This project was created for the **T3 Chat Cloneathon** - a hackathon focused on building innovative AI chat applications with open-source requirements and creative freedom.

**Hackathon Link**: https://cloneathon.t3.chat/

## 🚀 Overview

Gideon is a comprehensive AI chat platform that combines multiple language models with unique features like emotion tokens, AI-powered image generation, and an intelligent project builder. It offers both cloud-based and local inference options for optimal performance and privacy.

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **GSAP** - High-performance animations

### Backend
- **Python FastAPI** - Modern, fast web framework for building APIs

## 🤖 AI Models

### Online Models
- **Gemini 2.5 Flash** - Fast responses with Google's latest model
- **Gemini 2.5 Pro** - Advanced reasoning capabilities
- **Claude 4.0 Sonnet** - Anthropic's powerful language model
- **DeepSeek V3** - Cutting-edge reasoning model

### Local Models (Ollama)
- **Gemma 3** - Google's efficient local model
- **Llama 3.3:70B** - Meta's large parameter model
- **DeepSeek R1** - Local reasoning model
- **Phi 4:14B** - Microsoft's compact yet powerful model

*Local models are optimized for faster inference while maintaining performance comparable to online models.*

## ✨ Core Features

### 1. 🎭 Emotion Tokens
Transform your conversations with emotional context! Choose from 18 different emotion tokens across 6 categories:

#### Categories Available:
- **Positive Vibes** 😊 - Joyful, Enthusiastic, Supportive, Inspiring
- **Professional** 👔 - Neutral, Analytical, Authoritative  
- **High Energy** ⚡ - Energetic, Bold, Adventurous
- **Creative Flow** 🎨 - Creative, Whimsical, Artistic
- **Playful & Fun** 😎 - Casual, Humorous, Quirky
- **Balanced** 😌 - Calm, Contemplative

Each emotion token influences the AI's response tone and style, making conversations more engaging and contextually appropriate.

### 2. 📎 File Attachments
- **PDF Support** - Upload and analyze PDF documents
- **More formats coming soon!** - Expanding file type support

### 3. 🔍 Web Search Integration
Real-time web search capabilities to enhance AI responses with current information.

## 🎨 Image Generation Studio

Transform your imagination into stunning visuals with AI-powered image generation!

### Features:
- **Hyper-Realistic Generation** - Create photorealistic images with advanced AI models
- **Style Suggestions** - Choose from 20+ predefined styles including:
  - Photorealistic portrait, Digital art, Oil painting, Watercolor
  - Cyberpunk aesthetic, Minimalist design, Vintage photography
  - Abstract expressionism, Anime style, Concept art
  - Surreal landscape, Street photography, Macro photography
  - Architectural visualization, Fantasy illustration, Retro futurism
  - Hyperrealistic, Impressionist, Pop art, Noir style
  - Steampunk, Art nouveau, Bauhaus design
- **Session-Based Storage** - Generated images persist only during your current session
- **Instant Download** - Download your creations in high quality
- **Navigation Reset** - Images clear when switching to other sections (Chat/Project Builder)

*Perfect for creative projects, concept visualization, and artistic exploration!*

## 🔧 Project Builder

An intelligent code generation tool that creates complete project scaffolds based on your requirements. Our architecture is inspired by Google DeepMind's recent "AlphaEvolve" paper, leveraging evolutionary algorithms and advanced AI reasoning to generate optimized code structures.

### Supported Tech Stacks:

| Stack | Technologies | Difficulty | Est. Time |
|-------|-------------|------------|-----------|
| **MERN Stack** | MongoDB, Express.js, React, Node.js, JWT Auth | Intermediate | 35-45 mins |
| **Next.js + Prisma** | Next.js 14, Prisma, PostgreSQL, TypeScript, Tailwind CSS | Intermediate | 30-40 mins |
| **Django + React** | Django, Python, React, PostgreSQL, DRF | Advanced | 40-50 mins |
| **T3 Stack** | Next.js, TypeScript, tRPC, Prisma, Tailwind CSS | Advanced | 50-70 mins |
| **Vue + Nuxt** | Vue 3, Nuxt 3, TypeScript, Pinia, TailwindCSS | Intermediate | 30-40 mins |
| **SvelteKit** | Svelte, SvelteKit, TypeScript, Vite, TailwindCSS | Intermediate | 25-35 mins |
| **Go + Gin** | Go, Gin Framework, PostgreSQL, Redis, Docker | Intermediate | 35-45 mins |
| **Flutter + Firebase** | Flutter, Firebase, Cloud Firestore, FCM, Firebase Auth | Intermediate | 40-60 mins |
| **Solana dApp** | Rust, Anchor Framework, Solana, Web3.js, Phantom Wallet | Expert | 60-90 mins |

### Available Features:
Choose from 30+ modern features including:
- Authentication & Authorization
- Database Integration
- API Development
- Microservices Architecture
- Real-time Features
- GraphQL Integration
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Smart Contract Integration
- Wallet Connection
- Cryptocurrency Payments
- NFT Marketplace Features
- Caching Strategies
- Load Balancing
- CDN Integration
- WebAssembly (WASM) Support
- Type Safety (TypeScript)
- Code Generation
- Hot Module Replacement
- Developer Tools Integration
- File Upload/Download
- Email Integration
- Payment Processing
- Admin Dashboard
- Progressive Web App (PWA)
and more....

### 📧 Delivery Method
- **Generation Time**: ~40 minutes (currently in beta, will be improving soon..)
- **Delivery**: Sent to your email as `file.zip.potato`
- **Security Bypass**: Rename to `.zip` after download to extract

*The `.potato` extension bypasses email security filters - simply rename the file to `.zip` for extraction.*

## 🎯 Hackathon Requirements Met

✅ **Open Source**: MIT License with full GitHub availability  
✅ **Web Application**: Easy testing and deployment  
✅ **Creative Features**: Unique emotion tokens and AI image generation  
✅ **Multiple LLM Support**: Both online and local model integration  
✅ **File Upload Support**: PDF processing capabilities  

## 🚀 Getting Started

```
# Clone the repository
git clone https://github.com/Mantissagithub/gideon
git checkout 75a3c5987debe30b5ed8386fe14130e8997577db

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt && prisma generate

# Set up environment variables
cp .env.example .env

# Start the development servers
npm run dev  # Frontend
uvicorn main:app --reload  # Backend
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for the T3 Chat Cloneathon**

*Gideon - Where AI meets emotion, creativity, and visual imagination.*
