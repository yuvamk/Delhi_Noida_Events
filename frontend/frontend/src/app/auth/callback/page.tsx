"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogleSuccess } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        toast.error(\`Auth Error: \${error}\`);
        router.push("/");
        return;
      }
      
      // Safety redirect if accessed directly
      setTimeout(() => {
        router.push("/");
      }, 2000);
    };

    handleAuth();
  }, [router, loginWithGoogleSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-headline font-black italic uppercase tracking-tighter text-white">Syncing with Google</h2>
          <p className="text-xs font-inter text-on-surface-variant font-black uppercase tracking-widest">Entering the cultural grid...</p>
        </div>
      </div>
    </div>
  );
}
