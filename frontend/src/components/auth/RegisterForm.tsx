"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/contexts/UIContext";

import { GoogleLogin } from '@react-oauth/google';

const CITIES = ["Both", "Delhi", "Noida"];

export function RegisterForm() {
  const { register, loginWithGoogleSuccess } = useAuth();
  const { closeModal, toggleLoginRegister } = useUI();
  
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "Both" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = "Name too short";
    if (!form.email) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password || form.password.length < 8) e.password = "Min 8 characters needed";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await register(form.name, form.email, form.password);
    if (ok) {
      closeModal();
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto bg-surface-container/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl md:text-3xl font-headline font-black italic tracking-tighter uppercase leading-none">
          Join the <br/>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pr-2 pb-1 inline-block">Electric Curator</span>
        </h1>
        <p className="text-[10px] text-on-surface-variant font-inter leading-tight uppercase tracking-widest font-bold">
          Register your presence in the network.
        </p>
      </div>

      <div className="space-y-4">
         {/* Social Cluster */}
         <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    loginWithGoogleSuccess(credentialResponse.credential).then(() => closeModal());
                  }
                }}
                onError={() => {
                  console.error('Login Failed');
                }}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signup_with"
                width="320"
              />
            </div>
            
            <div className="relative w-full py-2 flex items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 font-inter text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black">or sign up with</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>
          </div>

        {/* Form Fields */}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3">
             <div className="space-y-1">
                <label className="font-inter text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80">Full Name</label>
                <input 
                  type="text"
                  value={form.name}
                  autoFocus
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white py-2 px-3 rounded-lg transition-all text-xs outline-none" 
                  placeholder="Your Name" 
                />
             </div>
             <div className="space-y-1">
                <label className="font-inter text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80">Email</label>
                <input 
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white py-2 px-3 rounded-lg transition-all text-xs outline-none" 
                  placeholder="curator@neon.in" 
                />
             </div>
          </div>

          <div className="space-y-1">
            <label className="font-inter text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80">Password (8+ Char)</label>
            <input 
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-0 text-white py-2 px-3 rounded-lg transition-all text-xs outline-none" 
              placeholder="••••••••" 
            />
          </div>

          <div className="space-y-1 pt-1">
            <label className="font-inter text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80">Primary City</label>
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("city", c)}
                  className={`flex-1 py-1 px-2 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
                    form.city === c
                      ? "bg-primary text-on-primary-container shadow-md"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-secondary to-secondary/80 py-3 rounded-xl text-on-secondary font-headline text-sm font-black tracking-wider shadow-[0_0_20px_rgba(255,116,64,0.1)] hover:shadow-[0_0_30px_rgba(255,116,64,0.3)] transform transition-all active:scale-[0.98] duration-200 uppercase disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
          >
            {submitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-on-surface-variant font-inter text-[10px] font-black tracking-widest uppercase">
              Already mapped? 
              <button onClick={toggleLoginRegister} className="text-primary hover:text-white ml-2 transition-all">
                Sign In
              </button>
          </p>
        </div>
      </div>
    </div>
  );
}
