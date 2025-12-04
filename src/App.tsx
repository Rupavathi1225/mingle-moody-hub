import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import WebResult from "./pages/WebResult";
import Prelander from "./pages/Prelander";
import Admin from "./pages/Admin";
import AdminCategories from "./pages/AdminCategories";
import AdminWebResults from "./pages/AdminWebResults";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminEmails from "./pages/AdminEmails";
import PrelanderAdmin from "./pages/PrelanderAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/webresult:pageNum" element={<WebResult />} />
          <Route path="/prelander" element={<Prelander />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/webresults" element={<AdminWebResults />} />
          <Route path="/admin/prelander-builder" element={<PrelanderAdmin />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/emails" element={<AdminEmails />} />
          <Route path="/builder" element={<PrelanderAdmin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
