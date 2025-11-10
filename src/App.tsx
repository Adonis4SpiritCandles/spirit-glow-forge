import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import LoadingSpinner from "./components/LoadingSpinner";
  import Index from "./pages/Index";
  import Shop from "./pages/Shop";
  import About from "./pages/About";
  import Contact from "./pages/Contact";
  import FAQ from "./pages/FAQ";
  import Collections from "./pages/Collections";
  import CollectionDetail from "./pages/CollectionDetail";
  import ProductDetail from "./pages/ProductDetail";
  import Cart from "./pages/Cart";
  import Checkout from "./pages/Checkout";
  import PaymentSuccess from "./pages/PaymentSuccess";
  import AdminDashboard from "./pages/AdminDashboard";
  import UserDashboard from "./pages/UserDashboard";
  import Auth from "./pages/Auth";
  import Wishlist from "./pages/Wishlist";
  import ScentQuiz from "./pages/ScentQuiz";
  import LoyaltyProgram from "./pages/LoyaltyProgram";
  import NotFound from "./pages/NotFound";
  import PrivacyPolicy from "./pages/PrivacyPolicy";
  import CookiePolicy from "./pages/CookiePolicy";
  import TermsOfSale from "./pages/TermsOfSale";
  import ShippingReturns from "./pages/ShippingReturns";
  import LegalNotice from "./pages/LegalNotice";
  import DataRequest from "./pages/DataRequest";
  import Accessibility from "./pages/Accessibility";
  import AllNotices from "./pages/AllNotices";
  import PrivacyRegistration from "./pages/PrivacyRegistration";
  import ResetPassword from "./pages/ResetPassword";
  import SharedWishlist from "./pages/SharedWishlist";
  import ARViewer from "./pages/ARViewer";
  import PublicProfile from "./pages/PublicProfile";
  import CustomCandles from "./pages/CustomCandles";
  import Header from "./components/Header";
  import Footer from "./components/Footer";
  import CartSidebar from "./components/CartSidebar";
 import { CookieBanner } from "./components/CookieBanner";
 import LiveChatWidget from "./components/chat/LiveChatWidget";
import { LanguageProvider } from "./contexts/LanguageContext";
 import { CartProvider } from "./contexts/CartContext";
 import { useReferral } from "./hooks/useReferral";
 import FloatingActionButton from "./components/FloatingActionButton";
 import { useGeneralSettings } from "./hooks/useGeneralSettings";

const queryClient = new QueryClient();

const RouteChangeHandler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  useReferral(); // Track referral parameters

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isLoading ? <LoadingSpinner /> : null;
};

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { settings: generalSettings } = useGeneralSettings();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <div className="min-h-screen bg-background">
              <RouteChangeHandler />
              <Header onCartOpen={() => setIsCartOpen(true)} />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:slug" element={<CollectionDetail />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/scent-quiz" element={<ScentQuiz />} />
                  <Route path="/loyalty" element={<LoyaltyProgram />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/terms-of-sale" element={<TermsOfSale />} />
                  <Route path="/shipping-returns" element={<ShippingReturns />} />
                  <Route path="/legal-notice" element={<LegalNotice />} />
                  <Route path="/data-request" element={<DataRequest />} />
                  <Route path="/accessibility" element={<Accessibility />} />
                  <Route path="/all-notices" element={<AllNotices />} />
                  <Route path="/privacy-registration" element={<PrivacyRegistration />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/custom-candles" element={<CustomCandles />} />
                  <Route path="/ar/:productId" element={<ARViewer />} />
                  <Route path="/profile/:userId" element={<PublicProfile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="/wishlist/shared/:token" element={<SharedWishlist />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              <Footer />
              <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              <CookieBanner />
              {generalSettings.show_live_chat && <LiveChatWidget />}
              {generalSettings.show_floating_plus && <FloatingActionButton />}
            </div>
          </TooltipProvider>
        </CartProvider>
      </LanguageProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
