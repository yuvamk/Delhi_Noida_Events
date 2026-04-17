"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi, getToken, setToken, clearToken, getStoredUser, setStoredUser, User } from "@/lib/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredUser();
    const token = getToken();
    if (stored && token) {
      setUser(stored);
      // Validate token with backend in background
      authApi.getMe().then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          setStoredUser(res.data);
        } else {
          clearToken();
          setUser(null);
        }
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        const { token, refreshToken, user: userData } = res.data as any;
        setToken(token, refreshToken);
        setStoredUser(userData);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}! 👋`);
        return true;
      } else {
        toast.error(res.error || "Login failed");
        return false;
      }
    } catch {
      toast.error("Network error. Please try again.");
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Google OAuth via backend redirect
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error("Google login not configured");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "email profile";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = url;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.register(name, email, password);
      if (res.success && res.data) {
        const { token, refreshToken, user: userData } = res.data as any;
        setToken(token, refreshToken);
        setStoredUser(userData);
        setUser(userData);
        toast.success("Account created! Welcome to DelhiNoidaEvents 🎉");
        return true;
      } else {
        toast.error(res.error || "Registration failed");
        return false;
      }
    } catch {
      toast.error("Network error. Please try again.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    clearToken();
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = "/";
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    setStoredUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin" || user?.role === "moderator",
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
