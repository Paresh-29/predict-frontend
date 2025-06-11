import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// const BACKEND_URL = "http://localhost:8000";

export default function AgenticAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ stock_name: input }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.content,
          role: "assistant",
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I couldn't fetch the stock analysis at this moment.",
          role: "assistant",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error fetching stock prediction:", error);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: "An error occurred while fetching stock analysis.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.getElementById("chat-input")?.focus();
  }, []);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col w-full  max-w-7xl mx-auto p-4 space-y-4">
      {/* Message Area */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full p-4">
          <ScrollArea className="h-full pr-2">
            <div
              ref={scrollRef}
              className="flex flex-col overflow-y-auto max-h-full scroll-smooth"
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 mb-4 ${
                      message.role === "assistant"
                        ? "flex-row"
                        : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "assistant"
                          ? "bg-primary/10"
                          : "bg-secondary/10"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 rounded-lg p-4 ${
                        message.role === "assistant"
                          ? "bg-primary/10 text-black"
                          : "bg-secondary/10 text-secondary-foreground"
                      }`}
                    >
                      <div className="prose prose-sm sm:prose-base prose-neutral max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mb-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="flex-1 rounded-lg p-4 bg-primary/10">
                      Analyzing market data...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
        <Input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about stock predictions..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
