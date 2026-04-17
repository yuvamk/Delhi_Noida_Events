"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/contexts/UIContext";

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const { closeModal, toggleLoginRegister } = useUI();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await login(email, password);
    if (ok) {
      closeModal();
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-surface-container/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl md:text-3xl font-headline font-black italic tracking-tighter uppercase leading-none">
          Welcome to the <br/>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pr-2 pb-1 inline-block">Electric Curator</span>
        </h1>
        <p className="text-[10px] text-on-surface-variant font-inter leading-tight uppercase tracking-widest font-bold">
          Access the most exclusive cultural map.
        </p>
      </div>

      <div className="space-y-5">
        {/* Social Login Cluster */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={loginWithGoogle} className="flex flex-col items-center justify-center gap-1 bg-surface-container border border-white/5 hover:border-white/20 transition-all duration-300 py-3 rounded-xl">
             <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-black text-white">Google</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 bg-surface-container border border-white/5 hover:border-white/20 transition-all duration-300 py-3 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="white">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
             </svg>
            <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-black text-white">Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative py-2 flex items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 font-inter text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black">or sign in with</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Email Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="font-inter text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80">Email</label>
            <input 
              type="email"
              value={email}
              autoFocus
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({...prev, email: ""}))}}
              className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white py-3 px-4 rounded-xl transition-all duration-300 placeholder:text-on-surface-variant/30 font-inter text-sm outline-none" 
              placeholder="curator@neon.in" 
            />
            {errors.email && <p className="text-error text-[10px] font-black uppercase tracking-wider mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-inter text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({...prev, password: ""}))}}
              className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white py-3 px-4 rounded-xl transition-all duration-300 placeholder:text-on-surface-variant/30 font-inter text-sm outline-none" 
              placeholder="••••••••" 
            />
            {errors.password && <p className="text-error text-[10px] font-black uppercase tracking-wider mt-1">{errors.password}</p>}
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-secondary to-secondary/80 py-3.5 rounded-xl text-on-secondary font-headline text-sm font-black tracking-wider shadow-[0_0_30px_rgba(255,116,64,0.2)] hover:shadow-[0_0_40px_rgba(255,116,64,0.4)] transform transition-all active:scale-[0.98] duration-200 uppercase disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-on-surface-variant font-inter text-[10px] font-black tracking-widest uppercase">
              New to the scene? 
              <button onClick={toggleLoginRegister} className="text-primary hover:text-white ml-2 transition-all">
                Create Account
              </button>
          </p>
        </div>
      </div>
    </div>
  );
}
