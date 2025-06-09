"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Zap,
  Upload,
  History,
  GitBranch,
  Code,
  Share,
  Users,
  Sparkles,
  FileText,
  ImageIcon,
  Database,
} from "lucide-react"

export function Features() {
  const features = [
    {
      icon: MessageSquare,
      title: "Multi-Model Toggle",
      description: "Seamlessly switch between Gemini 2.5 Flash, Pro, Claude 3.5, and Ollama models in real-time.",
      badge: "Core",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast Responses",
      description: "Optimized streaming architecture delivers responses in milliseconds, not seconds.",
      badge: "Performance",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Upload,
      title: "Universal File Support",
      description: "Upload PDFs, images, documents, and code files. AI understands context across all formats.",
      badge: "Smart",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: History,
      title: "Conversation History",
      description: "Never lose a conversation. Organized sidebar with search, tags, and smart categorization.",
      badge: "Organized",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: GitBranch,
      title: "Conversation Trees",
      description: "Branch conversations to explore different paths. Perfect for iterative problem-solving.",
      badge: "Advanced",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Code,
      title: "Smart Code Highlighting",
      description: "Automatic syntax highlighting for 100+ languages with copy, run, and export features.",
      badge: "Developer",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Share,
      title: "Public Sharing",
      description: "Share conversations via secure public links with customizable permissions and expiry.",
      badge: "Social",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Developer Friendly",
      description: "API access, webhooks, custom integrations, and extensive documentation for developers.",
      badge: "API",
      gradient: "from-red-500 to-pink-500",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI conversations
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for power users, developers, and teams who demand the best AI experience. No compromises, no
            limitations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-background/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Document Intelligence</h3>
            <p className="text-muted-foreground">
              AI understands context from uploaded documents, maintaining conversation continuity across file types.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Vision Capabilities</h3>
            <p className="text-muted-foreground">
              Upload images, screenshots, diagrams, and charts. AI provides detailed analysis and insights.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Memory & Context</h3>
            <p className="text-muted-foreground">
              Advanced memory system remembers preferences, context, and conversation patterns for personalized
              responses.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
