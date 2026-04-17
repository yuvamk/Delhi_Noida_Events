"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/contexts/UIContext";
import { Search, Bell } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { openSearch, openLogin } = useUI();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0e0e14]/60 backdrop-blur-md border-b border-white/5">
      <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-none mx-auto">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-black text-white flex items-center gap-1.5 after:content-[''] after:w-1.5 after:h-1.5 after:bg-secondary after:rounded-full font-headline tracking-tighter italic">
            DE·NE
          </Link>
          <nav className="hidden lg:flex gap-8">
            <Link href="/" className={`${pathname === '/' ? 'text-primary font-black italic tracking-tight' : 'text-on-surface-variant hover:text-white transition-colors'} font-headline text-sm uppercase`}>Explore</Link>
            <Link href="/events" className={`${pathname === '/events' ? 'text-primary font-black italic tracking-tight' : 'text-on-surface-variant hover:text-white transition-colors'} font-headline text-sm uppercase`}>All Events</Link>
            <Link href="/delhi-events" className={`${pathname === '/delhi-events' ? 'text-primary font-black italic tracking-tight' : 'text-on-surface-variant hover:text-white transition-colors'} font-headline text-sm uppercase`}>Delhi</Link>
            <Link href="/noida-events" className={`${pathname === '/noida-events' ? 'text-primary font-black italic tracking-tight' : 'text-on-surface-variant hover:text-white transition-colors'} font-headline text-sm uppercase`}>Noida</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 md:gap-7">
          {/* Global Search Trigger */}
          <button 
            onClick={openSearch}
            className="p-2 md:p-2.5 rounded-full bg-white/5 border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all group active:scale-95"
          >
            <Search size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button className="hidden md:block text-on-surface-variant hover:text-primary transition-colors">
            <Bell size={20} />
          </button>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
               <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-black italic text-primary text-xs shadow-[0_0_15px_rgba(189,157,255,0.2)]">
                  {user?.name?.[0]?.toUpperCase()}
               </div>
               <button onClick={logout} className="hidden md:block text-on-surface-variant/60 hover:text-error transition-colors font-black text-[10px] uppercase tracking-widest">Logout</button>
            </div>
          ) : (
            <button 
              onClick={openLogin}
              className="bg-primary hover:bg-primary-container text-on-primary-container px-5 md:px-7 py-2.5 md:py-3 rounded-full font-headline text-xs font-black uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(189,157,255,0.2)]"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

