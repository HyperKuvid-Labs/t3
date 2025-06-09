"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Check, Sparkles, Zap, Crown, Building } from "lucide-react"

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals getting started with AI",
      icon: Sparkles,
      price: { monthly: 0, annual: 0 },
      badge: "Free",
      badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      features: [
        "1,000 messages per month",
        "Access to Gemini 2.5 Flash",
        "Basic conversation history",
        "Community support",
        "Standard response speed",
      ],
      cta: "Get Started Free",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Professional",
      description: "For professionals and power users",
      icon: Zap,
      price: { monthly: 20, annual: 16 },
      badge: "Most Popular",
      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
      features: [
        "Unlimited messages",
        "All AI models (Gemini, Claude, Ollama)",
        "Advanced conversation trees",
        "File upload & analysis",
        "Priority support",
        "Public sharing",
        "API access",
        "Advanced search",
      ],
      cta: "Start Professional",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Team",
      description: "For teams and collaborative workflows",
      icon: Crown,
      price: { monthly: 50, annual: 40 },
      badge: "Team",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Shared conversation spaces",
        "Admin dashboard",
        "Usage analytics",
        "Custom integrations",
        "SSO authentication",
        "Priority phone support",
      ],
      cta: "Start Team Trial",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom needs",
      icon: Building,
      price: { monthly: "Custom", annual: "Custom" },
      badge: "Enterprise",
      badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      features: [
        "Everything in Team",
        "Custom AI model training",
        "On-premise deployment",
        "Advanced security controls",
        "Custom SLA",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 premium support",
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Choose your{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Gidvion
            </span>{" "}
            plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. All plans include our core AI conversation features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-background/50 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                plan.popular ? "ring-2 ring-violet-500/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 p-4 shadow-lg shadow-violet-500/25">
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {typeof plan.price.annual === "number" ? (
                      <>
                        ${isAnnual ? plan.price.annual : plan.price.monthly}
                        <span className="text-lg text-muted-foreground font-normal">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl">{plan.price.annual}</span>
                    )}
                  </div>
                  {typeof plan.price.annual === "number" && plan.price.annual > 0 && isAnnual && (
                    <div className="text-sm text-muted-foreground">
                      Billed annually (${plan.price.annual * 12}/year)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${
                    plan.ctaVariant === "default"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
                      : "hover:bg-violet-50 dark:hover:bg-violet-950/30"
                  }`}
                  variant={plan.ctaVariant}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Have questions about our pricing?</p>
          <Button variant="outline" asChild>
            <a href="#faq">View FAQ</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
