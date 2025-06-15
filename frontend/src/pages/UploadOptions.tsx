import { motion } from "framer-motion";
import { Scale, Zap, MessageSquare, ArrowRight, FileText, Users, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const UploadOptions = () => {
  const [showChatUpload, setShowChatUpload] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleChatFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatFiles(Array.from(event.target.files || []));
  };

  const handleChatUpload = async () => {
    if (chatFiles.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    chatFiles.forEach((file) => formData.append("files", file));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated. Please login first.");
      }

      const response = await fetch("http://localhost:8000/upload-multiple", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      // On success, redirect to chat page
      navigate("/chat");
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAgentSelection = (agentType: string) => {
    setShowAgentSelection(false);
    if (agentType === "consistency") {
      navigate("/consistency-analysis");
    } else if (agentType === "firm-standard") {
      navigate("/firm-standard-analysis");
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90" />

      {/* Navigation */}
      <header className="relative z-10 p-6">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
          <Scale className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">Third Chair</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Choose Your</span>
            <br />
            <span className="text-gradient">Document Solution</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Select how you'd like to work with your documents. Our AI agents can instantly fix issues or you can have an intelligent conversation about your content.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Agent Fix Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group"
          >
            <Card className="glass border-white/10 h-full hover:border-primary/30 transition-all duration-300 group-hover:scale-105">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="AI Agent analyzing legal documents"
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-white text-xl">Agent Fix</CardTitle>
                </div>
                <p className="text-gray-300">
                  Instantly detect and fix document inconsistencies, formatting issues, and inefficiencies with one powerful click using specialized AI agents.
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Automatic inconsistency detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Specialized legal AI agents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>One-click fixes</span>
                  </div>
                </div>
                
                <Button className="w-full button-gradient" onClick={() => setShowAgentSelection(true)}>
                  Start Agent Fix
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat with Document Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group"
          >
            <Card className="glass border-white/10 h-full hover:border-primary/30 transition-all duration-300 group-hover:scale-105">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src="https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional discussing legal documents"
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-white text-xl">Chat with Document</CardTitle>
                </div>
                <p className="text-gray-300">
                  Have an intelligent conversation with your documents. Ask questions, get insights, and explore your content with AI-powered assistance.
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span>Interactive document analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Content exploration & insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-primary" />
                    <span>AI-powered assistance</span>
                  </div>
                </div>
                
                <Button className="w-full button-gradient" onClick={() => setShowChatUpload(true)}>
                  Start Conversation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back to Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/#upload-section">
            <Button variant="outline" className="glass-hover border-white/20 text-white">
              Back to Upload
            </Button>
          </Link>
        </motion.div>
      </div>

      {showChatUpload && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative max-w-2xl w-full mx-4"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 opacity-10 rounded-2xl"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90 rounded-2xl" />

            {/* Modal Content */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Upload Documents for Chat
                </h2>
                <p className="text-gray-300">
                  Select your documents to start an intelligent conversation with AI
                </p>
              </div>

              <div className="space-y-6">
                {/* File Upload Area */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/30 transition-colors duration-300">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/20">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-white text-lg font-medium">
                          Drop your files here or click to browse
                        </p>
                        <p className="text-gray-400 text-sm">
                          Supports PDF, DOC, DOCX files
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={handleChatFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Selected Files List */}
                {chatFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h3 className="text-white font-medium">Selected Files:</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {chatFiles.map((file, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-gray-300 text-sm flex-1 truncate">
                            {file.name}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    className="button-gradient flex-1 max-w-[200px]"
                    onClick={handleChatUpload}
                    disabled={chatFiles.length === 0 || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        Start Chat
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowChatUpload(false)}
                    className="glass-hover border-white/20 text-white hover:bg-white/10 flex-1 max-w-[200px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showAgentSelection && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative max-w-5xl w-full mx-4"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 opacity-10 rounded-2xl"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90 rounded-2xl" />

            {/* Modal Content */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Select Analysis Agent
                </h2>
                <p className="text-gray-300">
                  Choose an AI agent to analyze your documents with advanced capabilities
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Advanced Multi-Document Consistency Agent */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="glass border-white/10 hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Document consistency analysis"
                        className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-white text-xl">Advanced Multi-Document Consistency Agent</CardTitle>
                      </div>
                      <p className="text-gray-300">
                        Performs comprehensive contract consistency analysis with detailed source location tracking for all inconsistencies found.
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Track exact file names and line numbers</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Analyze complex legal terminology</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>Identify broken cross-references</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full button-gradient"
                        onClick={() => handleAgentSelection('consistency')}
                      >
                        Start Consistency Analysis
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Firm Standard Language & Style Compliance Agent */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="glass border-white/10 hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Style compliance analysis"
                        className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-white text-xl">Firm Standard Language & Style Compliance Agent</CardTitle>
                      </div>
                      <p className="text-gray-300">
                        Performs comprehensive language formatting and style analysis with detailed location tracking for all inconsistencies found.
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Analyze punctuation consistency</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Check capitalization patterns</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>Review sentence structure</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full button-gradient"
                        onClick={() => handleAgentSelection('firm-standard')}
                      >
                        Start Style Analysis
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAgentSelection(false)}
                  className="glass-hover border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadOptions;
