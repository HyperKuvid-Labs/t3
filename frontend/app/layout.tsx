import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gidvion - Chat with Any AI, No Boundaries",
  description:
    "The most advanced multi-LLM chat platform for professionals, researchers, and developers. Experience AI conversations with Gemini, Claude, and more.",
  keywords: [
    "AI chat",
    "multi-LLM",
    "Gemini",
    "Claude",
    "conversation",
    "artificial intelligence",
    "Gidvion",
    "AI platform",
    "conversation trees",
    "file analysis",
  ],
  authors: [{ name: "Gidvion Team" }],
  creator: "Gidvion",
  publisher: "Gidvion",
  openGraph: {
    title: "Gidvion - Chat with Any AI, No Boundaries",
    description:
      "Experience the pinnacle of AI conversation technology with seamless access to multiple language models.",
    type: "website",
    url: "https://gidvion.com",
    siteName: "Gidvion",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gidvion - Advanced AI Chat Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gidvion - Chat with Any AI, No Boundaries",
    description:
      "Experience the pinnacle of AI conversation technology with seamless access to multiple language models.",
    images: ["/og-image.png"],
    creator: "@gidvion",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
