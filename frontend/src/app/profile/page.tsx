"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { User, Mail, MapPin, Bell, Lock, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const CATEGORIES = ["Tech", "Startup", "Cultural", "Business", "Sports", "Education", "Entertainment", "Hackathon", "Meetup", "Conference"];

function ProfileContent() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: "", cityPreference: "Both", categoryPreferences: [] as string[] });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [tab, setTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", cityPreference: (user as any).cityPreference || "Both", categoryPreferences: (user as any).categoryPreferences || [] });
    }
  }, [user]);

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categoryPreferences: prev.categoryPreferences.includes(cat)
        ? prev.categoryPreferences.filter((c) => c !== cat)
        : [...prev.categoryPreferences, cat],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await authApi.updateProfile(form as any);
    if (res.success && res.data) {
      updateUser(res.data);
      toast.success("Profile updated!");
    } else {
      toast.error(res.error || "Failed to update");
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error("Passwords don't match"); return; }
    if (passwordForm.newPass.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setChangingPass(true);
    const res = await authApi.changePassword(passwordForm.current, passwordForm.newPass);
    if (res.success) { toast.success("Password changed!"); setPasswordForm({ current: "", newPass: "", confirm: "" }); }
    else toast.error(res.error || "Failed to change password");
    setChangingPass(false);
  };

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh", paddingTop: 40, paddingBottom: 80 }}>
      <div className="container-custom" style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", textDecoration: "none", fontSize: 14, marginBottom: 16 }}>
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white" }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>{user?.name}</h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>{user?.email}</p>
              {user?.role === "admin" && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: "#fcd34d", fontWeight: 600, border: "1px solid rgba(245,158,11,0.2)" }}>
                  ⭐ Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[{ id: "profile", icon: <User size={14} />, label: "Profile" }, { id: "security", icon: <Lock size={14} />, label: "Security" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, border: `1px solid ${tab === t.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`, background: tab === t.id ? "rgba(99,102,241,0.12)" : "transparent", color: tab === t.id ? "#a5b4fc" : "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <User size={16} color="#6366f1" /> Basic Info
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 6, display: "block" }}>Display Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 6, display: "block" }}>Email (read-only)</label>
                  <input type="email" value={user?.email || ""} disabled className="input" style={{ opacity: 0.5 }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={16} color="#6366f1" /> Preferences
              </h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 10, display: "block" }}>Preferred City</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Both", "Delhi", "Noida"].map((c) => (
                    <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, cityPreference: c }))} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: `1px solid ${form.cityPreference === c ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, background: form.cityPreference === c ? "rgba(99,102,241,0.15)" : "transparent", color: form.cityPreference === c ? "#a5b4fc" : "#64748b", transition: "all 0.2s" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 10, display: "block" }}>Interested Categories</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${form.categoryPreferences.includes(cat) ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, background: form.categoryPreferences.includes(cat) ? "rgba(99,102,241,0.15)" : "transparent", color: form.categoryPreferences.includes(cat) ? "#a5b4fc" : "#64748b", transition: "all 0.2s" }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : <><Save size={14} /> Save Changes</>}
            </button>
          </form>
        )}

        {tab === "security" && (
          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={16} color="#6366f1" /> Change Password
              </h3>
              {[
                { key: "current", label: "Current Password", placeholder: "Enter current password" },
                { key: "newPass", label: "New Password", placeholder: "Min. 8 characters" },
                { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 6, display: "block" }}>{label}</label>
                  <input type="password" value={(passwordForm as any)[key]} onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="input" />
                </div>
              ))}
              <button type="submit" disabled={changingPass} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, opacity: changingPass ? 0.7 : 1 }}>
                {changingPass ? "Updating..." : <><Lock size={14} /> Update Password</>}
              </button>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#f87171", marginBottom: 16, fontSize: 15 }}>Danger Zone</h3>
              <button type="button" onClick={logout} className="btn" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13 }}>
                Sign Out of All Devices
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
