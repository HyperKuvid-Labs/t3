"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet } from "lucide-react"

export function Screenshots() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const screenshots = [
    {
      title: "Multi-Model Chat Interface",
      description: "Switch between AI models seamlessly while maintaining conversation context.",
      image: "/placeholder.svg?height=600&width=800",
      features: ["Model Toggle", "Real-time Streaming", "Syntax Highlighting"],
    },
    {
      title: "Conversation Tree View",
      description: "Visualize and navigate conversation branches with our intuitive tree interface.",
      image: "/placeholder.svg?height=600&width=800",
      features: ["Branch Navigation", "Version Control", "Path Comparison"],
    },
    {
      title: "File Upload & Analysis",
      description: "Upload documents, images, and code files for AI-powered analysis and discussion.",
      image: "/placeholder.svg?height=600&width=800",
      features: ["Multi-format Support", "Context Awareness", "Smart Extraction"],
    },
    {
      title: "Conversation History",
      description: "Organized sidebar with search, filtering, and smart categorization of all conversations.",
      image: "/placeholder.svg?height=600&width=800",
      features: ["Smart Search", "Auto-categorization", "Quick Access"],
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  const getDeviceClass = () => {
    switch (viewMode) {
      case "mobile":
        return "max-w-sm mx-auto"
      case "tablet":
        return "max-w-2xl mx-auto"
      default:
        return "max-w-5xl mx-auto"
    }
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Screenshots
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            See T3 Chat Clone{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              in action
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience the interface that makes AI conversations feel natural, organized, and powerful.
          </p>

          {/* Device Toggle */}
          <div className="flex justify-center space-x-2 mb-8">
            <Button
              variant={viewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="flex items-center space-x-2"
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </Button>
            <Button
              variant={viewMode === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("tablet")}
              className="flex items-center space-x-2"
            >
              <Tablet className="w-4 h-4" />
              <span>Tablet</span>
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="flex items-center space-x-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </Button>
          </div>
        </div>

        {/* Screenshot Carousel */}
        <div className={`relative ${getDeviceClass()}`}>
          <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border shadow-2xl">
            {/* Browser Chrome */}
            <div className="bg-muted/50 p-3 border-b flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 bg-background/50 rounded px-3 py-1 text-sm text-muted-foreground">
                t3chat.app/{screenshots[currentSlide].title.toLowerCase().replace(/\s+/g, "-")}
              </div>
            </div>

            {/* Screenshot Content */}
            <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <img
                src={screenshots[currentSlide].image || "/placeholder.svg"}
                alt={screenshots[currentSlide].title}
                className="w-full h-full object-cover"
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{screenshots[currentSlide].title}</h3>
                  <p className="text-white/90 mb-4">{screenshots[currentSlide].description}</p>
                  <div className="flex flex-wrap gap-2">
                    {screenshots[currentSlide].features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {screenshots.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-blue-600 w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {screenshots.map((screenshot, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                index === currentSlide ? "ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/20" : "hover:bg-muted/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="p-4">
                <h4 className="font-semibold mb-2">{screenshot.title}</h4>
                <p className="text-sm text-muted-foreground">{screenshot.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
