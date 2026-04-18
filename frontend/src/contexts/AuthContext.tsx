"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi, getToken, setToken, clearToken, getStoredUser, setStoredUser, User } from "@/lib/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean | "OTP_REQUIRED">;
  loginWithGoogleSuccess: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  generateOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  toggle2FA: (enabled: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    const token = getToken();
    if (stored && token) {
      setUser(stored);
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

  const login = useCallback(async (email: string, password: string): Promise<boolean | "OTP_REQUIRED"> => {
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        if ((res as any).otpRequired) {
           toast("Please enter the OTP sent to your email", { icon: "📧" });
           return "OTP_REQUIRED";
        }
        const { token, refreshToken, user: userData } = res as any;
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

  const loginWithGoogleSuccess = useCallback(async (credential: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });
      const result = await res.json();
      if (result.success) {
        const { token, refreshToken, user: userData } = result;
        setToken(token, refreshToken);
        setStoredUser(userData);
        setUser(userData);
        toast.success(`Logged in with Google! Welcome, ${userData.name} ✨`);
      } else {
        toast.error(result.error || "Google login failed");
      }
    } catch (error) {
      toast.error("Google authentication failed");
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.register(name, email, password);
      if (res.success) {
        const { token, refreshToken, user: userData } = res as any;
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
  
  const generateOTP = useCallback(async (email: string): Promise<boolean> => {
    const res = await authApi.generateOTP(email);
    if (res.success) {
      toast.success("OTP sent to your email!");
      return true;
    }
    toast.error(res.error || "Failed to send OTP");
    return false;
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    const res = await authApi.verifyOTP(email, otp);
    if (res.success) {
      const { token, refreshToken, user: userData } = res as any;
      setToken(token, refreshToken);
      setStoredUser(userData);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      return true;
    }
    toast.error(res.error || "Invalid OTP");
    return false;
  }, []);

  const toggle2FA = useCallback(async (enabled: boolean): Promise<boolean> => {
    const res = await authApi.toggle2FA(enabled);
    if (res.success) {
      toast.success(`2FA ${enabled ? "enabled" : "disabled"} successfully!`);
      if (user) {
        const updated = { ...user, twoFactorEnabled: !!enabled };
        setUser(updated);
        setStoredUser(updated);
      }
      return true;
    }
    toast.error(res.error || "Failed to update 2FA status");
    return false;
  }, [user]);

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
      loginWithGoogleSuccess,
      register,
      logout,
      updateUser,
      generateOTP,
      verifyOTP,
      toggle2FA,
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
