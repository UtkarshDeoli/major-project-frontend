"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowLeft, FileText, Loader } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const filename = searchParams.get("filename");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add an empty assistant message for real-time updates
    let assistantMessage = { role: "assistant", content: "" };
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    try {
      const response = await fetch("http://localhost:8001/ask-question/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Handle cases where the JSON chunk may be incomplete
        let lastNewline = buffer.lastIndexOf("\n");
        if (lastNewline !== -1) {
          let validJSON = buffer.substring(0, lastNewline);
          buffer = buffer.substring(lastNewline + 1);

          validJSON.split("\n").forEach((line) => {
            if (line.trim()) {
              try {
                const parsedChunk = JSON.parse(line);
                const chunkText = parsedChunk.response || "";

                assistantMessage.content += chunkText;

                setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[updatedMessages.length - 1] = { ...assistantMessage };
                  return updatedMessages;
                });
              } catch (err) {
                console.error("Error parsing JSON chunk:", err);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Padhai Whallah Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-400">{filename ? filename : "Notes.pdf"}</span>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <Bot className="h-16 w-16 mx-auto text-purple-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Start Chatting with Your Study Assistant</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Ask questions about your uploaded study material, request explanations, or test your knowledge.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`p-4 ${
                        message.role === "user"
                          ? "bg-gray-800 border-gray-700 self-end"
                          : "bg-gray-900 border-gray-800 self-start"
                      }`}
                    >
                      <div className="flex gap-3">
                        <Avatar
                          className={`h-8 w-8 flex justify-center items-center ${
                            message.role === "user" ? "bg-purple-700" : "bg-emerald-700"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-5 w-5 self-center justify-center" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium mb-1">
                            {message.role === "user" ? "You" : "Study Assistant"}
                          </div>
                          <div className="text-gray-300 whitespace-pre-wrap">
                            {message.content}
                            {isLoading && index === messages.length - 1 && message.role === "assistant" && (
                              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse ml-1"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your study material..."
              className="flex-1 bg-gray-800 border-gray-700 focus-visible:ring-purple-500"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
