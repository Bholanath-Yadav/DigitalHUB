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

export function useListProducts(
  params: ListProductsParams = {},
  options?: { query?: UseQueryOptions<Product[]> }
) {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: () => apiFetch<Product[]>(`/products${qs(params as any)}`),
    ...options?.query,
  });
}

export function useGetProduct(
  id: number,
  options?: { query?: UseQueryOptions<Product> }
) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => apiFetch<Product>(`/products/${id}`),
    enabled: !!id,
    ...options?.query,
  });
}

export function useGetProductStats(options?: { query?: UseQueryOptions<ProductStats> }) {
  return useQuery<ProductStats>({
    queryKey: ["product-stats"],
    queryFn: () => apiFetch<ProductStats>("/products/stats/summary"),
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
    queryFn: () => apiFetch<Order[]>("/orders/my"),
    ...options?.query,
  });
}

export function useGetOrder(
  id: number,
  options?: { query?: UseQueryOptions<Order> }
) {
  return useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => apiFetch<Order>(`/orders/${id}`),
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
    mutationFn: ({ data }) => apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
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
    mutationFn: ({ data }) => apiFetch<Payment>("/payments/upload", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useListPayments(
  params: ListPaymentsParams = {},
  options?: { query?: UseQueryOptions<Payment[]> }
) {
  return useQuery<Payment[]>({
    queryKey: ["payments", params],
    queryFn: () => apiFetch<Payment[]>(`/payments${qs(params as any)}`),
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
    queryFn: () => apiFetch<Banner[]>("/banners"),
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
    queryFn: () => apiFetch<Coupon[]>("/coupons"),
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
    mutationFn: ({ data }) => apiFetch<CouponValidationResult>("/coupons/validate", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useGetMyProfile(options?: { query?: UseQueryOptions<UserProfile> }) {
  return useQuery<UserProfile>({
    queryKey: ["my-profile"],
    queryFn: () => apiFetch<UserProfile>("/users/me"),
    ...options?.query,
  });
}

export function useUpdateMyProfile(options?: UseMutationOptions<UserProfile, Error, { data: UpdateProfileBody }>) {
  return useMutation<UserProfile, Error, { data: UpdateProfileBody }>({
    mutationFn: ({ data }) => apiFetch<UserProfile>("/users/me", { method: "PUT", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useSyncUser(options?: UseMutationOptions<UserProfile, Error, { data: { email?: string; name?: string; avatarUrl?: string } }>) {
  return useMutation<UserProfile, Error, { data: { email?: string; name?: string; avatarUrl?: string } }>({
    mutationFn: ({ data }) => apiFetch<UserProfile>("/users/sync", { method: "POST", body: JSON.stringify(data) }),
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
    queryFn: () => apiFetch<PaymentSetting[]>("/payment-settings"),
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
    queryFn: () => apiFetch<ChatMessage[]>(`/chat/messages?sessionId=${encodeURIComponent(params.sessionId)}`),
    enabled: !!params.sessionId,
    ...options?.query,
  });
}

export function useSendChatMessage(options?: UseMutationOptions<{ userMessage: ChatMessage; botMessage: ChatMessage | null }, Error, { data: { sessionId: string; content: string; guestName?: string | null; isStaff?: boolean } }>) {
  return useMutation<{ userMessage: ChatMessage; botMessage: ChatMessage | null }, Error, { data: { sessionId: string; content: string; guestName?: string | null; isStaff?: boolean } }>({
    mutationFn: ({ data }) => apiFetch("/chat/messages", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useListChatSessions(options?: { query?: UseQueryOptions<ChatSession[]> }) {
  return useQuery<ChatSession[]>({
    queryKey: ["chat-sessions"],
    queryFn: () => apiFetch<ChatSession[]>("/chat/sessions"),
    ...options?.query,
  });
}

export function useDeleteChatSession(options?: UseMutationOptions<{ message: string }, Error, string>) {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (sessionId) => apiFetch<{ message: string }>(`/chat/sessions/${sessionId}`, { method: "DELETE" }),
    ...options,
  });
}
