
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, Users, Scale, Zap, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DocumentUploadProps {
  onDocumentUploaded: () => void;
}

const DocumentUpload = ({ onDocumentUploaded }: DocumentUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);
      onDocumentUploaded();
    }, 2000);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Upload Documents for Instant Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your legal documents and our AI agents will instantly detect inconsistencies, formatting issues, and inefficiencies - then fix them with one click.
        </p>
      </div>

      <div className="glass rounded-xl p-8">
        {!uploadComplete ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-primary transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <Label htmlFor="document-upload" className="cursor-pointer">
                <span className="text-lg font-medium">Choose legal documents to analyze</span>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports PDF, DOC, DOCX files up to 10MB each
                </p>
              </Label>
              <Input
                id="document-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Documents Ready for Analysis:</h3>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="button-gradient w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Documents...
                </>
              ) : (
                <>
                  <Zap className="mr-2 w-4 h-4" />
                  Analyze & Fix Documents
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-2xl font-bold mb-4">Documents Analyzed Successfully!</h3>
            <p className="text-muted-foreground mb-6">
              Your documents have been analyzed for inconsistencies and inefficiencies. Access our AI agents to fix issues instantly.
            </p>
            <Button
              onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })}
              className="button-gradient"
              size="lg"
            >
              <Users className="mr-2 w-4 h-4" />
              Access Document Fix Agents
            </Button>
          </div>
        )}
      </div>

      {uploadComplete && (
        <motion.div
          id="agents"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI Document Fix Agents
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our specialized AI agents have analyzed your documents and are ready to fix issues with one click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold mb-2">Inconsistency Fixer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Automatically detect and fix contradictions, missing references, and logical inconsistencies in your documents.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Zap className="mr-2 w-4 h-4" />
                Fix Inconsistencies
              </Button>
            </div>

            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold mb-2">Format Optimizer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Standardize formatting, fix citations, and ensure professional document structure across all files.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Zap className="mr-2 w-4 h-4" />
                Optimize Format
              </Button>
            </div>

            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-bold mb-2">Efficiency Enhancer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Streamline language, remove redundancies, and improve document clarity for maximum impact.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Zap className="mr-2 w-4 h-4" />
                Enhance Efficiency
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DocumentUpload;
