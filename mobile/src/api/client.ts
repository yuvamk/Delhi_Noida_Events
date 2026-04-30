import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5005/api/v1';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

export async function setToken(token: string, refreshToken?: string) {
  await AsyncStorage.setItem('auth_token', token);
  if (refreshToken) await AsyncStorage.setItem('auth_refresh_token', refreshToken);
}

export async function clearToken() {
  await AsyncStorage.multiRemove(['auth_token', 'auth_refresh_token', 'auth_user']);
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: User) {
  await AsyncStorage.setItem('auth_user', JSON.stringify(user));
}

// ─── Types ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  cityPreference?: string;
  categoryPreferences?: string[];
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  pages?: number;
}

export interface EventData {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  category: string;
  city: string;
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  address: string;
  price: { amount: number; currency: string; type: 'Free' | 'Paid' | 'RSVP' };
  registrationUrl: string;
  images: string[];
  tags: string[];
  organizer: { name: string; email?: string; website?: string; verified?: boolean };
  capacity?: number;
  attendees?: number;
  source: string;
  sourceUrl: string;
  featured: boolean;
  verified: boolean;
  viewCount?: number;
  bookmarkCount?: number;
  rating?: number;
  status?: string;
  onlineEvent?: boolean;
  speakers?: Array<{ name: string; bio?: string; photo?: string; designation?: string }>;
}

// ─── Core fetch ───────────────────────────────────────────────
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refreshToken = await AsyncStorage.getItem('auth_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          await setToken(refreshData.token);
          headers['Authorization'] = `Bearer ${refreshData.token}`;
          const retryRes = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
          return retryRes.json();
        }
      } catch {}
    }
    await clearToken();
  }

  return res.json();
}

// ─── Events API ───────────────────────────────────────────────
export const eventsApi = {
  getAll: (params?: Record<string, any>) => {
    const filtered = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'All')
    );
    const qs = Object.keys(filtered).length ? '?' + new URLSearchParams(filtered).toString() : '';
    return request<EventData[]>(`/events${qs}`);
  },
  getFeatured: () => request<EventData[]>('/events/featured'),
  getTrending: (city?: string) =>
    request<EventData[]>(`/events/trending${city ? `?city=${city}` : ''}`),
  search: (q: string, params?: Record<string, any>) => {
    const qs = new URLSearchParams({ q, ...(params || {}) }).toString();
    return request<EventData[]>(`/events/search?${qs}`);
  },
  searchAI: (q: string) => request<EventData[]>(`/events/ai-search?q=${encodeURIComponent(q)}`),
  getById: (id: string) => request<EventData>(`/events/${id}`),
  getByCity: (city: string, params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<EventData[]>(`/events/city/${city}${qs}`);
  },
  getByCategory: (category: string, params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<EventData[]>(`/events/category/${category}${qs}`);
  },
  getStats: () => request('/events/stats'),
  trackView: (id: string) => request(`/events/${id}/view`, { method: 'POST' }).catch(() => {}),
};

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string, cityPreference?: string) =>
    request<{ token: string; refreshToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, cityPreference }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; refreshToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<User>('/auth/me'),
  updateProfile: (data: Partial<User & { cityPreference: string; categoryPreferences: string[] }>) =>
    request<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  generateOTP: (email: string) =>
    request('/auth/generate-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOTP: (email: string, otp: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  toggle2FA: (enabled: boolean) =>
    request('/auth/toggle-2fa', { method: 'POST', body: JSON.stringify({ enabled }) }),
};

// ─── Bookmarks API ────────────────────────────────────────────
export const bookmarksApi = {
  getAll: (page = 1) => request<any[]>(`/bookmarks?page=${page}`),
  add: (eventId: string, note?: string) =>
    request(`/bookmarks/${eventId}`, { method: 'POST', body: JSON.stringify({ note }) }),
  remove: (eventId: string) => request(`/bookmarks/${eventId}`, { method: 'DELETE' }),
  check: (eventId: string) =>
    request<{ isBookmarked: boolean }>(`/bookmarks/${eventId}/check`),
};

// ─── Newsletter API ───────────────────────────────────────────
export const newsletterApi = {
  subscribe: (email: string) =>
    request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),
};
