import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import EmployeeRegister from "./pages/EmployeeRegister.tsx";
import TrainingDetail from "./pages/TrainingDetail.tsx";
import CompanyIndex from "./pages/CompanyIndex.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import NotFound from "./pages/NotFound.tsx";
import SuperAdminLogin from "./pages/SuperAdminLogin.tsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.tsx";
import CompanyAdminLogin from "./pages/CompanyAdminLogin.tsx";
import CompanyAdminDashboard from "./pages/CompanyAdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Entry point — unified login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Employee registration */}
          <Route path="/register/:companySlug" element={<EmployeeRegister />} />

          {/* Admin panel */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/login" element={<CompanyAdminLogin />} />
          <Route path="/admin/:companySlug/dashboard" element={<CompanyAdminDashboard />} />

          {/* Super admin (also accessible directly) */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />

          {/* Company training portal */}
          <Route path="/:companySlug" element={<CompanyIndex />} />
          <Route path="/:companySlug/training/:topicId" element={<TrainingDetail />} />
          <Route path="/training/:topicId" element={<TrainingDetail />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;