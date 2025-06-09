"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react"

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    {
      question: "What AI models does Gidvion support?",
      answer:
        "Gidvion supports multiple state-of-the-art AI models including Gemini 2.5 Flash, Gemini 2.5 Pro, Claude 3.5, and Ollama. You can switch between models seamlessly during conversations to leverage each model's unique strengths.",
    },
    {
      question: "How does the conversation tree feature work?",
      answer:
        "Conversation trees allow you to branch your conversations at any point, exploring different discussion paths. This is perfect for comparing AI responses, iterating on ideas, or exploring multiple solutions to a problem. You can navigate between branches and compare responses side by side.",
    },
    {
      question: "What file types can I upload to Gidvion?",
      answer:
        "Gidvion supports a wide range of file formats including PDFs, images (PNG, JPG, WebP), documents (DOC, DOCX), text files, and code files. The AI can analyze, summarize, and answer questions about your uploaded content while maintaining conversation context.",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Yes, we take security seriously. Gidvion is SOC 2 compliant and GDPR ready. Your conversations are encrypted in transit and at rest. We never use your data to train AI models, and you maintain full control over your information with options to delete conversations at any time.",
    },
    {
      question: "Can I share conversations with my team?",
      answer:
        "Gidvion offers secure public sharing with customizable permissions and expiry dates. You can share individual conversations or entire conversation trees with team members, clients, or stakeholders via secure links.",
    },
    {
      question: "What's included in the free plan?",
      answer:
        "The free Starter plan includes 1,000 messages per month, access to Gemini 2.5 Flash, basic conversation history, and community support. It's perfect for individuals getting started with AI conversations.",
    },
    {
      question: "How does billing work for teams?",
      answer:
        "Team plans are billed per seat with volume discounts available for larger teams. You can add or remove team members at any time, and billing is prorated. Enterprise plans offer custom pricing based on your specific needs and usage requirements.",
    },
    {
      question: "Do you offer API access?",
      answer:
        "Yes! Professional and higher plans include API access, allowing you to integrate Gidvion's multi-model AI capabilities into your own applications. We provide comprehensive documentation and SDKs for popular programming languages.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer different levels of support based on your plan: community support for free users, priority email support for Professional users, priority phone support for Team users, and 24/7 premium support with a dedicated account manager for Enterprise customers.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. If you cancel, you'll continue to have access to your paid features until the end of your current billing period.",
    },
  ]

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Frequently asked{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about Gidvion. Can't find the answer you're looking for? Feel free to reach out
            to our support team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-background/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        openItems.includes(index) ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openItems.includes(index) && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-violet-600 to-purple-600 border-0 text-white inline-block">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-violet-100 mb-6 max-w-md">
                  Our support team is here to help. Get in touch and we'll get back to you as soon as possible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="bg-white text-violet-600 hover:bg-violet-50">
                    Contact Support
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Schedule a Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
