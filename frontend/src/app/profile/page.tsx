"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

type TabType = "account" | "security" | "payments" | "notifications";

export default function MyProfilePage() {
  const { user, isAuthenticated, logout, toggle2FA } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cityPreference: "",
    bio: "",
    avatar: ""
  });

  // Mounted check to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when user context loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        cityPreference: user.cityPreference || "",
        bio: user.bio || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading to Cloud...");
    try {
      const data = new FormData();
      data.append("image", file);
      
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`http://localhost:5005/api/v1/upload/avatar`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        setFormData({ ...formData, avatar: result.url });
        toast.success("Image uploaded!", { id: toastId });
      } else {
        toast.error("Upload failed.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error.", { id: toastId });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        avatar: formData.avatar,
        cityPreference: formData.cityPreference as any,
      });

      if (res.success) {
        toast.success("Profile synced successfully! ✨");
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch (err) {
      toast.error("Update failed");
    }
    setLoading(false);
  };

  if (!mounted) {
    return <main className="pt-32 pb-24 min-h-[80vh] bg-surface" />;
  }

  if (!isAuthenticated) {
    return (
      <main className="pt-32 pb-24 flex justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-headline font-black text-white uppercase tracking-widest italic">Encrypted Session Required</h2>
          <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Please sign in to access your digital Dossier.</p>
        </div>
      </main>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="md:col-span-2 space-y-3">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Cloud Identity Avatar</label>
                <div className="relative w-full border border-dashed border-white/5 hover:border-primary/40 transition-all duration-300 rounded-2xl p-6 flex items-center justify-center bg-white/[0.02] group active:scale-[0.99]">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <div className="flex gap-4 items-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">cloud_upload</span>
                    <span className="font-headline text-xs font-black text-on-surface-variant group-hover:text-white transition-colors uppercase tracking-widest">
                      {formData.avatar ? "Hologram Active (Click to Swap)" : "Upload Neural Identity"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Full Name</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 focus:border-primary transition-all duration-300 text-white rounded-xl py-4 px-5 text-sm font-inter outline-none" 
                  type="text" 
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-3">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Email Interface</label>
                <div className="w-full bg-white/[0.03] border border-white/5 text-on-surface-variant/50 rounded-xl py-4 px-5 text-sm font-inter flex items-center gap-3 italic">
                  <span className="material-symbols-outlined text-xs">lock</span>
                  {formData.email}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Phone frequency</label>
                <input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 focus:border-primary transition-all duration-300 text-white rounded-xl py-4 px-5 text-sm font-inter outline-none" 
                  type="text" 
                  placeholder="+91..."
                />
              </div>

              <div className="space-y-3">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Primary Hub (Location)</label>
                <input 
                  name="cityPreference" 
                  value={formData.cityPreference} 
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 focus:border-primary transition-all duration-300 text-white rounded-xl py-4 px-5 text-sm font-inter outline-none" 
                  type="text" 
                  placeholder="E.g., Delhi, Noida"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Neural Bio (Short Bio)</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 focus:border-primary transition-all duration-300 text-white rounded-xl py-4 px-5 text-sm font-inter outline-none resize-none" 
                  rows={4} 
                  placeholder="Sync your interests..."
                ></textarea>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 flex justify-end">
               <button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-gradient-to-r from-secondary to-[#FF5E1A] text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] italic shadow-[0_10px_40px_rgba(255,116,64,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Syncing..." : "Commit Changes"}
              </button>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 text-center md:text-left">
                   <h3 className="font-headline text-xl font-black uppercase tracking-tight italic">Two-Factor Authentication (2FA)</h3>
                   <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest max-w-sm">Every login will require a unique OTP sent to your registered email address.</p>
                </div>
                <button 
                  onClick={() => toggle2FA(!user?.twoFactorEnabled)}
                  className={`relative w-16 h-8 rounded-full transition-all duration-500 p-1 ${user?.twoFactorEnabled ? 'bg-primary shadow-[0_0_20px_rgba(189,157,255,0.4)]' : 'bg-white/10'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-500 ${user?.twoFactorEnabled ? 'translate-x-8' : 'translate-x-0'}`}></div>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                   <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined">devices</span>
                   </div>
                   <h4 className="font-headline font-black uppercase italic tracking-tight">Active Sessions</h4>
                   <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-relaxed">System tracked: Web Client (Mac OS)<br/>Last Ping: Just now</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                   <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">vpn_key</span>
                   </div>
                   <h4 className="font-headline font-black uppercase italic tracking-tight">Password Protocols</h4>
                   <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-relaxed">Status: Encrypted (SHA-256)<br/>Last Modified: 12 days ago</p>
                   <button className="text-secondary text-[9px] font-black uppercase tracking-[0.2em] border-b border-secondary/30 hover:border-secondary transition-all">Update Key</button>
                </div>
             </div>
          </div>
        );
      case "payments":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">add_card</span>
                </div>
                <div className="space-y-2">
                   <h3 className="font-headline text-2xl font-black uppercase tracking-tight italic">Payment Grid</h3>
                   <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest max-w-sm mx-auto">Vault is currently empty. Add a secure method for instant event bookings.</p>
                </div>
                <button className="bg-white/[0.05] border border-white/10 hover:border-primary/50 text-white px-8 py-3 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-300">
                   Add Verification Method
                </button>
             </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {[
               { id: 'n1', title: 'New Event Alerts', desc: 'Get notified as soon as a show is curated.' },
               { id: 'n2', title: 'Curator Messages', desc: 'Direct comms from scene organizers.' },
               { id: 'n3', title: 'VIBE Updates', desc: 'Personalized recommendations for your hub.' },
             ].map((n) => (
                <div key={n.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                   <div className="space-y-1">
                      <h4 className="font-headline font-black uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{n.title}</h4>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{n.desc}</p>
                   </div>
                   <div className="w-10 h-5 bg-primary/20 rounded-full relative p-0.5 cursor-pointer">
                      <div className="w-4 h-4 bg-primary rounded-full translate-x-5"></div>
                   </div>
                </div>
             ))}
          </div>
        );
    }
  };

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-[80vh]">
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-10 shrink-0">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <div className="relative group cursor-pointer inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
              {formData.avatar ? (
                <img className="relative w-40 h-40 rounded-full object-cover border-4 border-[#0e0e14] shadow-2xl z-10" src={formData.avatar} alt={formData.name} />
              ) : (
                <div className="relative w-40 h-40 rounded-full bg-white/5 flex items-center justify-center border-4 border-[#0e0e14] shadow-2xl z-10 font-headline font-black text-6xl text-white italic">
                  {formData.name?.[0]?.toUpperCase() || "X"}
                </div>
              )}
            </div>
            <div className="w-full">
              <h1 className="font-headline text-4xl font-black tracking-tighter uppercase text-white italic truncate leading-none mb-2">
                {formData.name || "UNNAMED"}
              </h1>
              <span className="bg-primary/10 text-primary text-[9px] font-black tracking-[0.3em] uppercase px-4 py-1.5 rounded-full border border-primary/20 italic">
                {user?.role === "admin" ? "CORE SYSTEM" : "ELECTRIC MEMBER"}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-3 w-full">
            {[
              { id: 'account', label: 'Dossier Info', icon: 'person' },
              { id: 'security', label: 'Encryptions', icon: 'security' },
              { id: 'payments', label: 'Credit Vault', icon: 'payments' },
              { id: 'notifications', label: 'Neural Pings', icon: 'notifications' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-5 px-6 py-5 rounded-2xl transition-all duration-300 group ${
                  activeTab === tab.id 
                  ? 'bg-white/5 border border-white/10 text-primary shadow-[0_0_40px_rgba(189,157,255,0.05)] translate-x-2' 
                  : 'text-on-surface-variant hover:text-white hover:bg-white/[0.02] hover:translate-x-1'
                }`}
              >
                <span className={`material-symbols-outlined transition-transform duration-300 ${activeTab === tab.id ? 'scale-125' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                <span className="font-headline text-xs font-black tracking-[0.2em] uppercase italic">{tab.label}</span>
              </button>
            ))}
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-6"></div>
            
            <button onClick={logout} className="flex items-center gap-5 px-6 py-5 rounded-2xl text-error-dim hover:bg-error/5 hover:text-error transition-all duration-300 uppercase italic font-black text-xs tracking-widest group">
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
              Disconnect
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 w-full mt-10 lg:mt-0">
          <div className="bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] -z-10 rounded-full"></div>
            
            <div className="mb-16">
              <h2 className="font-headline text-5xl font-black tracking-tighter uppercase mb-4 italic leading-none">
                {activeTab === 'account' ? 'Profile Interface' : activeTab === 'security' ? 'Security Node' : activeTab === 'payments' ? 'Financial Grid' : 'Neural Pings'}
              </h2>
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.3em] max-w-lg leading-relaxed italic">
                {activeTab === 'account' ? 'Modify your digital representation across the Neon ecosystem.' : 'Manage your encryption protocols and session security.'}
              </p>
            </div>
            
            {renderTabContent()}
          </div>
        </section>
      </div>
    </main>
  );
}
