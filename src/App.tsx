import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import CaseManager from "./pages/CaseManager";
import CitizenChat from "./pages/CitizenChat";
import Transparency from "./pages/Transparency";
import SubmitCase from "./pages/SubmitCase";
import IssueMap from "./pages/IssueMap";
import Verification from "./pages/Verification";
import WhatsAppBot from "./pages/WhatsAppBot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cases" element={<CaseManager />} />
            <Route path="/submit" element={<SubmitCase />} />
            <Route path="/map" element={<IssueMap />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/chat" element={<CitizenChat />} />
            <Route path="/whatsapp" element={<WhatsAppBot />} />
            <Route path="/transparency" element={<Transparency />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
