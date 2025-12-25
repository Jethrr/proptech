import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LeadReactivator from "./pages/LeadReactivator";
import FBIntentCurator from "./pages/FBIntentCurator";
import ProjectDetail from "./pages/ProjectDetail";
import SharedLink from "./pages/SharedLink";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isSharedLink = location.pathname.startsWith("/share/");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isLandingPage = location.pathname === "/";

  if (isSharedLink) {
    return (
      <Routes>
        <Route path="/share/:id" element={<SharedLink />} />
      </Routes>
    );
  }

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      </Routes>
    );
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>
          <Routes>
            <Route path="/properties" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/leads" element={<LeadReactivator />} />
            <Route path="/dashboard/fb-intent" element={<FBIntentCurator />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
