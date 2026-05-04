export interface HealthStatus { status: string }
export interface MessageResponse { message: string }

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];
export const ProductCategory = {
  "game-topups": "game-topups",
  "gift-cards": "gift-cards",
  subscriptions: "subscriptions",
  vouchers: "vouchers",
} as const;

export type DynamicFieldType = (typeof DynamicFieldType)[keyof typeof DynamicFieldType];
export const DynamicFieldType = { text: "text", number: "number", email: "email" } as const;

export interface DynamicField {
  name: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
}

export interface ProductVariant {
  name: string;
  price: number;
  badge?: string | null;
  originalPrice?: number | null;
  icon?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string | null;
  tags: string[];
  dynamicFields: DynamicField[];
  variants: ProductVariant[];
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export type ListProductsCategory = (typeof ListProductsCategory)[keyof typeof ListProductsCategory];
export const ListProductsCategory = {
  "game-topups": "game-topups",
  "gift-cards": "gift-cards",
  subscriptions: "subscriptions",
  vouchers: "vouchers",
} as const;

export type ListProductsParams = {
  category?: ListProductsCategory;
  search?: string;
  featured?: boolean;
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export const OrderStatus = {
  pending: "pending",
  verified: "verified",
  rejected: "rejected",
  completed: "completed",
} as const;

export type OrderGameDetails = { [key: string]: string };

export interface Order {
  id: number;
  userId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  productId: number;
  product: Product;
  gameDetails: OrderGameDetails;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  status: OrderStatus;
  paymentScreenshotUrl?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderBody {
  productId: number;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  gameDetails: { [key: string]: string };
  couponCode?: string | null;
}

export interface OrderStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  completed: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export type PaymentPaymentMethod = (typeof PaymentPaymentMethod)[keyof typeof PaymentPaymentMethod];
export const PaymentPaymentMethod = {
  esewa: "esewa",
  khalti: "khalti",
  "ime-pay": "ime-pay",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export const PaymentStatus = { pending: "pending", verified: "verified", rejected: "rejected" } as const;

export interface Payment {
  id: number;
  orderId: number;
  screenshotUrl: string;
  paymentMethod: PaymentPaymentMethod;
  status: PaymentStatus;
  adminNote?: string | null;
  createdAt: string;
}

export interface UploadPaymentBody {
  orderId: number;
  screenshotUrl: string;
  paymentMethod: PaymentPaymentMethod;
}

export type CouponDiscountType = (typeof CouponDiscountType)[keyof typeof CouponDiscountType];
export const CouponDiscountType = { percentage: "percentage", fixed: "fixed" } as const;

export interface Coupon {
  id: number;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  active: boolean;
  applicableProductIds: number[];
  createdAt: string;
}

export interface ValidateCouponBody {
  code: string;
  productId: number;
  amount: number;
}

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CreateBannerBody {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active: boolean;
  sortOrder: number;
}

export type ChatMessageSender = (typeof ChatMessageSender)[keyof typeof ChatMessageSender];
export const ChatMessageSender = { user: "user", bot: "bot", staff: "staff" } as const;

export interface ChatMessage {
  id: number;
  sessionId: string;
  sender: ChatMessageSender;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  userId?: string | null;
  guestName?: string | null;
  lastMessage?: string | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SendChatMessageBody {
  sessionId: string;
  content: string;
  guestName?: string | null;
}

export type UserProfileRole = (typeof UserProfileRole)[keyof typeof UserProfileRole];
export const UserProfileRole = { user: "user", staff: "staff", admin: "admin" } as const;

export interface UserProfile {
  id: number;
  supabaseId: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserProfileRole;
  isBanned: boolean;
  createdAt: string;
}

export interface UpdateProfileBody {
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface PaymentSetting {
  id: number;
  method: string;
  label: string;
  enabled: boolean;
  accountName?: string | null;
  accountNumber?: string | null;
  qrImageUrl?: string | null;
  instructions?: string | null;
  sortOrder: number;
  updatedAt: string;
}

export interface OrdersByStatus {
  pending: number;
  verified: number;
  completed: number;
  rejected: number;
}

export interface ProductCategoryStat {
  category: string;
  count: number;
  value: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalCatalogValue: number;
  soldValue: number;
  inStockValue: number;
  ordersByStatus: OrdersByStatus;
  productsByCategory: ProductCategoryStat[];
  recentOrders: Order[];
  revenueByDay: RevenueByDay[];
}

export type GetChatMessagesParams = { sessionId: string };
export type ListOrdersParams = { status?: string; userId?: string };
export type ListPaymentsParams = { status?: string };
export type ProductStats = { total: number; byCategory: Record<string, number>; inStock: number; outOfStock: number };

let _getToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> ?? {}),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${BASE}/api${path}`, { ...init, headers });
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}
