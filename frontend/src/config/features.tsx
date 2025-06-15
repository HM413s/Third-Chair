
import { BarChart3, ShieldCheck, FileSearch, Scale, Zap, Users } from "lucide-react";

export const features = [
  {
    title: "AI Document Analysis",
    description: "Professional-grade document analysis with real-time legal insights and comprehensive review capabilities to identify inconsistencies instantly.",
    icon: <FileSearch className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    hoverText: "Instantly detect document inconsistencies with AI-powered analysis"
  },
  {
    title: "One-Click Document Fixes",
    description: "Automatically detect and fix document inconsistencies, formatting issues, and inefficiencies with a single click using AI.",
    icon: <Zap className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    hoverText: "Fix formatting and inconsistencies with one powerful click"
  },
  {
    title: "Legal Agent Assistance",
    description: "Specialized AI agents that understand legal context and provide intelligent recommendations for document improvements.",
    icon: <Users className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    hoverText: "AI agents specialized in legal document optimization"
  },
  {
    title: "Security & Compliance",
    description: "Industry-leading security measures with legal compliance verification to protect sensitive client information and documents.",
    icon: <ShieldCheck className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    hoverText: "Bank-level security for your sensitive legal documents"
  }
];
