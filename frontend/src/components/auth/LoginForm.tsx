"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/contexts/UIContext";
import { GoogleLogin } from '@react-oauth/google';

export function LoginForm() {
  const { login, generateOTP, verifyOTP, loginWithGoogleSuccess } = useAuth();
  const { closeModal, toggleLoginRegister } = useUI();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    
    if (!isOtpMode && !isVerifyingOtp && !password) e.password = "Password required";
    if (isVerifyingOtp && !otp) e.otp = "OTP required";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    
    try {
      if (isVerifyingOtp) {
        const ok = await verifyOTP(email, otp);
        if (ok) closeModal();
      } else if (isOtpMode) {
        const ok = await generateOTP(email);
        if (ok) setIsVerifyingOtp(true);
      } else {
        const result = await login(email, password);
        if (result === true) closeModal();
        else if (result === "OTP_REQUIRED") {
          setIsVerifyingOtp(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-surface-container/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl text-white">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl md:text-3xl font-headline font-black italic tracking-tighter uppercase leading-none">
          {isVerifyingOtp ? "Enter Code" : isOtpMode ? "OTP Access" : "The Scene Login"}
        </h1>
        <p className="text-[10px] text-on-surface-variant font-inter leading-tight uppercase tracking-widest font-black">
          {isVerifyingOtp 
            ? "We sent a secret code to your inbox." 
            : isOtpMode 
              ? "Sign in using your email - no password needed." 
              : "Access the most exclusive cultural map."}
        </p>
      </div>

      <div className="space-y-5">
        {!isVerifyingOtp && !isOtpMode && (
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
                text="signin_with"
                width="320"
              />
            </div>
            
            <div className="relative w-full py-2 flex items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 font-inter text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black">or sign in with</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isVerifyingOtp && (
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
          )}

          {!isVerifyingOtp && !isOtpMode && (
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
          )}

          {isVerifyingOtp && (
            <div className="space-y-1">
              <label className="font-inter text-[10px] font-black uppercase tracking-widest text-primary">6-Digit Secret Code</label>
              <input 
                type="text"
                value={otp}
                autoFocus
                onChange={(e) => { setOtp(e.target.value); setErrors((prev) => ({...prev, otp: ""}))}}
                className="w-full bg-white/5 border border-primary focus:border-secondary focus:ring-0 text-white py-4 px-4 rounded-xl transition-all duration-300 placeholder:text-on-surface-variant/30 font-headline text-center text-2xl tracking-[0.5em] font-black outline-none" 
                placeholder="000000" 
                maxLength={6}
              />
              {errors.otp && <p className="text-error text-[10px] font-black uppercase tracking-wider mt-1 text-center">{errors.otp}</p>}
              <button 
                type="button"
                onClick={() => { setIsVerifyingOtp(false); setIsOtpMode(false); }}
                className="w-full text-[9px] uppercase tracking-widest font-black text-on-surface-variant hover:text-white mt-4 transition-colors"
                >
                Go back to password?
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-secondary to-[#FF5E1A] py-3.5 rounded-xl text-white font-headline text-sm font-black tracking-wider shadow-[0_0_30px_rgba(255,116,64,0.2)] hover:shadow-[0_0_40px_rgba(255,116,64,0.4)] transform transition-all active:scale-[0.98] duration-200 uppercase disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
          >
            {submitting ? "Processing..." : isVerifyingOtp ? "Verify & Unlock" : isOtpMode ? "Send OTP" : "Sign In"}
          </button>
          
          {!isVerifyingOtp && (
            <button 
              type="button"
              onClick={() => setIsOtpMode(!isOtpMode)}
              className="w-full text-[9px] uppercase tracking-[0.2em] font-black text-on-surface-variant hover:text-primary transition-all duration-300"
            >
              {isOtpMode ? "Use Password Instead" : "Login with OTP instead?"}
            </button>
          )}
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
