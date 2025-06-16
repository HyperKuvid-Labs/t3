"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileText, X } from 'lucide-react'

interface FileAttachmentsProps {
  attachedFiles: File[]
  onRemoveFile: (index: number) => void
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({
  attachedFiles,
  onRemoveFile
}) => {
  return (
    <AnimatePresence>
      {attachedFiles.length > 0 && (
        <motion.div
          className="mb-4 flex flex-wrap gap-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {attachedFiles.map((file, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 bg-slate-800/60 px-4 py-3 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-sm text-white font-medium block">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <motion.button
                onClick={() => onRemoveFile(index)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FileAttachments
