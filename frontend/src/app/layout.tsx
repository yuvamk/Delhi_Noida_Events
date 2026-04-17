import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { UIProvider } from "@/contexts/UIContext";
import { Header } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/MainFooter";
import { GlobalOverlays } from "@/components/ui/GlobalOverlays";
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

import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script id="tailwind-config" dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    "error": "#ff6e84",
                    "surface-bright": "#2b2b35",
                    "on-secondary-fixed-variant": "#932e00",
                    "tertiary-fixed": "#00d2fd",
                    "tertiary-dim": "#00c3eb",
                    "tertiary-container": "#00d2fd",
                    "on-tertiary-fixed": "#002c37",
                    "primary-dim": "#8a4cfc",
                    "on-primary-fixed-variant": "#390083",
                    "on-error": "#490013",
                    "secondary-dim": "#ff7440",
                    "tertiary": "#6dddff",
                    "secondary-fixed-dim": "#ffb196",
                    "outline": "#76747d",
                    "primary": "#bd9dff",
                    "on-background": "#f5f2fb",
                    "surface-container-high": "#1f1f27",
                    "on-primary-container": "#2e006c",
                    "on-tertiary": "#004c5e",
                    "error-container": "#a70138",
                    "outline-variant": "#48474f",
                    "tertiary-fixed-dim": "#00c3eb",
                    "secondary": "#ff7440",
                    "on-surface-variant": "#acaab3",
                    "secondary-container": "#aa3600",
                    "primary-container": "#b28cff",
                    "surface-dim": "#0e0e14",
                    "primary-fixed-dim": "#a67aff",
                    "on-primary": "#3c0089",
                    "surface-tint": "#bd9dff",
                    "secondary-fixed": "#ffc4b1",
                    "inverse-surface": "#fcf8ff",
                    "on-primary-fixed": "#000000",
                    "on-tertiary-fixed-variant": "#004c5d",
                    "surface": "#0e0e14",
                    "inverse-primary": "#742fe5",
                    "on-secondary": "#400f00",
                    "on-error-container": "#ffb2b9",
                    "on-tertiary-container": "#004352",
                    "surface-container": "#191920",
                    "on-secondary-fixed": "#621c00",
                    "surface-container-low": "#13131a",
                    "surface-container-lowest": "#000000",
                    "on-surface": "#f5f2fb",
                    "primary-fixed": "#b28cff",
                    "on-secondary-container": "#fff6f3",
                    "surface-container-highest": "#25252e",
                    "surface-variant": "#25252e",
                    "background": "#0e0e14",
                    "error-dim": "#d73357",
                    "inverse-on-surface": "#55545c"
                  },
                  borderRadius: {
                    "DEFAULT": "1rem",
                    "lg": "2rem",
                    "xl": "3rem",
                    "full": "9999px"
                  },
                  fontFamily: {
                    "headline": ["Epilogue"],
                    "body": ["Inter"],
                    "label": ["Inter"]
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
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
      </body>
    </html>
  );
}
