"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?modal=register");
  }, [router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-headline font-black italic uppercase tracking-widest text-on-surface-variant text-sm">Forging Digital Identity...</p>
      </div>
    </div>
  );
}
