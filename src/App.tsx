
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
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PostItem from "./pages/PostItem";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ItemDetail from "./pages/ItemDetail";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Trademark from "./pages/Trademark";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import UserProfile from "./pages/UserProfile";
import Subscription from "./pages/Subscription";
import SellerOnboarding from "./pages/SellerOnboarding";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentCancelled } from "./pages/PaymentCancelled";
import { Contact } from "./pages/Contact";

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
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/post" element={<PostItem />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:categorySlug" element={<Category />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/seller-onboarding" element={<SellerOnboarding />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/trademark" element={<Trademark />} />
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
