/**
 * Central API Client — all frontend → backend calls go through here.
 * Base URL from env var, JWT token from localStorage, auto-refresh on 401.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Token helpers ────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string, refreshToken?: string) {
  localStorage.setItem("auth_token", token);
  if (refreshToken) localStorage.setItem("auth_refresh_token", refreshToken);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_refresh_token");
  localStorage.removeItem("auth_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

// ─── Types ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "moderator";
  avatar?: string;
  cityPreference?: string;
  categoryPreferences?: string[];
  isEmailVerified?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  pages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
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
  location?: { coordinates: [number, number] };
  price: { amount: number; currency: string; type: "Free" | "Paid" | "RSVP" };
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

// ─── Core fetch wrapper ───────────────────────────────────────
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Try refresh token
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("auth_refresh_token") : null;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          setToken(refreshData.token);
          headers["Authorization"] = `Bearer ${refreshData.token}`;
          const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers });
          return retryRes.json();
        }
      } catch {}
    }
    clearToken();
  }

  const data = await res.json();
  return data;
}

// ─── Events API ───────────────────────────────────────────────
export const eventsApi = {
  getAll: (params?: Record<string, any>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== "All"))
    ).toString() : "";
    return request<EventData[]>(`/events${qs}`);
  },

  getFeatured: () => request<EventData[]>("/events/featured"),
  getTrending: (city?: string) => request<EventData[]>(`/events/trending${city ? `?city=${city}` : ""}`),

  search: (q: string, params?: Record<string, any>) => {
    const qs = new URLSearchParams({ q, ...(params || {}) }).toString();
    return request<EventData[]>(`/events/search?${qs}`);
  },

  searchAI: (q: string) => {
    const qs = new URLSearchParams({ q }).toString();
    return request<EventData[]>(`/events/ai-search?${qs}`);
  },

  getById: (id: string) => request<EventData>(`/events/${id}`),
  getByCity: (city: string, params?: Record<string, any>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<EventData[]>(`/events/city/${city}${qs}`);
  },
  getByCategory: (category: string, params?: Record<string, any>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<EventData[]>(`/events/category/${category}${qs}`);
  },
  getStats: () => request("/events/stats"),

  // Admin
  create: (data: Partial<EventData>) => request<EventData>("/events", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<EventData>) => request<EventData>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/events/${id}`, { method: "DELETE" }),
  trackView: (id: string) => request(`/events/${id}/view`, { method: "POST" }).catch(() => {}),
};


// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string, cityPreference?: string) =>
    request<{ token: string; refreshToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, cityPreference }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; refreshToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<User>("/auth/me"),

  updateProfile: (data: Partial<User & { cityPreference: string; categoryPreferences: string[] }>) =>
    request<User>("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),
};

// ─── Bookmarks API ────────────────────────────────────────────
export const bookmarksApi = {
  getAll: (page = 1) => request<any[]>(`/bookmarks?page=${page}`),
  add: (eventId: string, note?: string) =>
    request(`/bookmarks/${eventId}`, { method: "POST", body: JSON.stringify({ note }) }),
  remove: (eventId: string) => request(`/bookmarks/${eventId}`, { method: "DELETE" }),
  check: (eventId: string) => request<{ isBookmarked: boolean }>(`/bookmarks/${eventId}/check`),
};

// ─── Analytics API ────────────────────────────────────────────
export const analyticsApi = {
  track: (action: string, data?: Record<string, any>) =>
    request("/analytics/track", { method: "POST", body: JSON.stringify({ action, ...data }) }).catch(() => {}),
  getSummary: (from = "7d") => request(`/analytics/summary?from=${from}`),
};

// ─── Admin API ────────────────────────────────────────────────
export const adminApi = {
  getStats: () => request("/admin/stats"),
  getUsers: (page = 1) => request(`/admin/users?page=${page}`),
  getScraperStatus: () => request("/admin/scraper/status"),
  getScraperLogs: (page = 1) => request(`/admin/scraper/logs?page=${page}`),
  triggerScraper: (sources: string[] = ["all"]) =>
    request("/admin/scraper/trigger", { method: "POST", body: JSON.stringify({ sources }) }),
  toggleFeatured: (id: string) => request(`/admin/events/${id}/feature`, { method: "PATCH" }),
  toggleVerified: (id: string) => request(`/admin/events/${id}/verify`, { method: "PATCH" }),
  cleanupEvents: (days = 30) => request(`/admin/events/cleanup?days=${days}`, { method: "DELETE" }),
};

// ─── Newsletter API ───────────────────────────────────────────
export const newsletterApi = {
  subscribe: (email: string) =>
    request("/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) }),
};

// ─── Metadata API ─────────────────────────────────────────────
export const metaApi = {
  getCategories: () => request("/categories"),
  getCities: () => request("/cities"),
  getHealth: () => request("/health"),
};
