import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { UIProvider } from "@/contexts/UIContext";
import { Header } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/MainFooter";
import { GlobalOverlays } from "@/components/ui/GlobalOverlays";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://delhi-noida-events.vercel.app"),
  title: {
    default: "Delhi & Noida Events | Discover Your Next Experience",
    template: "%s | DelhiNoidaEvents",
  },
  description:
    "Discover the best events happening in Delhi and Noida — tech meetups, festivals, concerts, and more. Join the vibrant Delhi NCR community.",
  keywords: ["events in Delhi", "events in Noida", "Delhi events today", "tech meetups NCR"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "DelhiNoidaEvents",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        
      </head>
      <body className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <UIProvider>
              <Header />
              {children}
              <Footer />
              <GlobalOverlays />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "var(--color-bg-card)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  },
                  success: { iconTheme: { primary: "#22c55e", secondary: "var(--color-bg-card)" } },
                  error: { iconTheme: { primary: "#ef4444", secondary: "var(--color-bg-card)" } },
                }}
              />
            </UIProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
