import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Send, Bot, User, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content:
          response.ok && data.content
            ? data.content
            : "Sorry, I couldn't fetch the stock analysis at this moment.",
        role: "assistant",
      };

      setMessages((prev) => [...prev, aiMessage]);
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
  }, [messages, isLoading]);

  return (
    <div className="h-screen flex flex-col w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* Chat Area */}
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
                    {/* Avatar */}
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

                    {/* Message */}
                    <div
                      className={`flex-1 rounded-lg p-4 relative group ${
                        message.role === "assistant"
                          ? "bg-primary/10 text-black dark:text-white"
                          : "bg-secondary/10 text-secondary-foreground"
                      }`}
                    >
                      {/* Bot name */}
                      {message.role === "assistant" && (
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">
                          StockBot
                        </div>
                      )}

                      {/* Markdown content */}
                      <div className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* Copy button for assistant messages */}
                      {message.role === "assistant" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            toast.success("Copied to clipboard!");
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Typing animation */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mb-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 rounded-lg px-4 py-2 bg-primary/10">
                      <div className="flex space-x-1 animate-pulse">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Input Field */}
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
