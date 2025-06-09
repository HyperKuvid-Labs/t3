"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Github, Menu, X, Sparkles, ExternalLink } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Gidvion
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/30" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/30" asChild>
              <a href="#demo">Demo</a>
            </Button>
            <Button variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/30" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/30" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button variant="ghost" className="hover:bg-violet-50 dark:hover:bg-violet-950/30" asChild>
              <a href="#docs">Docs</a>
            </Button>
            <div className="w-px h-6 bg-border mx-2"></div>
            <ThemeToggle />
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2" />
              Try Gidvion
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-violet-50 dark:hover:bg-violet-950/30"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/98 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-violet-50 dark:hover:bg-violet-950/30"
                asChild
              >
                <a href="#features">Features</a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-violet-50 dark:hover:bg-violet-950/30"
                asChild
              >
                <a href="#demo">Demo</a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-violet-50 dark:hover:bg-violet-950/30"
                asChild
              >
                <a href="#pricing">Pricing</a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-violet-50 dark:hover:bg-violet-950/30"
                asChild
              >
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-violet-50 dark:hover:bg-violet-950/30"
                asChild
              >
                <a href="#docs">Docs</a>
              </Button>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 mt-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Gidvion
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
