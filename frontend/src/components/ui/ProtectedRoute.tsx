"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackUrl?: string;
}

export function ProtectedRoute({ children, requireAdmin = false, fallbackUrl = "/auth/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "3px solid var(--color-border)",
            borderTop: "3px solid var(--color-accent-primary)", borderRadius: "50%",
            animation: "spin 1s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "var(--color-text-secondary)" }}>Verifying access...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push(`${fallbackUrl}?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-primary)", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 8 }}>Access Denied</h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>You don't have permission to view the admin dashboard.</p>
          <Link href="/" className="btn btn-primary">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
