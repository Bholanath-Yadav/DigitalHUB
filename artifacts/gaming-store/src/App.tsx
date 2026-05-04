import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter } from 'wouter';
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { setAuthTokenGetter } from "@/lib/api-hooks";
import { supabase } from "@/lib/supabase";
import NotFound from "@/pages/not-found";
import { PublicLayout } from "@/components/layout/public-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetails from "@/pages/product-details";
import Checkout from "@/pages/checkout";
import OrderStatus from "@/pages/order-status";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminPayments from "@/pages/admin/payments";
import AdminCoupons from "@/pages/admin/coupons";
import AdminBanners from "@/pages/admin/banners";
import AdminUsers from "@/pages/admin/users";
import AdminChat from "@/pages/admin/chat";
import AdminPaymentSettings from "@/pages/admin/payment-settings";
import AdminProductVariants from "@/pages/admin/product-variants";
import SignInPage from "@/pages/sign-in";
import TermsPage from "@/pages/terms";
import RefundPolicyPage from "@/pages/refund-policy";

setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthCacheInvalidator() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      qc.clear();
    }
    prevUserIdRef.current = userId;
  }, [user, qc]);

  return null;
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthCacheInvalidator />
        <ThemeProvider>
          <TooltipProvider>
            <Switch>
              <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
              <Route path="/products" component={() => <PublicLayout><Products /></PublicLayout>} />
              <Route path="/products/:id" component={() => <PublicLayout><ProductDetails /></PublicLayout>} />
              <Route path="/checkout/:orderId" component={() => <PublicLayout><Checkout /></PublicLayout>} />
              <Route path="/orders/:id" component={() => <PublicLayout><OrderStatus /></PublicLayout>} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignInPage} />
              <Route path="/profile" component={() => <PublicLayout><Profile /></PublicLayout>} />
              <Route path="/terms" component={() => <PublicLayout><TermsPage /></PublicLayout>} />
              <Route path="/refund-policy" component={() => <PublicLayout><RefundPolicyPage /></PublicLayout>} />

              <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/products" component={() => <AdminLayout><AdminProducts /></AdminLayout>} />
              <Route path="/admin/orders" component={() => <AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/payments" component={() => <AdminLayout><AdminPayments /></AdminLayout>} />
              <Route path="/admin/coupons" component={() => <AdminLayout><AdminCoupons /></AdminLayout>} />
              <Route path="/admin/banners" component={() => <AdminLayout><AdminBanners /></AdminLayout>} />
              <Route path="/admin/users" component={() => <AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/chat" component={() => <AdminLayout><AdminChat /></AdminLayout>} />
              <Route path="/admin/payment-settings" component={() => <AdminLayout><AdminPaymentSettings /></AdminLayout>} />
              <Route path="/admin/products/:id/variants" component={() => <AdminLayout><AdminProductVariants /></AdminLayout>} />

              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
