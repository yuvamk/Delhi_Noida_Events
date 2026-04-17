"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 overflow-hidden">
      <div className="flex h-screen overflow-hidden">
        {/* SideNavBar Component */}
        <aside className="hidden md:flex h-screen w-72 border-r border-white/5 bg-slate-950 flex-col gap-4 py-8 px-4 flex-shrink-0 relative z-10">
          <div className="mb-8 px-4">
            <h2 className="text-lg font-bold text-primary font-headline tracking-[0.2em] uppercase">Control Center</h2>
            <p className="text-on-surface-variant text-[10px] font-medium tracking-widest mt-1 opacity-70">DE·NE by Kinetik</p>
          </div>
          <nav className="flex-grow space-y-1">
            <Link 
              href="/admin" 
              className={`flex items-center gap-4 py-3 px-4 rounded-r-lg transition-all duration-200 ease-in-out ${pathname === '/admin' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined">grid_view</span>
              <span className="text-sm font-semibold tracking-wide">Analytics</span>
            </Link>
            <Link 
              href="#" 
              className="flex items-center gap-4 py-3 px-4 rounded-r-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">layers</span>
              <span className="text-sm font-semibold tracking-wide">Events</span>
            </Link>
            <Link 
              href="#" 
              className="flex items-center gap-4 py-3 px-4 rounded-r-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">confirmation_number</span>
              <span className="text-sm font-semibold tracking-wide">Tickets</span>
            </Link>
            <Link 
              href="#" 
              className="flex items-center gap-4 py-3 px-4 rounded-r-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">diversity_3</span>
              <span className="text-sm font-semibold tracking-wide">Organizers</span>
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-4 py-3 px-4 rounded-r-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-semibold tracking-wide">Settings</span>
            </Link>
          </nav>
          
          <div className="mt-auto px-4">
            <button className="w-full py-4 bg-secondary text-on-secondary rounded-lg font-bold text-sm shadow-[0px_10px_30px_rgba(251,146,60,0.2)] active:scale-95 transition-transform">
              Create New Event
            </button>
            <div className="mt-8 flex items-center gap-3">
              <img 
                alt="Admin User Profile" 
                className="w-10 h-10 rounded-full object-cover border border-primary/20" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCmOKkmh_7EQC3ilj5i4N-TG2_hA3TuAexkC7CDt7pXR-MlJdPK4_ubx5sNHMwRkh-ffr0nFHjLQzTT1qbso0GJClZqJsBWofG50Oz7JofFioT8Jt6WJDRlSxrjuqsgHwDGFHHO8rcnCZ8Mco8Id4xKHtPa1q3wrBTQpWZnoEmraKo4luFbYfe9-W-GI7EIeST3eLn4U8fgcnGJPSLj3q6dMRM2cxasRuq5hbSX_Hx8cbJ3XQk-WWF5LOds4A7gusYb7OtIeLbrbI"
              />
              <div>
                <p className="text-sm font-bold text-on-surface">Yuvam</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">System Architect</p>
              </div>
            </div>
            <p className="mt-6 text-[8px] text-center text-on-surface-variant/40 tracking-widest uppercase">Built by DE·NE</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto no-scrollbar relative bg-background flex flex-col pt-safe pb-24 md:pb-0">
          {/* TopAppBar Component */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 w-full border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-black italic tracking-tighter text-white font-headline">DE·NE</Link>
              <div className="hidden md:flex gap-6 mt-1">
                <span className="text-secondary border-b-2 border-secondary pb-1 font-bold tracking-tight uppercase text-xs">Overview</span>
                <span className="text-on-surface-variant hover:text-white transition-all duration-300 font-bold tracking-tight uppercase text-xs cursor-pointer">Live View</span>
                <span className="text-on-surface-variant hover:text-white transition-all duration-300 font-bold tracking-tight uppercase text-xs cursor-pointer">Reports</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative hidden lg:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input 
                  className="bg-surface-variant/50 border border-outline/20 rounded-lg focus:border-primary transition-colors pl-10 pr-4 py-2 text-sm w-64 outline-none text-white placeholder:text-on-surface-variant/50" 
                  placeholder="Search data points..." 
                  type="text"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="relative text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full border border-background"></span>
                </button>
                <button className="text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
              </div>
            </div>
          </header>

          <div className="flex-grow">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <nav className="fixed bottom-0 w-full rounded-t-2xl border-t border-white/10 z-50 bg-slate-900/90 backdrop-blur-xl flex justify-around items-center h-20 px-6 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <Link href="/admin" className="flex flex-col items-center text-secondary drop-shadow-[0_0_8px_rgba(251,146,60,0.4)] transition-all scale-110 duration-300">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="font-bold text-[9px] uppercase tracking-widest mt-1">Analytics</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-on-surface-variant/60 hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined">layers</span>
            <span className="font-bold text-[9px] uppercase tracking-widest mt-1">Events</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-on-surface-variant/60 hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="font-bold text-[9px] uppercase tracking-widest mt-1">Tickets</span>
          </Link>
          <Link href="/" className="flex flex-col items-center text-on-surface-variant/60 hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined">first_page</span>
            <span className="font-bold text-[9px] uppercase tracking-widest mt-1">Exit</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
