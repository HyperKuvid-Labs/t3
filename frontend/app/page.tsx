import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { InteractiveDemo } from "@/components/interactive-demo"
import { Screenshots } from "@/components/screenshots"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"
import { ScrollAnimations } from "@/components/scroll-animations"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollAnimations />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <InteractiveDemo />
        <Screenshots />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
