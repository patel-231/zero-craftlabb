export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size", "Finish", "Design"
  options: {
    label: string; // e.g. "A3 (30x42 cm)", "Matte Black"
    priceAdjustment?: number; // e.g. 0, +300
    sku?: string;
    stock?: number;
  }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  images: string[];
  primaryImage: string;
  price: number;
  salePrice?: number;
  currency: string;
  stock: number;
  isAvailable: boolean;
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  bannerImage?: string;
  displayOrder: number;
  isVisible: boolean;
  parentCategoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedVariants: Record<string, string>; // variantName -> optionLabel
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string; // WhatsApp / Mobile number
  email: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  alternatePhone?: string;
  customerNotes?: string;
  giftMessage?: string;
}

export type OrderChannel = 'whatsapp' | 'email';

export type OrderStatus =
  | 'new'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type NotificationStatus =
  | 'pending'
  | 'whatsapp_prepared'
  | 'email_sent'
  | 'email_failed'
  | 'customer_contacted';

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  image: string;
  selectedVariants: Record<string, string>;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  reference: string; // e.g. "ZC-20261016-A8F2"
  createdAt: string;
  updatedAt: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: string;
  channel: OrderChannel;
  status: OrderStatus;
  notificationStatus: NotificationStatus;
  internalNotes?: string;
  whatsAppMessageText?: string;
  emailDeliveryLog?: {
    attemptedAt: string;
    success: boolean;
    provider?: string;
    customerEmailSent?: boolean;
    businessEmailSent?: boolean;
    error?: string;
  };
}

export interface EmailConfig {
  provider: 'brevo' | 'resend';
  brevoApiKey?: string;
  brevoSenderEmail?: string;
  brevoSenderName?: string;
  resendApiKey?: string;
  resendSenderEmail?: string;
}

export interface WebsiteSettings {
  brand: {
    name: string;
    tagline: string;
    logoUrl: string;
    faviconUrl?: string;
    primaryColor: string;
    accentColor: string;
  };
  emailConfig?: EmailConfig;
  contact: {
    whatsappNumber: string; // e.g. "919876543210" without spaces or '+' for wa.me link
    displayPhone: string; // e.g. "+91 98765 43210"
    businessOrderEmail: string;
    publicContactEmail: string;
    address: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    backgroundImageUrl?: string;
  };
  commerce: {
    currencySymbol: string;
    currencyCode: string;
    freeShippingThreshold: number;
    standardShippingFee: number;
    enableWhatsAppOrders: boolean;
    enableEmailOrders: boolean;
    allowInternationalOrders: boolean;
    orderPrefix: string;
  };
  policies: {
    shippingPolicy: string;
    returnsPolicy: string;
    privacyPolicy: string;
    termsAndConditions: string;
    aboutUsStory: string;
  };
  seo: {
    siteTitle: string;
    metaDescription: string;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  ordersAwaitingConfirmation: number;
  ordersProcessing: number;
  ordersShipped: number;
  ordersDelivered: number;
  ordersCancelled: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  bestsellerCount: number;
}
