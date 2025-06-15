import { motion } from "framer-motion";
import { ArrowRight, Scale, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import LogoCarousel from "@/components/LogoCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import DocumentUpload from "@/components/DocumentUpload";
import { useState } from "react";
import { Link } from "react-router-dom";
import ChatWithDocument from "./ChatWithDocument";

const Index = () => {
  const [hasUploadedDocuments, setHasUploadedDocuments] = useState(false);

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation hasUploadedDocuments={hasUploadedDocuments} />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container px-4 pt-40 pb-20"
      >
        {/* Background */}
        <div 
          className="absolute inset-0 -z-10 bg-[#0A0A0A]"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full glass"
        >
          <span className="text-sm font-medium">
            <Scale className="w-4 h-4 inline-block mr-2" />
            AI-powered legal document platform
          </span>
        </motion.div>
        
        <div className="max-w-4xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-normal mb-4 tracking-tight text-left">
            <span className="text-gray-200">
              <TextGenerateEffect words="Third Chair" />
            </span>
            <br />
            <span className="text-white font-medium">
              <TextGenerateEffect words="Fix Document Issues Instantly" />
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl text-left"
          >
            Transform your legal practice with AI agents that detect and fix document inconsistencies, formatting issues, and inefficiencies with one click.{" "}
            <span className="text-white">Upload your documents to get started.</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <Link to="/upload-options">
              <Button size="lg" className="button-gradient">
                <Upload className="mr-2 w-4 h-4" />
                Upload & Fix Documents
              </Button>
            </Link>
            <Button size="lg" variant="link" className="text-white">
              Learn More <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative mx-auto max-w-5xl mt-20 group cursor-pointer"
        >
          <div className="glass rounded-xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Legal professionals reviewing documents with AI assistance"
              className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Modern Hero Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center">
              <div className="p-8 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <motion.h3 
                  className="text-3xl font-bold text-white mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  AI-Powered Document Analysis
                </motion.h3>
                <motion.p 
                  className="text-gray-200 text-lg max-w-md"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Experience the future of legal document processing with intelligent analysis and one-click fixes
                </motion.p>
              </div>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/50 transition-all duration-500" />
          </div>
        </motion.div>
      </motion.section>

      {/* Document Upload Section */}
      <section id="upload-section" className="container px-4 py-20 relative bg-black">
        <DocumentUpload onDocumentUploaded={() => setHasUploadedDocuments(true)} />
      </section>

      {/* Logo Carousel */}
      <LogoCarousel />

      {/* Features Section */}
      <div id="features" className="bg-black">
        <FeaturesSection />
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-black">
        <PricingSection />
      </div>

      {/* Testimonials Section */}
      <div className="bg-black">
        <TestimonialsSection />
      </div>

      {/* CTA Section */}
      <section className="container px-4 py-20 relative bg-black">
        <div className="relative group cursor-pointer rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0A0A0A]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12 text-center relative z-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to fix your documents instantly?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of legal professionals who have discovered the power of one-click document fixes and AI-powered efficiency.
            </p>
            <Button size="lg" className="button-gradient" onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <Zap className="mr-2 w-4 h-4" />
              Start Fixing Documents
            </Button>
          </motion.div>

          {/* CTA Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl" />
        </div>
      </section>

      {/* Footer */}
      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
