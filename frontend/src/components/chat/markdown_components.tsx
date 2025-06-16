"use client"

import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Terminal, Copy } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

export const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "")
    const language = match ? match[1] : ""

    if (!inline && match) {
      return (
        <div className="relative group my-4">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300 font-medium">{language}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(String(children))
                toast({ title: "Code copied to clipboard" })
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="!mt-0 !rounded-t-none border border-t-0 border-slate-700"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      )
    }

    return (
      <code
        className="bg-slate-800/60 text-purple-300 px-2 py-1 rounded text-sm font-mono border border-slate-700/50"
        {...props}
      >
        {children}
      </code>
    )
  },
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-white mb-4 mt-6 pb-2 border-b border-slate-700">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold text-white mb-3 mt-5 flex items-center gap-2">
      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => <h3 className="text-lg font-semibold text-slate-200 mb-2 mt-4">{children}</h3>,
  p: ({ children }: any) => <p className="text-slate-200 leading-relaxed mb-3 last:mb-0">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-2 mb-4 ml-4">{children}</ul>,
  ol: ({ children }: any) => <ol className="space-y-2 mb-4 ml-4 list-decimal">{children}</ol>,
  li: ({ children }: any) => (
    <li className="text-slate-200 flex items-start gap-2">
      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-purple-500 bg-slate-800/40 pl-4 py-2 my-4 italic text-slate-300">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse bg-slate-800/40 rounded-lg overflow-hidden">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-slate-700/50">{children}</thead>,
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-slate-600">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-sm text-slate-200 border-b border-slate-700/50">{children}</td>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-purple-300">{children}</em>,
  hr: () => <hr className="my-6 border-slate-700" />,
}
