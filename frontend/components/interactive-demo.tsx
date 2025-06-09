"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Upload, GitBranch, Share, Code, FileText, ImageIcon, Play, ArrowRight } from "lucide-react"

export function InteractiveDemo() {
  const [activeDemo, setActiveDemo] = useState("chat")

  const demos = [
    {
      id: "chat",
      title: "Multi-Model Chat",
      description: "Switch between AI models seamlessly",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "upload",
      title: "File Analysis",
      description: "Upload and analyze any document",
      icon: Upload,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "branches",
      title: "Conversation Trees",
      description: "Explore different conversation paths",
      icon: GitBranch,
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "share",
      title: "Public Sharing",
      description: "Share conversations with secure links",
      icon: Share,
      color: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Play className="w-4 h-4 mr-2" />
            Interactive Demo
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Experience{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Gidvion
            </span>{" "}
            in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how Gidvion transforms AI conversations with intelligent features designed for professionals and power
            users.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
            {/* Demo Navigation */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl">
              {demos.map((demo) => (
                <TabsTrigger
                  key={demo.id}
                  value={demo.id}
                  className="flex flex-col items-center space-y-2 p-4 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${demo.color} p-2 text-white`}>
                    <demo.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{demo.title}</div>
                    <div className="text-xs text-muted-foreground hidden md:block">{demo.description}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Demo Content */}
            <div className="relative">
              <TabsContent value="chat" className="mt-0">
                <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold">Multi-Model Intelligence</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            Switch between Gemini 2.5 Flash, Pro, Claude 3.5, and Ollama models in real-time. Each model
                            brings unique strengths to your conversations.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">Lightning-fast responses with Gemini Flash</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Deep reasoning with Gemini Pro</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium">Creative thinking with Claude 3.5</span>
                          </div>
                        </div>

                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          Try Multi-Model Chat
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Gemini 2.5 Flash</Badge>
                              <div className="text-xs text-muted-foreground">0.2s response</div>
                            </div>
                            <div className="bg-background/80 rounded-lg p-4 text-sm">
                              "Quantum computing uses quantum mechanics to process information exponentially faster..."
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                Switch to Claude
                              </Button>
                              <Button size="sm" variant="outline">
                                Compare Models
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="mt-0">
                <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold">Universal File Intelligence</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            Upload PDFs, images, documents, and code files. Gidvion understands context across all
                            formats and maintains conversation continuity.
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                            <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <div className="text-sm font-medium">PDFs</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <ImageIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-sm font-medium">Images</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                            <Code className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <div className="text-sm font-medium">Code</div>
                          </div>
                        </div>

                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                          Upload & Analyze
                          <Upload className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-6 h-6 text-green-500" />
                              <span className="font-medium">research_paper.pdf</span>
                              <Badge variant="secondary">Analyzed</Badge>
                            </div>
                            <div className="bg-background/80 rounded-lg p-4 text-sm">
                              "I've analyzed your research paper. The key findings suggest that quantum algorithms can
                              achieve..."
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                Ask Questions
                              </Button>
                              <Button size="sm" variant="outline">
                                Summarize
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branches" className="mt-0">
                <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold">Conversation Trees</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            Explore different conversation paths with our intuitive tree interface. Perfect for
                            iterative problem-solving and comparing AI responses.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <GitBranch className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium">Branch conversations at any point</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <GitBranch className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium">Compare different AI responses</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <GitBranch className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium">Navigate conversation history</span>
                          </div>
                        </div>

                        <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                          Explore Trees
                          <GitBranch className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl p-6 border">
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="inline-flex items-center space-x-2 bg-background/80 rounded-full px-4 py-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="text-sm font-medium">Main Thread</span>
                              </div>
                            </div>
                            <div className="flex justify-center space-x-4">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
                                  <span className="text-xs">Branch A</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Technical</div>
                              </div>
                              <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2">
                                  <span className="text-xs">Branch B</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Simple</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="share" className="mt-0">
                <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold">Secure Sharing</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            Share conversations via secure public links with customizable permissions and expiry dates.
                            Perfect for collaboration and presentations.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Share className="w-5 h-5 text-pink-500" />
                            <span className="text-sm font-medium">Generate secure public links</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Share className="w-5 h-5 text-pink-500" />
                            <span className="text-sm font-medium">Set custom permissions</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Share className="w-5 h-5 text-pink-500" />
                            <span className="text-sm font-medium">Control expiry dates</span>
                          </div>
                        </div>

                        <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                          Share Conversation
                          <Share className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl p-6 border">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Share Settings</span>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <div className="bg-background/80 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span>Public Link</span>
                                <Button size="sm" variant="outline">
                                  Copy
                                </Button>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Expires</span>
                                <span className="text-muted-foreground">7 days</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Views</span>
                                <span className="text-muted-foreground">24</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
