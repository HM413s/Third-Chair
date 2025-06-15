import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWithDocument = () => {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", text: input }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated. Please login first.");
      }

      const params = new URLSearchParams({ query: input.trim() });
      const url = `http://localhost:8000/chat?${params.toString()}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        
        if (response.status === 422 && Array.isArray(errorData.detail)) {
          const errorMessage = errorData.detail.map((err: any) => err.msg).join(", ");
          throw new Error(errorMessage);
        }
        
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.response) {
        throw new Error("Invalid response format from server");
      }

      setMessages((msgs) => [...msgs, { role: "bot", text: data.response }]);
    } catch (err) {
      console.error("Error in sendMessage:", err);
      setMessages((msgs) => [...msgs, { 
        role: "bot", 
        text: `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}` 
      }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
      <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 shadow-xl max-w-4xl mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Chat with Your Documents
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </div>
          </div>
          
          <ScrollArea className="h-[60vh] rounded-lg border border-gray-800 bg-black/30 p-4 mb-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {msg.role === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                            : msg.text.startsWith("Error:")
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                            : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100"
                        } shadow-lg`}
                      >
                        {msg.role === "bot" ? (
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                                code: ({node, ...props}) => <code className="bg-gray-800 rounded px-1" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-gray-800 rounded p-2 mb-2 overflow-x-auto" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic" {...props} />,
                                table: ({node, ...props}) => <table className="border-collapse border border-gray-600 mb-2" {...props} />,
                                th: ({node, ...props}) => <th className="border border-gray-600 p-2" {...props} />,
                                td: ({node, ...props}) => <td className="border border-gray-600 p-2" {...props} />,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl px-4 py-2">
                      <div className="flex space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWithDocument; 