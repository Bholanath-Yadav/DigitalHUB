import { Suspense, lazy, useEffect, useRef } from "react";
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
import { OrderRealtimeNotifier } from "@/components/order-realtime-notifier";

const Home = lazy(() => import("@/pages/home"));
const Products = lazy(() => import("@/pages/products"));
const ProductDetails = lazy(() => import("@/pages/product-details"));
const Checkout = lazy(() => import("@/pages/checkout"));
const OrderStatus = lazy(() => import("@/pages/order-status"));
const Profile = lazy(() => import("@/pages/profile"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminCoupons = lazy(() => import("@/pages/admin/coupons"));
const AdminBanners = lazy(() => import("@/pages/admin/banners"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminChat = lazy(() => import("@/pages/admin/chat"));
const AdminReviews = lazy(() => import("@/pages/admin/reviews"));
const AdminPaymentSettings = lazy(() => import("@/pages/admin/payment-settings"));
const AdminProductVariants = lazy(() => import("@/pages/admin/product-variants"));
const SignInPage = lazy(() => import("@/pages/sign-in"));
const TermsPage = lazy(() => import("@/pages/terms"));
const RefundPolicyPage = lazy(() => import("@/pages/refund-policy"));

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
            <OrderRealtimeNotifier />
            <Suspense
              fallback={
                <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
                  Loading page...
                </div>
              }
            >
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
                <Route path="/admin/reviews" component={() => <AdminLayout><AdminReviews /></AdminLayout>} />
                <Route path="/admin/payment-settings" component={() => <AdminLayout><AdminPaymentSettings /></AdminLayout>} />
                <Route path="/admin/products/:id/variants" component={() => <AdminLayout><AdminProductVariants /></AdminLayout>} />

                <Route component={NotFound} />
              </Switch>
            </Suspense>
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
