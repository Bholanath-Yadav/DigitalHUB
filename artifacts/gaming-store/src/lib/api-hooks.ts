import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import {
  apiFetch,
  type Product,
  type Order,
  type Banner,
  type Coupon,
  type Payment,
  type PaymentSetting,
  type UserProfile,
  type ChatMessage,
  type ChatSession,
  type CouponValidationResult,
  type DashboardStats,
  type OrderStats,
  type ProductStats,
  type ListProductsParams,
  type ListOrdersParams,
  type ListPaymentsParams,
  type GetChatMessagesParams,
  type CreateOrderBody,
  type UploadPaymentBody,
  type ValidateCouponBody,
  type UpdateProfileBody,
} from "./api-client";
import { supabase } from "./supabase";

function qs(params: Record<string, any>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export { setAuthTokenGetter, ListProductsCategory } from "./api-client";
export type { Product, Order, Banner, Coupon, Payment, PaymentSetting, UserProfile, ChatMessage, ChatSession, CouponValidationResult, DashboardStats, OrderStats, ProductStats, UpdateProfileBody };

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    dynamicFields: Array.isArray(row.dynamic_fields ?? row.dynamicFields)
      ? (row.dynamic_fields ?? row.dynamicFields)
      : [],
    variants: Array.isArray(row.variants) ? row.variants : [],
    inStock: row.in_stock ?? row.inStock ?? false,
    featured: row.featured ?? false,
    createdAt: row.created_at ?? row.createdAt,
  };
}

function mapBanner(row: any): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    linkUrl: row.link_url ?? row.linkUrl ?? null,
    active: row.active ?? true,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    createdAt: row.created_at ?? row.createdAt,
  };
}

async function fetchProducts(params: ListProductsParams = {}): Promise<Product[]> {
  let query = supabase.from("products").select("*");
  if (params.category) query = query.eq("category", params.category);
  if (params.featured === true) query = query.eq("featured", true);
  if (params.search) query = query.ilike("name", `%${params.search}%`);

  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export function useListProducts(
  params: ListProductsParams = {},
  options?: { query?: UseQueryOptions<Product[]> }
) {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    ...options?.query,
  });
}

export function useGetProduct(
  id: number,
  options?: { query?: UseQueryOptions<Product> }
) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Product not found");
      return mapProduct(data);
    },
    enabled: !!id,
    ...options?.query,
  });
}

export function useGetProductStats(options?: { query?: UseQueryOptions<ProductStats> }) {
  return useQuery<ProductStats>({
    queryKey: ["product-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("category, in_stock");
      if (error) throw error;

      const byCategory: Record<string, number> = {};
      let inStock = 0;
      let outOfStock = 0;

      for (const product of data ?? []) {
        byCategory[product.category] = (byCategory[product.category] ?? 0) + 1;
        if (product.in_stock) inStock += 1;
        else outOfStock += 1;
      }

      return {
        total: (data ?? []).length,
        byCategory,
        inStock,
        outOfStock,
      };
    },
    ...options?.query,
  });
}

export function useCreateProduct(options?: UseMutationOptions<Product, Error, { data: Partial<Product> }>) {
  return useMutation<Product, Error, { data: Partial<Product> }>({
    mutationFn: ({ data }) => apiFetch<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUpdateProduct(options?: UseMutationOptions<Product, Error, { id: number; data: Partial<Product> }>) {
  return useMutation<Product, Error, { id: number; data: Partial<Product> }>({
    mutationFn: ({ id, data }) => apiFetch<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useDeleteProduct(options?: UseMutationOptions<{ message: string }, Error, number>) {
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => apiFetch<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
    ...options,
  });
}

export function useListOrders(
  params: ListOrdersParams = {},
  options?: { query?: UseQueryOptions<Order[]> }
) {
  return useQuery<Order[]>({
    queryKey: ["orders", params],
    queryFn: () => apiFetch<Order[]>(`/orders${qs(params as any)}`),
    ...options?.query,
  });
}

export function useGetMyOrders(options?: { query?: UseQueryOptions<Order[]> }) {
  return useQuery<Order[]>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) return [];

      const { data: orderRows, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (ordersError) throw ordersError;

      const productIds = [...new Set((orderRows ?? []).map((row) => row.product_id))];
      const { data: productRows, error: productsError } = productIds.length > 0
        ? await supabase.from("products").select("*").in("id", productIds)
        : { data: [], error: null };
      if (productsError) throw productsError;

      const productMap = new Map((productRows ?? []).map((row) => [row.id, mapProduct(row)]));

      return (orderRows ?? []).map((row) => {
        const product = productMap.get(row.product_id);
        if (!product) throw new Error("Product not found for order");

        return {
          id: row.id,
          userId: row.user_id ?? null,
          guestName: row.guest_name ?? null,
          guestEmail: row.guest_email ?? null,
          guestPhone: row.guest_phone ?? null,
          productId: row.product_id,
          product,
          gameDetails: row.game_details ?? {},
          totalAmount: Number(row.total_amount),
          discountAmount: Number(row.discount_amount ?? 0),
          couponCode: row.coupon_code ?? null,
          status: row.status,
          paymentScreenshotUrl: row.payment_screenshot_url ?? null,
          adminNote: row.admin_note ?? null,
          createdAt: row.created_at ?? row.createdAt,
          updatedAt: row.updated_at ?? row.updatedAt,
        };
      });
    },
    ...options?.query,
  });
}

export function useGetOrder(
  id: number,
  options?: { query?: UseQueryOptions<Order> }
) {
  return useQuery<Order>({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!orderRow) throw new Error("Order not found");

      const { data: productRow, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", orderRow.product_id)
        .maybeSingle();
      if (productError) throw productError;
      if (!productRow) throw new Error("Product not found");

      return {
        id: orderRow.id,
        userId: orderRow.user_id ?? null,
        guestName: orderRow.guest_name ?? null,
        guestEmail: orderRow.guest_email ?? null,
        guestPhone: orderRow.guest_phone ?? null,
        productId: orderRow.product_id,
        product: mapProduct(productRow),
        gameDetails: orderRow.game_details ?? {},
        totalAmount: Number(orderRow.total_amount),
        discountAmount: Number(orderRow.discount_amount ?? 0),
        couponCode: orderRow.coupon_code ?? null,
        status: orderRow.status,
        paymentScreenshotUrl: orderRow.payment_screenshot_url ?? null,
        adminNote: orderRow.admin_note ?? null,
        createdAt: orderRow.created_at ?? orderRow.createdAt,
        updatedAt: orderRow.updated_at ?? orderRow.updatedAt,
      };
    },
    enabled: !!id,
    ...options?.query,
  });
}

export function useGetOrderStats(options?: { query?: UseQueryOptions<OrderStats> }) {
  return useQuery<OrderStats>({
    queryKey: ["order-stats"],
    queryFn: () => apiFetch<OrderStats>("/orders/stats/summary"),
    ...options?.query,
  });
}

export function useCreateOrder(options?: UseMutationOptions<Order, Error, { data: CreateOrderBody }>) {
  return useMutation<Order, Error, { data: CreateOrderBody }>({
    mutationFn: async ({ data }) => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id ?? null;

      const { data: insertedOrder, error: insertError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          guest_name: data.guestName ?? null,
          guest_email: data.guestEmail ?? null,
          guest_phone: data.guestPhone ?? null,
          product_id: data.productId,
          game_details: data.gameDetails,
          total_amount: data.totalAmount,
          discount_amount: data.discountAmount ?? 0,
          coupon_code: data.couponCode ?? null,
          status: "pending",
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      const { data: productRow, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", insertedOrder.product_id)
        .maybeSingle();

      if (productError) throw productError;
      if (!productRow) throw new Error("Product not found");

      return {
        id: insertedOrder.id,
        userId: insertedOrder.user_id ?? null,
        guestName: insertedOrder.guest_name ?? null,
        guestEmail: insertedOrder.guest_email ?? null,
        guestPhone: insertedOrder.guest_phone ?? null,
        productId: insertedOrder.product_id,
        product: mapProduct(productRow),
        gameDetails: insertedOrder.game_details ?? {},
        totalAmount: Number(insertedOrder.total_amount ?? 0),
        discountAmount: Number(insertedOrder.discount_amount ?? 0),
        couponCode: insertedOrder.coupon_code ?? null,
        status: insertedOrder.status,
        paymentScreenshotUrl: insertedOrder.payment_screenshot_url ?? null,
        adminNote: insertedOrder.admin_note ?? null,
        createdAt: insertedOrder.created_at ?? insertedOrder.createdAt,
        updatedAt: insertedOrder.updated_at ?? insertedOrder.updatedAt,
      };
    },
    ...options,
  });
}

export function useUpdateOrderStatus(options?: UseMutationOptions<Order, Error, { id: number; data: { status: string; adminNote?: string | null } }>) {
  return useMutation<Order, Error, { id: number; data: { status: string; adminNote?: string | null } }>({
    mutationFn: ({ id, data }) => apiFetch<Order>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUploadPaymentScreenshot(options?: UseMutationOptions<Payment, Error, { data: UploadPaymentBody }>) {
  return useMutation<Payment, Error, { data: UploadPaymentBody }>({
    mutationFn: async ({ data }) => {
      const { data: insertedPayment, error } = await supabase
        .from("payments")
        .insert({
          order_id: data.orderId,
          screenshot_url: data.screenshotUrl,
          payment_method: data.paymentMethod,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) throw error;

      return {
        id: insertedPayment.id,
        orderId: insertedPayment.order_id,
        screenshotUrl: insertedPayment.screenshot_url,
        paymentMethod: insertedPayment.payment_method,
        status: insertedPayment.status,
        adminNote: insertedPayment.admin_note ?? null,
        createdAt: insertedPayment.created_at ?? insertedPayment.createdAt,
      };
    },
    ...options,
  });
}

export function useListPayments(
  params: ListPaymentsParams = {},
  options?: { query?: UseQueryOptions<Payment[]> }
) {
  return useQuery<Payment[]>({
    queryKey: ["payments", params],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        orderId: row.order_id,
        screenshotUrl: row.screenshot_url,
        paymentMethod: row.payment_method,
        status: row.status,
        adminNote: row.admin_note ?? null,
        createdAt: row.created_at ?? row.createdAt,
      }));
    },
    ...options?.query,
  });
}

export function useVerifyPayment(options?: UseMutationOptions<Payment, Error, { id: number; data: { status: string; adminNote?: string | null } }>) {
  return useMutation<Payment, Error, { id: number; data: { status: string; adminNote?: string | null } }>({
    mutationFn: ({ id, data }) => apiFetch<Payment>(`/payments/${id}/verify`, { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useListBanners(options?: { query?: UseQueryOptions<Banner[]> }) {
  return useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapBanner);
    },
    ...options?.query,
  });
}

export function useCreateBanner(options?: UseMutationOptions<Banner, Error, { data: Partial<Banner> }>) {
  return useMutation<Banner, Error, { data: Partial<Banner> }>({
    mutationFn: ({ data }) => apiFetch<Banner>("/banners", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUpdateBanner(options?: UseMutationOptions<Banner, Error, { id: number; data: Partial<Banner> }>) {
  return useMutation<Banner, Error, { id: number; data: Partial<Banner> }>({
    mutationFn: ({ id, data }) => apiFetch<Banner>(`/banners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useDeleteBanner(options?: UseMutationOptions<{ message: string }, Error, number>) {
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => apiFetch<{ message: string }>(`/banners/${id}`, { method: "DELETE" }),
    ...options,
  });
}

export function useListCoupons(options?: { query?: UseQueryOptions<Coupon[]> }) {
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").eq("active", true);
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        code: row.code,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        expiresAt: row.expires_at ?? null,
        usageLimit: row.usage_limit ?? null,
        usageCount: row.usage_count ?? 0,
        active: row.active ?? true,
        applicableProductIds: Array.isArray(row.applicable_product_ids)
          ? row.applicable_product_ids.map((value: any) => Number(value))
          : [],
        createdAt: row.created_at ?? row.createdAt,
      }));
    },
    ...options?.query,
  });
}

export function useCreateCoupon(options?: UseMutationOptions<Coupon, Error, { data: Partial<Coupon> }>) {
  return useMutation<Coupon, Error, { data: Partial<Coupon> }>({
    mutationFn: ({ data }) => apiFetch<Coupon>("/coupons", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUpdateCoupon(options?: UseMutationOptions<Coupon, Error, { id: number; data: Partial<Coupon> }>) {
  return useMutation<Coupon, Error, { id: number; data: Partial<Coupon> }>({
    mutationFn: ({ id, data }) => apiFetch<Coupon>(`/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useDeleteCoupon(options?: UseMutationOptions<{ message: string }, Error, number>) {
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => apiFetch<{ message: string }>(`/coupons/${id}`, { method: "DELETE" }),
    ...options,
  });
}

export function useValidateCoupon(options?: UseMutationOptions<CouponValidationResult, Error, { data: ValidateCouponBody }>) {
  return useMutation<CouponValidationResult, Error, { data: ValidateCouponBody }>({
    mutationFn: async ({ data }) => {
      const { code, productId, amount } = data;
      const { data: coupon, error } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
      if (error) throw error;

      if (!coupon) {
        return { valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon not found" };
      }

      if (!coupon.active) {
        return { valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon is inactive" };
      }

      if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
        return { valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon has expired" };
      }

      if (coupon.usage_limit && Number(coupon.usage_count ?? 0) >= Number(coupon.usage_limit)) {
        return { valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon usage limit reached" };
      }

      const applicableIds = Array.isArray(coupon.applicable_product_ids)
        ? coupon.applicable_product_ids.map((value: any) => Number(value))
        : [];

      if (applicableIds.length > 0 && !applicableIds.includes(productId)) {
        return { valid: false, discountAmount: 0, finalAmount: amount, message: "Coupon does not apply to this product" };
      }

      const discountAmount =
        coupon.discount_type === "percentage"
          ? Math.round((amount * Number(coupon.discount_value)) / 100)
          : Math.min(Number(coupon.discount_value), amount);

      return {
        valid: true,
        discountAmount,
        finalAmount: Math.max(0, amount - discountAmount),
        message: "Coupon applied successfully",
      };
    },
    ...options,
  });
}

export function useGetMyProfile(options?: { query?: UseQueryOptions<UserProfile> }) {
  return useQuery<UserProfile>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) throw new Error("Not signed in");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      return {
        id: data.id,
        supabaseId: data.supabase_id,
        email: data.email,
        name: data.name ?? null,
        phone: data.phone ?? null,
        avatarUrl: data.avatar_url ?? null,
        role: data.role,
        isBanned: data.is_banned ?? false,
        createdAt: data.created_at ?? data.createdAt,
      };
    },
    ...options?.query,
  });
}

export function useUpdateMyProfile(options?: UseMutationOptions<UserProfile, Error, { data: UpdateProfileBody }>) {
  return useMutation<UserProfile, Error, { data: UpdateProfileBody }>({
    mutationFn: async ({ data }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) throw new Error("Not signed in");

      const { data: updated, error } = await supabase
        .from("users")
        .update({
          name: data.name ?? null,
          phone: data.phone ?? null,
          avatar_url: data.avatarUrl ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("supabase_id", user.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (!updated) throw new Error("Profile not found");

      return {
        id: updated.id,
        supabaseId: updated.supabase_id,
        email: updated.email,
        name: updated.name ?? null,
        phone: updated.phone ?? null,
        avatarUrl: updated.avatar_url ?? null,
        role: updated.role,
        isBanned: updated.is_banned ?? false,
        createdAt: updated.created_at ?? updated.createdAt,
      };
    },
    ...options,
  });
}

export function useSyncUser(options?: UseMutationOptions<UserProfile, Error, { data: { email?: string; name?: string; avatarUrl?: string } }>) {
  return useMutation<UserProfile, Error, { data: { email?: string; name?: string; avatarUrl?: string } }>({
    mutationFn: async ({ data }) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) throw new Error("Not signed in");

      const { data: upserted, error } = await supabase
        .from("users")
        .upsert({
          supabase_id: user.id,
          email: data.email ?? user.email ?? "",
          name: data.name ?? user.user_metadata?.name ?? null,
          avatar_url: data.avatarUrl ?? null,
          role: "user",
          is_banned: false,
        }, { onConflict: "supabase_id" })
        .select("*")
        .single();

      if (error) throw error;

      return {
        id: upserted.id,
        supabaseId: upserted.supabase_id,
        email: upserted.email,
        name: upserted.name ?? null,
        phone: upserted.phone ?? null,
        avatarUrl: upserted.avatar_url ?? null,
        role: upserted.role,
        isBanned: upserted.is_banned ?? false,
        createdAt: upserted.created_at ?? upserted.createdAt,
      };
    },
    ...options,
  });
}

export function useListAdminUsers(options?: { query?: UseQueryOptions<UserProfile[]> }) {
  return useQuery<UserProfile[]>({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch<UserProfile[]>("/admin/users"),
    ...options?.query,
  });
}

export function useUpdateUserRole(options?: UseMutationOptions<UserProfile, Error, { userId: string; data: { role: string } }>) {
  return useMutation<UserProfile, Error, { userId: string; data: { role: string } }>({
    mutationFn: ({ userId, data }) => apiFetch<UserProfile>(`/admin/users/${userId}/role`, { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useBanUser(options?: UseMutationOptions<UserProfile, Error, { userId: string; data: { isBanned: boolean } }>) {
  return useMutation<UserProfile, Error, { userId: string; data: { isBanned: boolean } }>({
    mutationFn: ({ userId, data }) => apiFetch<UserProfile>(`/admin/users/${userId}/ban`, { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useDeleteAdminUser(options?: UseMutationOptions<{ message: string }, Error, string>) {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (userId) => apiFetch<{ message: string }>(`/admin/users/${userId}`, { method: "DELETE" }),
    ...options,
  });
}

export function useGetDashboard(options?: { query?: UseQueryOptions<DashboardStats> }) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardStats>("/admin/dashboard"),
    ...options?.query,
  });
}

export function useListPaymentSettings(options?: { query?: UseQueryOptions<PaymentSetting[]> }) {
  return useQuery<PaymentSetting[]>({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_settings").select("*").order("sort_order", { ascending: true });
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        method: row.method,
        label: row.label,
        enabled: row.enabled ?? true,
        accountName: row.account_name ?? null,
        accountNumber: row.account_number ?? null,
        qrImageUrl: row.qr_image_url ?? null,
        instructions: row.instructions ?? null,
        sortOrder: row.sort_order ?? row.sortOrder ?? 0,
        updatedAt: row.updated_at ?? row.updatedAt,
      }));
    },
    ...options?.query,
  });
}

export function useUpdatePaymentSetting(options?: UseMutationOptions<PaymentSetting, Error, { method: string; data: Partial<PaymentSetting> }>) {
  return useMutation<PaymentSetting, Error, { method: string; data: Partial<PaymentSetting> }>({
    mutationFn: ({ method, data }) => apiFetch<PaymentSetting>(`/admin/payment-settings/${method}`, { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useGetChatMessages(
  params: GetChatMessagesParams,
  options?: { query?: UseQueryOptions<ChatMessage[]> }
) {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", params.sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", params.sessionId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return (data ?? []).map(msg => ({
        id: msg.id,
        sessionId: msg.session_id,
        sender: msg.sender,
        content: msg.content,
        createdAt: msg.created_at,
        guestName: msg.guest_name,
      }));
    },
    enabled: !!params.sessionId,
    ...options?.query,
  });
}

export function useSendChatMessage(options?: UseMutationOptions<{ userMessage: ChatMessage; botMessage: ChatMessage | null }, Error, { data: { sessionId: string; content: string; guestName?: string | null; isStaff?: boolean } }>) {
  return useMutation<{ userMessage: ChatMessage; botMessage: ChatMessage | null }, Error, { data: { sessionId: string; content: string; guestName?: string | null; isStaff?: boolean } }>({
    mutationFn: async ({ data }) => {
      // Insert user message
      const { error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: data.sessionId,
          sender: "user",
          content: data.content,
          guest_name: data.guestName || null,
        });
      
      if (insertError) throw insertError;

      // Create a mock bot response (can be enhanced with serverless function later)
      const botResponse: ChatMessage = {
        id: Math.random(),
        sessionId: data.sessionId,
        sender: "bot",
        content: "Thanks for your message! Our team will respond shortly.",
        createdAt: new Date().toISOString(),
      };

      const userMessage: ChatMessage = {
        id: Math.random(),
        sessionId: data.sessionId,
        sender: "user",
        content: data.content,
        createdAt: new Date().toISOString(),
        guestName: data.guestName,
      };

      return { userMessage, botMessage: botResponse };
    },
    ...options,
  });
}

export function useListChatSessions(options?: { query?: UseQueryOptions<ChatSession[]> }) {
  return useQuery<ChatSession[]>({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("DISTINCT session_id")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data ?? []).map(row => ({ id: row.session_id }));
    },
    ...options?.query,
  });
}

export function useDeleteChatSession(options?: UseMutationOptions<{ message: string }, Error, string>) {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (sessionId) => {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("session_id", sessionId);
      
      if (error) throw error;
      return { message: "Session deleted" };
    },
    ...options,
  });
}
