"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "AI Researcher",
      company: "Stanford University",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "T3 Chat Clone has revolutionized how I interact with different AI models. The ability to switch between models mid-conversation while maintaining context is game-changing for my research.",
      rating: 5,
      highlight: "Game-changing for research",
    },
    {
      name: "Marcus Rodriguez",
      role: "Senior Developer",
      company: "TechCorp",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "The conversation tree feature is brilliant for exploring different solution paths. As a developer, I love how it handles code syntax highlighting and the API integration possibilities.",
      rating: 5,
      highlight: "Brilliant conversation trees",
    },
    {
      name: "Emily Watson",
      role: "Product Manager",
      company: "InnovateLab",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "Finally, an AI chat platform that understands workflow. The file upload capabilities and conversation sharing have streamlined our team collaboration significantly.",
      rating: 5,
      highlight: "Streamlined collaboration",
    },
    {
      name: "David Kim",
      role: "Data Scientist",
      company: "Analytics Pro",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "The multi-model approach gives me the flexibility to choose the right AI for each task. Gemini for speed, Claude for reasoning, and the seamless switching is perfect.",
      rating: 5,
      highlight: "Perfect flexibility",
    },
    {
      name: "Lisa Thompson",
      role: "Content Creator",
      company: "Creative Studios",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "I use T3 Chat Clone daily for content ideation and editing. The conversation history and search functionality help me revisit and build upon previous creative sessions.",
      rating: 5,
      highlight: "Daily creative companion",
    },
    {
      name: "Alex Johnson",
      role: "Startup Founder",
      company: "NextGen AI",
      avatar: "/placeholder.svg?height=60&width=60",
      content:
        "The public sharing feature has been invaluable for client presentations. Being able to share AI conversations with stakeholders has improved our communication dramatically.",
      rating: 5,
      highlight: "Invaluable for presentations",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-3 h-3 mr-1" />
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              professionals worldwide
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what researchers, developers, and creators are saying about their experience with T3 Chat Clone.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-background/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Quote Icon */}
                  <div className="flex justify-between items-start">
                    <Quote className="w-8 h-8 text-blue-600/20 group-hover:text-blue-600/40 transition-colors" />
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <blockquote className="text-muted-foreground leading-relaxed">"{testimonial.content}"</blockquote>

                  {/* Highlight */}
                  <Badge variant="outline" className="text-xs">
                    {testimonial.highlight}
                  </Badge>

                  {/* Author */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              10K+
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              1M+
            </div>
            <div className="text-sm text-muted-foreground">Conversations</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              4.9★
            </div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}
