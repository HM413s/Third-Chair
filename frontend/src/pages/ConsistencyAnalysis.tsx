import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, XCircle, AlertCircle, Loader2, Bot, ChevronRight, Code2, FileCode, GitBranch, Terminal, Zap, Upload, AlertTriangle, FileWarning, FileCheck, Sparkles, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";

interface AnalysisPoint {
  id: string;
  category: string;
  description: string;
  status: 'success' | 'error' | 'warning';
  location?: {
    document: string;
    line: number;
  };
  details?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp?: string;
  agent?: string;
  confidence_score?: number;
  suggested_fix?: string;
  affected_documents?: string[];
}

interface AnalysisResult {
  documents_analyzed: number;
  total_issues: number;
  issues_by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  issues_by_category: {
    case_alignment: number;
    cross_references: number;
    defined_terms: number;
    structural: number;
    numbering: number;
  };
  detailed_issues: AnalysisPoint[];
  recommendations: string[];
  summary: string;
  consistency_score?: number;
  detailed_findings?: {
    get_all_documents_from_rag?: {
      documents: { document_id: string; content: string }[];
    };
    check_multi_document_consistency?: {
      inconsistencies_detected: number;
      consistency_issues: { issue_id: string; description: string }[];
    };
    enhanced_document_search?: {
      search_results: { query: string; locations: { document_id: string; page: number; line: number }[] }[];
    };
  };
}

const defaultAnalysisResult: AnalysisResult = {
  documents_analyzed: 0,
  total_issues: 0,
  issues_by_severity: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  },
  issues_by_category: {
    case_alignment: 0,
    cross_references: 0,
    defined_terms: 0,
    structural: 0,
    numbering: 0
  },
  detailed_issues: [],
  recommendations: [],
  summary: "",
  consistency_score: 100
};

const ConsistencyAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<AnalysisPoint | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState("Waiting for documents...");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<AnalysisPoint | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'info':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'case alignment':
        return <FileWarning className="w-5 h-5" />;
      case 'cross references':
        return <FileCheck className="w-5 h-5" />;
      case 'defined terms':
        return <FileText className="w-5 h-5" />;
      case 'structural':
        return <Code2 className="w-5 h-5" />;
      case 'numbering':
        return <FileCode className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one document");
      return;
    }

    if (uploadedFiles.length < 2) {
      setError("Multi-document analysis requires at least 2 documents for comparison");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setAnalysisResult(null);
    setAgentLogs([]);

    try {
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Start WebSocket connection for real-time agent logs
      const ws = new WebSocket('ws://localhost:8000/ws/agent-logs');
      
      ws.onmessage = (event) => {
        const log = JSON.parse(event.data);
        setAgentLogs(prev => [...prev, log.message]);
        setActiveAgent(log.agent || "Analyzing documents...");
        setProgress(log.progress || progress);
      };

      const response = await fetch('http://localhost:8000/analyze-consistency', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Process the report using the new processor
      const processedResponse = await fetch('http://localhost:8000/process-coherence-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_data: data
        }),
      });

      if (!processedResponse.ok) {
        throw new Error('Failed to process the coherence report');
      }

      const processedData = await processedResponse.json();
      
      if (!processedData.success) {
        throw new Error(processedData.error || 'Failed to process the coherence report');
      }

      setAnalysisResult({
        documents_analyzed: processedData.processed_report.documents_analyzed || 0,
        total_issues: processedData.processed_report.total_issues || 0,
        issues_by_severity: processedData.processed_report.issues_by_severity || {},
        issues_by_category: processedData.processed_report.issues_by_category || {},
        detailed_issues: processedData.processed_report.detailed_issues || [],
        recommendations: processedData.processed_report.recommendations || [],
        summary: processedData.processed_report.summary || "",
        consistency_score: processedData.processed_report.consistency_score || 100,
        detailed_findings: processedData.processed_report.detailed_findings || {}
      });

      ws.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  const filteredIssues = selectedCategory
    ? analysisResult?.detailed_issues.filter(issue => 
        issue.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : analysisResult?.detailed_issues;

  return (
    <div className="min-h-screen bg-black text-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Document Consistency Analysis</h1>
              <p className="text-gray-400 mt-1">Upload documents to analyze their consistency</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Terminal className="w-4 h-4 mr-2" />
              {activeAgent}
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              <GitBranch className="w-4 h-4 mr-2" />
              v1.0.0
            </Badge>
          </div>
        </motion.div>

        {/* Document Upload Section */}
        {!isAnalyzing && !analysisResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-white/10 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-primary/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              >
                <Upload className="w-12 h-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {isDragActive ? "Drop your documents here" : "Upload Documents"}
              </h3>
              <p className="text-gray-400 mb-4">
                Drag and drop your documents here, or click to select files
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Supported formats: PDF, DOC, DOCX, TXT</span>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Uploaded Documents</h3>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {uploadedFiles.length} Files
                  </Badge>
                </div>

                {uploadedFiles.map((file, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-white font-medium">{file.name}</span>
                        <p className="text-gray-400 text-sm">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startAnalysis}
                  className="w-full mt-6 bg-gradient-to-r from-primary to-purple-500 text-white py-4 px-6 rounded-lg hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Start Analysis
                </motion.button>

                {uploadedFiles.length < 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <p className="text-yellow-500">
                      Multi-document analysis requires at least 2 documents for comparison
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-500">{error}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="flex flex-col gap-6">
            {/* Left Side - Analysis Overview */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-6"
            >
              {/* Executive Summary Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Executive Summary</h2>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Analysis Complete
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Consistency Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">
                        {analysisResult.total_issues === 0 ? 'Excellent' : 
                         analysisResult.total_issues < 5 ? 'Good' : 
                         analysisResult.total_issues < 10 ? 'Fair' : 'Poor'}
                      </p>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Score: {analysisResult.consistency_score || 100}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Total Issues</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{analysisResult.total_issues}</p>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        {Object.values(analysisResult.issues_by_severity).reduce((a, b) => a + b, 0)} Severity Levels
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Documents Analyzed</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{analysisResult.documents_analyzed}</p>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        {analysisResult.detailed_findings?.get_all_documents_from_rag?.documents.length || 0} Total
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Primary Concerns</p>
                    <div className="space-y-2">
                      {analysisResult.total_issues === 0 ? (
                        <p className="text-green-500">No concerns detected</p>
                      ) : (
                        Object.entries(analysisResult.issues_by_severity)
                          .filter(([_, count]) => count > 0)
                          .map(([severity, count]) => (
                            <div key={severity} className="flex items-center justify-between">
                              <Badge variant="outline" className={getSeverityColor(severity)}>
                                {severity}
                              </Badge>
                              <span className="text-white">{count} issues</span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Categories</p>
                    <div className="space-y-2">
                      {Object.entries(analysisResult.issues_by_category)
                        .filter(([_, count]) => count > 0)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {category}
                            </Badge>
                            <span className="text-white">{count} issues</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Details Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Document Details</h2>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {analysisResult.detailed_findings?.get_all_documents_from_rag?.documents.length || 0} Documents
                  </Badge>
                </div>

                <div className="space-y-4">
                  {analysisResult.detailed_findings?.get_all_documents_from_rag?.documents.map((doc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-white">Document {doc.document_id}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                {doc.content.length} chars
                              </Badge>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                {doc.content.split(/\s+/).length} words
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3">
                            <p className="text-gray-300 text-sm line-clamp-3">{doc.content}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Consistency Analysis Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <FileCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Consistency Analysis</h2>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    {analysisResult.detailed_findings?.check_multi_document_consistency?.inconsistencies_detected || 0} Issues
                  </Badge>
                </div>

                <div className="space-y-4">
                  {analysisResult.detailed_findings?.check_multi_document_consistency?.consistency_issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                          <AlertTriangle className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-white">Issue {issue.issue_id}</h4>
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                              Inconsistency
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm">{issue.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Content Search Results Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Content Search Results</h2>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {analysisResult.detailed_findings?.enhanced_document_search?.search_results.length || 0} Queries
                  </Badge>
                </div>

                <div className="space-y-4">
                  {analysisResult.detailed_findings?.enhanced_document_search?.search_results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <Search className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-white">Query: {result.query}</h4>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              {result.locations.length} matches
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {result.locations.map((location, locIndex) => (
                              <div key={locIndex} className="p-3 bg-black/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-gray-300 text-sm">
                                    Document {location.document_id}
                                  </p>
                                  <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                                    Page {location.page}, Line {location.line}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Detailed Issues Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Detailed Issues</h2>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    {analysisResult.detailed_issues.length} Total
                  </Badge>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {analysisResult.detailed_issues.map((issue, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getSeverityColor(issue.severity || 'info')}`}>
                            {getCategoryIcon(issue.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-white">{issue.category}</h4>
                              <Badge variant="outline" className={getSeverityColor(issue.severity || 'info')}>
                                {issue.severity || 'info'}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-3">{issue.description}</p>
                            
                            {issue.location && (
                              <div className="mb-3 p-2 bg-black/20 rounded-lg">
                                <p className="text-gray-400 text-sm">
                                  Location: {issue.location.document} - Line {issue.location.line}
                                </p>
                              </div>
                            )}

                            {issue.suggested_fix && (
                              <div className="mb-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  <p className="text-green-500 font-medium">Suggested Fix</p>
                                </div>
                                <p className="text-green-500/90 text-sm">{issue.suggested_fix}</p>
                              </div>
                            )}

                            {issue.confidence_score && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-gray-400 text-sm">Confidence Score</p>
                                  <span className="text-gray-400 text-sm">
                                    {(issue.confidence_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={issue.confidence_score * 100} 
                                  className="h-2 bg-white/10"
                                />
                              </div>
                            )}

                            {issue.affected_documents && issue.affected_documents.length > 0 && (
                              <div>
                                <p className="text-gray-400 text-sm mb-2">Affected Documents</p>
                                <div className="flex flex-wrap gap-2">
                                  {issue.affected_documents.map((doc, i) => (
                                    <Badge 
                                      key={i} 
                                      variant="outline" 
                                      className="bg-gray-500/10 text-gray-400 border-gray-500/20"
                                    >
                                      {doc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>

            {/* Right Side - Recommendations & Agent Work */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Recommendations Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Recommendations</h2>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    {analysisResult.recommendations.length} Total
                  </Badge>
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3 pr-4">
                    {analysisResult.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <p className="text-gray-300 text-sm">{rec}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Agent Work Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Bot className="w-6 h-6 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Agent Work</h2>
                  </div>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    Real-time
                  </Badge>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {agentLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Bot className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-300 text-sm">{log}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </div>
        )}

        {/* Progress Bar */}
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Analysis Progress</span>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
            <div className="mt-4 flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <span className="text-sm text-gray-400">{activeAgent}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConsistencyAnalysis; 