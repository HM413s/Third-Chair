import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, XCircle, AlertCircle, Loader2, Bot, ChevronRight, Code2, FileCode, GitBranch, Terminal, Zap, Upload, AlertTriangle, FileWarning, FileCheck, Sparkles, Search, Building2, Scale, Shield, Briefcase } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";

interface StandardPoint {
  id: string;
  category: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'warning';
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
  standard_reference?: string;
  compliance_requirement?: string;
}

interface Recommendation {
  description: string;
  details?: string;
}

interface Issue {
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  context?: string;
  location?: string;
  recommendation?: string;
  affected_documents?: string[];
  additional_details?: string;
}

interface ProcessedReport {
  compliance_score: number;
  compliance_level: string;
  total_issues: number;
  total_documents_analyzed: number;
  issue_breakdown: {
    punctuation: number;
    capitalization: number;
    sentence_structure: number;
    word_choice: number;
  };
  recommendations: (string | Recommendation)[];
  detailed_analysis: {
    punctuation_issues: Issue[];
    capitalization_issues: Issue[];
    structure_issues: Issue[];
    word_choice_issues: Issue[];
  };
  summary: string;
  metadata: {
    processed_at: string;
    total_documents: number;
    documents_with_issues: number;
  };
}

interface AnalysisResult {
  success: boolean;
  processed_report?: ProcessedReport;
  error?: string;
  original_report?: any;
  documents_analyzed?: number;
  total_issues?: number;
  issues_by_severity?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  issues_by_category?: {
    regulatory: number;
    compliance: number;
    legal: number;
    operational: number;
    risk: number;
  };
  detailed_issues?: StandardPoint[];
  recommendations?: string[];
  summary?: string;
  compliance_score?: number;
  execution_tracking?: {
    step1_complete: boolean;
    step2_complete: boolean;
    step3_complete: boolean;
    step4_complete: boolean;
    step5_complete: boolean;
    step6_complete: boolean;
    all_steps_complete: boolean;
  };
  analysis_timing?: {
    start_time: string;
    end_time: string;
  };
  document_stats?: {
    total_documents: number;
    documents_with_issues: number;
  };
  final_report?: {
    executive_summary: {
      compliance_score: number;
      compliance_level: string;
      total_issues_found: number;
      total_documents_analyzed: number;
      issue_breakdown: {
        punctuation: number;
        capitalization: number;
        sentence_structure: number;
        word_choice: number;
      };
    };
    recommendations: string[];
    detailed_analysis: {
      punctuation_issues: any[];
      capitalization_issues: any[];
      structure_issues: any[];
      word_choice_issues: any[];
    };
  };
}

const defaultAnalysisResult: AnalysisResult = {
  success: false,
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
    regulatory: 0,
    compliance: 0,
    legal: 0,
    operational: 0,
    risk: 0
  },
  detailed_issues: [],
  recommendations: [],
  summary: "",
  compliance_score: 100
};

const FirmStandardAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<StandardPoint | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState("Waiting for documents...");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<StandardPoint | null>(null);
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
      case 'regulatory':
        return <Scale className="w-5 h-5" />;
      case 'compliance':
        return <Shield className="w-5 h-5" />;
      case 'legal':
        return <Briefcase className="w-5 h-5" />;
      case 'operational':
        return <Building2 className="w-5 h-5" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <FileWarning className="w-5 h-5" />;
    }
  };

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one document");
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

      const response = await fetch('http://localhost:8000/analyze-firm-standards', {
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
      const processedResponse = await fetch('http://localhost:8000/process-style-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_data: data.result
        }),
      });


      console.log("Print Report",processedResponse)
      
      if (!processedResponse.ok) {
        throw new Error('Failed to process the style report');
      }

      const processedData = await processedResponse.json();
      
      if (!processedData.success) {
        throw new Error(processedData.error || 'Failed to process the style report');
      }

      setAnalysisResult(processedData);
      ws.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  const filteredIssues = selectedCategory && analysisResult?.processed_report?.detailed_analysis
    ? Object.entries(analysisResult.processed_report.detailed_analysis)
        .flatMap(([category, issues]) => 
          issues.map(issue => ({
            ...issue,
            category
          }))
        )
        .filter(issue => 
          selectedCategory === 'all' || 
          issue.category.toLowerCase() === selectedCategory.toLowerCase()
        )
    : [];

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
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Firm Standard Analysis</h1>
              <p className="text-gray-400 mt-1">Upload documents to analyze against firm standards</p>
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
        {analysisResult && analysisResult.processed_report && (
          <div className="flex flex-col gap-6">
            {/* Executive Summary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Executive Summary</h2>
                </div>
                <Badge variant="outline" className={`${
                  analysisResult.processed_report.compliance_score >= 90 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : analysisResult.processed_report.compliance_score >= 70
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {analysisResult.processed_report.compliance_level}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Compliance Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.processed_report.compliance_score}%
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Total Issues</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.processed_report.total_issues}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Documents Analyzed</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">
                      {analysisResult.processed_report.total_documents_analyzed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Issue Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Issue Breakdown</p>
                  <div className="space-y-2">
                    {analysisResult.processed_report.issue_breakdown && 
                      Object.entries(analysisResult.processed_report.issue_breakdown).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                          <span className="text-white">{count} issues</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Analysis Summary</p>
                  <p className="text-gray-300 text-sm">{analysisResult.processed_report.summary}</p>
                </div>
              </div>
            </motion.div>

            {/* Detailed Analysis Cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* Recommendations Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Recommendations</h2>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    {analysisResult.processed_report.recommendations?.length || 0} Total
                  </Badge>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {analysisResult.processed_report.recommendations?.map((rec, index) => (
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
                          <div className="flex-1">
                            <p className="text-gray-300 text-sm">{typeof rec === 'string' ? rec : rec?.description || ''}</p>
                            {typeof rec === 'object' && rec?.details && (
                              <div className="mt-2 p-2 bg-white/5 rounded-lg">
                                <p className="text-gray-400 text-sm">{rec.details}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>

              {/* Detailed Issues Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Detailed Issues</h2>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    {analysisResult.processed_report.total_issues} Total
                  </Badge>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {Object.entries(analysisResult.processed_report.detailed_analysis || {}).map(([category, issues]) => (
                      issues && issues.length > 0 && issues.map((issue, index) => (
                        <motion.div
                          key={`${category}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity || 'medium')}`}>
                              {getCategoryIcon(category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-semibold text-white">
                                  {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </h4>
                                <Badge variant="outline" className={getSeverityColor(issue.severity || 'medium')}>
                                  {issue.severity || 'medium'}
                                </Badge>
                              </div>
                              
                              {/* Issue Description */}
                              <div className="mb-3">
                                <p className="text-gray-300 text-sm">
                                  {issue.description || 'No description available'}
                                </p>
                              </div>

                              {/* Issue Context */}
                              {issue.context && (
                                <div className="mb-3 p-2 bg-white/5 rounded-lg">
                                  <p className="text-gray-400 text-sm">
                                    <span className="font-medium">Context:</span> {issue.context}
                                  </p>
                                </div>
                              )}

                              {/* Issue Location */}
                              {issue.location && (
                                <div className="mb-3">
                                  <p className="text-gray-400 text-sm">
                                    <span className="font-medium">Location:</span> {issue.location}
                                  </p>
                                </div>
                              )}

                              {/* Issue Recommendation */}
                              {issue.recommendation && (
                                <div className="mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                  <p className="text-green-500 text-sm">
                                    <span className="font-medium">Recommendation:</span> {issue.recommendation}
                                  </p>
                                </div>
                              )}

                              {/* Additional Details */}
                              {issue.additional_details && (
                                <div className="mt-2 p-2 bg-white/5 rounded-lg">
                                  <p className="text-gray-400 text-sm">
                                    <span className="font-medium">Additional Details:</span> {issue.additional_details}
                                  </p>
                                </div>
                              )}

                              {/* Affected Documents */}
                              {issue.affected_documents && issue.affected_documents.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-gray-400 text-sm">
                                    <span className="font-medium">Affected Documents:</span>
                                  </p>
                                  <ul className="list-disc list-inside text-gray-400 text-sm mt-1">
                                    {issue.affected_documents.map((doc, idx) => (
                                      <li key={idx}>{doc}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>
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

export default FirmStandardAnalysis;
