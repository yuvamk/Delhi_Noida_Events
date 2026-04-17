"use client";
import { useState, useEffect } from "react";
import { adminApi, eventsApi, EventData } from "@/lib/api";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { StatsSkeleton } from "@/components/ui/LoadingSkeleton";
import { Zap, Users, BarChart2, Activity, Star, CheckCircle, RefreshCw, Trash2, Eye, AlertCircle, Play } from "lucide-react";
import toast from "react-hot-toast";

function StatCard({ label, value, icon, color = "#6366f1", sub }: any) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", alignItems: "flex-start", gap: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value ?? "—"}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function AdminContent() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [scraperStatus, setScraperStatus] = useState<any>(null);
  const [scraperLogs, setScraperLogs] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [triggeringScaper, setTriggeringScaper] = useState(false);
  const [tab, setTab] = useState<"overview" | "events" | "scraper" | "users">("overview");

  const load = async () => {
    setLoadingStats(true);
    const [statsRes, eventsRes, statusRes, logsRes] = await Promise.allSettled([
      adminApi.getStats(),
      eventsApi.getAll({ limit: 20, sort: "newest" }),
      adminApi.getScraperStatus(),
      adminApi.getScraperLogs(),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.success) setStats(statsRes.value.data);
    if (eventsRes.status === "fulfilled" && eventsRes.value.success) setEvents(eventsRes.value.data || []);
    if (statusRes.status === "fulfilled" && statusRes.value.success) setScraperStatus(statusRes.value.data);
    if (logsRes.status === "fulfilled" && logsRes.value.success) setScraperLogs(logsRes.value.data || []);
    setLoadingStats(false);
    setLoadingEvents(false);
  };

  useEffect(() => { load(); }, []);

  const triggerScraper = async (sources = ["all"]) => {
    setTriggeringScaper(true);
    const res = await adminApi.triggerScraper(sources);
    if (res.success) {
      toast.success(`Scraper started! Job: ${res.data?.jobId || "..."}`);
      setTimeout(load, 2000);
    } else {
      toast.error("Failed to trigger scraper");
    }
    setTriggeringScaper(false);
  };

  const handleToggleFeatured = async (id: string, title: string) => {
    const res = await adminApi.toggleFeatured(id);
    if (res.success) {
      toast.success(`"${title}" featured status updated`);
      setEvents((prev) => prev.map((e) => e._id === id ? { ...e, featured: !e.featured } : e));
    }
  };

  const handleToggleVerified = async (id: string) => {
    const res = await adminApi.toggleVerified(id);
    if (res.success) {
      toast.success("Event verification updated");
      setEvents((prev) => prev.map((e) => e._id === id ? { ...e, verified: !e.verified } : e));
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await eventsApi.delete(id);
    if (res.success) {
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e._id !== id));
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={14} /> },
    { id: "events", label: "Events", icon: <Activity size={14} /> },
    { id: "scraper", label: "Scraper", icon: <Zap size={14} /> },
    { id: "users", label: "Users", icon: <Users size={14} /> },
  ];

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh" }}>
      <div className="container-custom" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 24 }}>⚙️</span>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>Admin Dashboard</h1>
            </div>
            <p style={{ color: "#64748b" }}>Manage events, scraper, and platform analytics</p>
          </div>
          <button onClick={load} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 0 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                borderRadius: "10px 10px 0 0",
                border: "1px solid transparent",
                borderBottom: "none",
                background: tab === t.id ? "rgba(99,102,241,0.12)" : "transparent",
                color: tab === t.id ? "#a5b4fc" : "#64748b",
                fontSize: 14, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer",
                borderColor: tab === t.id ? "rgba(99,102,241,0.2)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {loadingStats ? <StatsSkeleton /> : stats ? (
              <>
                <div className="admin-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                  <StatCard label="Total Events" value={stats.events?.total?.toLocaleString()} icon={<Activity size={18} color="#6366f1" />} color="#6366f1" />
                  <StatCard label="Upcoming Events" value={stats.events?.upcoming?.toLocaleString()} icon={<Activity size={18} color="#22c55e" />} color="#22c55e" sub={`${stats.events?.free} free`} />
                  <StatCard label="Featured Events" value={stats.events?.featured?.toLocaleString()} icon={<Star size={18} color="#f59e0b" />} color="#f59e0b" />
                  <StatCard label="Total Users" value={stats.users?.total?.toLocaleString()} icon={<Users size={18} color="#06b6d4" />} color="#06b6d4" sub={`+${stats.users?.newThisWeek || 0} this week`} />
                  <StatCard label="Total Views" value={stats.engagement?.totalViews?.toLocaleString()} icon={<Eye size={18} color="#8b5cf6" />} color="#8b5cf6" />
                  <StatCard label="Total Bookmarks" value={stats.engagement?.totalBookmarks?.toLocaleString()} icon={<CheckCircle size={18} color="#ec4899" />} color="#ec4899" />
                </div>

                {/* By City */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  {["Delhi", "Noida"].map((city) => (
                    <div key={city} className="card" style={{ padding: 20 }}>
                      <h4 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>📍 {city}</h4>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#a5b4fc" }}>
                        {stats.byCity?.find((c: any) => c._id === city)?.count || 0}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>events</div>
                    </div>
                  ))}
                </div>

                {/* Top events */}
                {stats.topEvents?.length > 0 && (
                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🔥 Top Events by Views</h3>
                    {stats.topEvents.map((e: any) => (
                      <div key={e._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ flex: 1, fontSize: 14, color: "#f1f5f9", fontWeight: 500 }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>👁️ {e.viewCount}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>🔖 {e.bookmarkCount}</div>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{e.city}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                <AlertCircle size={40} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                <p>Could not load stats. Is the backend running?</p>
              </div>
            )}
          </>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === "events" && (
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 16 }}>Recent Events</h3>
              <span style={{ fontSize: 12, color: "#64748b" }}>Latest 20</span>
            </div>
            {loadingEvents ? (
              <div style={{ padding: 24 }}><StatsSkeleton /></div>
            ) : (
              <div className="admin-table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Title", "City", "Category", "Date", "Views", "Bookmarks", "Status", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                      >
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#f1f5f9", fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{event.city}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>{event.category}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{event.viewCount || 0}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{event.bookmarkCount || 0}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {event.featured && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: "#fcd34d", fontWeight: 600 }}>⭐</span>}
                            {event.verified && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: "rgba(34,197,94,0.15)", color: "#86efac", fontWeight: 600 }}>✓</span>}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleToggleFeatured(event._id, event.title)} title="Toggle featured" style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", fontSize: 14 }}>⭐</button>
                            <button onClick={() => handleToggleVerified(event._id)} title="Toggle verified" style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", fontSize: 14 }}>✓</button>
                            <button onClick={() => handleDelete(event._id, event.title)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SCRAPER TAB ── */}
        {tab === "scraper" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status + trigger */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 8, fontSize: 16 }}>Scraper Control</h3>
                  {scraperStatus?.currentlyRunning && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#f59e0b" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse-dot 1s infinite" }} />
                      Scraper is currently running...
                    </div>
                  )}
                  {scraperStatus?.nextScheduled && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      Next scheduled: {new Date(scraperStatus.nextScheduled).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[{ sources: ["all"], label: "🚀 Full Scrape" }, { sources: ["eventbrite"], label: "Eventbrite" }, { sources: ["meetup"], label: "Meetup" }, { sources: ["unstop"], label: "Unstop" }].map(({ sources, label }) => (
                    <button
                      key={label}
                      onClick={() => triggerScraper(sources)}
                      disabled={triggeringScaper}
                      className="btn btn-primary"
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: triggeringScaper ? 0.6 : 1 }}
                    >
                      <Play size={12} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Source status */}
            {scraperStatus?.sources && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>Source Status</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {scraperStatus.sources.map((s: any) => (
                    <div key={s.source} style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", textTransform: "capitalize" }}>{s.source}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                          background: s.lastRunStatus === "success" ? "rgba(34,197,94,0.15)" : s.lastRunStatus === "failed" ? "rgba(239,68,68,0.15)" : "rgba(107,114,128,0.15)",
                          color: s.lastRunStatus === "success" ? "#86efac" : s.lastRunStatus === "failed" ? "#fca5a5" : "#9ca3af"
                        }}>
                          {s.lastRunStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>DB: {s.totalEventsInDB} events</div>
                      {s.lastRun && <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>Last run: {new Date(s.lastRun).toLocaleString("en-IN")}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent logs */}
            {scraperLogs.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>Recent Logs</h4>
                {scraperLogs.map((log) => (
                  <div key={log._id || log.jobId} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, flex: "0 0 auto",
                      background: log.status === "success" ? "rgba(34,197,94,0.15)" : log.status === "failed" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      color: log.status === "success" ? "#86efac" : log.status === "failed" ? "#fca5a5" : "#fcd34d",
                    }}>{log.status}</span>
                    <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 500, textTransform: "capitalize" }}>{log.source}</span>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b", marginLeft: "auto", flexWrap: "wrap" }}>
                      <span>{log.eventsFound} found</span>
                      <span>{log.eventsInserted} inserted</span>
                      {log.durationMs && <span>{(log.durationMs / 1000).toFixed(1)}s</span>}
                      <span>{new Date(log.startedAt).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <p style={{ color: "#64748b" }}>User management coming soon. {stats?.users?.total || 0} total users registered.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}
