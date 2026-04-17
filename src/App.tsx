import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import TrainingDetail from "./pages/TrainingDetail.tsx";
import CompanyIndex from "./pages/CompanyIndex.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import NotFound from "./pages/NotFound.tsx";
import SuperAdminLogin from "./pages/SuperAdminLogin.tsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/:companySlug" element={<CompanyIndex />} />
          <Route path="/:companySlug/training/:topicId" element={<TrainingDetail />} />
          <Route path="/training/:topicId" element={<TrainingDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
