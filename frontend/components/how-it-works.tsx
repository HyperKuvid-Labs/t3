"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, MousePointer, MessageCircle, Share2 } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: MousePointer,
      title: "Choose Your AI Model",
      description:
        "Select from Gemini 2.5 Flash, Pro, Claude 3.5, or Ollama based on your needs. Switch anytime during conversation.",
      features: ["4+ AI Models", "Real-time Switching", "Model Comparison"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      step: "02",
      icon: MessageCircle,
      title: "Start Conversing",
      description:
        "Chat naturally with AI, upload files, create conversation branches, and explore different discussion paths.",
      features: ["Natural Language", "File Uploads", "Conversation Trees"],
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "03",
      icon: Share2,
      title: "Export & Share",
      description:
        "Save conversations, generate public links, export to various formats, or integrate with your workflow via API.",
      features: ["Public Links", "Multiple Formats", "API Integration"],
      color: "from-green-500 to-teal-500",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Get started in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              three simple steps
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From model selection to sharing results, T3 Chat Clone makes AI conversations intuitive and powerful for
            everyone.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full bg-background/50 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Step Number */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity`}
                      >
                        {step.step}
                      </div>
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`}></div>
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-background border-2 border-blue-200 dark:border-blue-800 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to experience the future of AI chat?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl">
                Join thousands of users who have already discovered the power of multi-model AI conversations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
