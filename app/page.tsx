"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { FileUp, BookOpen, Brain, Sparkles } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8001/process-pdf", {
        method: "POST",
        body: formData,
      })
      console.log(response.status)
      if (response.ok) {
        router.push(`/chat?filename=${file.name}`)
      } else {
        console.error("Failed to upload file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
            <Sparkles className="h-16 w-16 text-purple-500 mb-4" />
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-6"
          >
            Padhai Whallah
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-12"
          >
            Your AI-powered study companion. Upload your study materials and chat with our AI to prepare for your exams.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <FeatureCard
              icon={<FileUp className="h-8 w-8 text-purple-500" />}
              title="Upload PDFs"
              description="Upload your study materials, notes, or textbooks in PDF format."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-purple-500" />}
              title="Smart Analysis"
              description="Our AI analyzes your documents to understand the content."
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-purple-500" />}
              title="Interactive Learning"
              description="Chat with our AI to ask questions and test your knowledge."
            />
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Study Material</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-700 hover:border-purple-500 bg-gray-800 hover:bg-gray-800/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                    </div>
                    <Input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {file && <div className="text-sm text-gray-300 text-center">Selected file: {file.name}</div>}

                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? "Uploading..." : "Start Learning"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

