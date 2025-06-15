import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadOptions from "./pages/UploadOptions";
import ChatWithDocument from "../src/pages/ChatWithDocument";
import ConsistencyAnalysis from "./pages/ConsistencyAnalysis";
import FirmStandardAnalysis from "./pages/FirmStandardAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/upload-options" element={<UploadOptions />} />
            <Route path="/chat" element={<ChatWithDocument />} />
            <Route path="/consistency-analysis" element={<ConsistencyAnalysis />} />
            <Route path="/firm-standard-analysis" element={<FirmStandardAnalysis />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
