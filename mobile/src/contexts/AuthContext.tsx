import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  authApi,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  User,
} from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean | 'OTP_REQUIRED'>;
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
    (async () => {
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            await setStoredUser(res.data);
          } else {
            await clearToken();
            setUser(null);
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean | 'OTP_REQUIRED'> => {
      try {
        const res = await authApi.login(email, password);
        if (res.success) {
          if ((res as any).otpRequired) return 'OTP_REQUIRED';
          const { token, refreshToken, user: userData } = res as any;
          await setToken(token, refreshToken);
          await setStoredUser(userData);
          setUser(userData);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        const res = await authApi.register(name, email, password);
        if (res.success) {
          const { token, refreshToken, user: userData } = res as any;
          await setToken(token, refreshToken);
          await setStoredUser(userData);
          setUser(userData);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    authApi.logout().catch(() => {});
    await clearToken();
    setUser(null);
  }, []);

  const generateOTP = useCallback(async (email: string): Promise<boolean> => {
    const res = await authApi.generateOTP(email);
    return !!res.success;
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    const res = await authApi.verifyOTP(email, otp);
    if (res.success) {
      const { token, refreshToken, user: userData } = res as any;
      await setToken(token, refreshToken);
      await setStoredUser(userData);
      setUser(userData);
      return true;
    }
    return false;
  }, []);

  const toggle2FA = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      const res = await authApi.toggle2FA(enabled);
      if (res.success && user) {
        const updated = { ...user, twoFactorEnabled: !!enabled };
        setUser(updated);
        await setStoredUser(updated);
        return true;
      }
      return false;
    },
    [user]
  );

  const updateUser = useCallback(async (updated: User) => {
    setUser(updated);
    await setStoredUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'moderator',
        login,
        register,
        logout,
        updateUser,
        generateOTP,
        verifyOTP,
        toggle2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
