
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthInit } from "@/hooks/useAuthInit";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HealthCheck } from "@/components/HealthCheck";
import { UITestingPanel } from "@/components/UITestingPanel";
import { Helmet } from "react-helmet";
import { SEO_CONFIG } from "@/constants/seo";
import Index from "./pages/Index";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PostItem from "./pages/PostItem";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => {
  useAuthInit();

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{SEO_CONFIG.siteName}</title>
        <meta name="description" content={SEO_CONFIG.siteDescription} />
        <meta name="keywords" content={SEO_CONFIG.keywords.join(', ')} />
        <meta property="og:title" content={SEO_CONFIG.siteName} />
        <meta property="og:description" content={SEO_CONFIG.siteDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={SEO_CONFIG.siteUrl} />
      </Helmet>
      
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/post" element={<PostItem />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <HealthCheck />
          <UITestingPanel />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
