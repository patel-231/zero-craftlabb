import {
  Product,
  Category,
  Order,
  WebsiteSettings,
  CustomerDetails,
  CartItem,
  DashboardStats,
  AdminUser,
} from '../types/index.ts';

const ADMIN_TOKEN_KEY = 'zc_admin_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

function getHeaders(isFormData = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = `Server error (${res.status})`;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Public & Admin Products
  async getProducts(all = false): Promise<{ products: Product[] }> {
    const res = await fetch(`/api/products${all ? '?all=true' : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ products: Product[] }>(res);
  },

  async getProduct(idOrSlug: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ product: Product }>(res);
  },

  async createProduct(data: Partial<Product>): Promise<{ product: Product }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ product: Product }>(res);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ product: Product }>(res);
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Categories
  async getCategories(all = false): Promise<{ categories: Category[] }> {
    const res = await fetch(`/api/categories${all ? '?all=true' : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ categories: Category[] }>(res);
  },

  async getCategory(idOrSlug: string): Promise<{ category: Category }> {
    const res = await fetch(`/api/categories/${encodeURIComponent(idOrSlug)}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ category: Category }>(res);
  },

  async createCategory(data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ category: Category }>(res);
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ category: Category }>(res);
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Settings
  async getSettings(): Promise<{ settings: WebsiteSettings }> {
    const res = await fetch('/api/settings', {
      headers: getHeaders(),
    });
    return handleResponse<{ settings: WebsiteSettings }>(res);
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<{ settings: WebsiteSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse<{ settings: WebsiteSettings }>(res);
  },

  async testEmail(targetEmail: string): Promise<{ success: boolean; provider: string; message?: string; error?: string }> {
    const res = await fetch('/api/settings/test-email', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetEmail }),
    });
    return handleResponse(res);
  },

  // Checkout & Orders
  async submitOrder(orderData: {
    customer: CustomerDetails;
    items: { productId: string; quantity: number; selectedVariants: Record<string, string> }[];
    channel: 'whatsapp' | 'email';
  }): Promise<{
    success: boolean;
    order: Order;
    whatsAppUrl: string;
    whatsAppMessageText: string;
  }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ order: Order }>(res);
  },

  async getAdminOrders(): Promise<{ orders: Order[] }> {
    const res = await fetch('/api/orders', {
      headers: getHeaders(),
    });
    return handleResponse<{ orders: Order[] }>(res);
  },

  async updateOrderStatus(
    id: string,
    data: { status?: string; internalNotes?: string; notificationStatus?: string }
  ): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ order: Order }>(res);
  },

  async retryOrderEmail(id: string): Promise<{ success: boolean; order: Order; emailDeliveryLog: any }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}/retry-email`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Stats
  async getDashboardStats(): Promise<{
    stats: DashboardStats;
    recentOrders: Order[];
    auditLogs: any[];
  }> {
    const res = await fetch('/api/stats', {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Image / Asset Upload
  async uploadImage(base64Data: string, filename?: string): Promise<{ url: string; filename: string }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ base64Data, filename }),
    });
    return handleResponse<{ url: string; filename: string }>(res);
  },

  // Admin Auth
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ token: string; user: AdminUser }>(res);
    authStorage.setToken(data.token);
    return data;
  },

  async getAdminMe(): Promise<{ user: AdminUser }> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    return handleResponse<{ user: AdminUser }>(res);
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      authStorage.clearToken();
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async resetDefaultPassword(): Promise<{
    success: boolean;
    message: string;
    email: string;
    defaultPassword: string;
  }> {
    const res = await fetch('/api/auth/reset-default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<{
      success: boolean;
      message: string;
      email: string;
      defaultPassword: string;
    }>(res);
  },
};
