"use client";
import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

// Fallback logic
const mockStats = {
  events: { total: 1284, upcoming: 140 },
  users: { total: 42800 },
  revenue: "8.2M",
  recentScraperLogs: []
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt real fetch, fall back nicely
    adminApi.getStats()
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setStats(mockStats);
        }
      })
      .catch((err) => {
        console.warn("Backend safe mode or 401. Falling back to mock data.", err);
        setStats(mockStats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Safe destructuring
  const totalEvents = stats?.events?.total || mockStats.events.total;
  const activeUsers = stats?.users?.total || mockStats.users.total;
  const revenue = stats?.revenue || mockStats.revenue; 

  const recentScraperLogs = stats?.recentScraperLogs || mockStats.recentScraperLogs;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.15)] border border-primary/10">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Total Events</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-headline font-black text-white">
              {totalEvents.toLocaleString()}
            </h3>
            <span className="text-tertiary text-xs font-bold">+12% ↑</span>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-white/5">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Active Users</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-headline font-black text-white">
              {activeUsers >= 1000 ? (activeUsers / 1000).toFixed(1) + 'k' : activeUsers.toLocaleString()}
            </h3>
            <span className="text-tertiary text-xs font-bold">+5.4% ↑</span>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-white/5">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Revenue (INR)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-headline font-black text-white">
              {revenue}
            </h3>
            <span className="text-secondary text-xs font-bold">-2.1% ↓</span>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-[0_0_20px_rgba(251,146,60,0.15)] border border-secondary/10">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Scraper Status</p>
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </div>
            <h3 className="text-2xl font-headline font-black text-white uppercase italic">Pulsing</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant/60 mt-2 font-mono uppercase tracking-tighter">Last ping: 2s ago</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Growth Chart */}
        <div className="lg:col-span-2 bg-surface/70 backdrop-blur-md border border-white/5 p-8 rounded-lg">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-headline font-bold text-white tracking-tight">Event Growth Velocity</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-variant text-[10px] font-bold rounded-md text-on-surface-variant">DAILY</span>
              <span className="px-3 py-1 bg-primary text-[10px] font-bold rounded-md text-on-primary">WEEKLY</span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2 relative">
            <div className="flex-grow bg-white/5 rounded-t h-[30%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary/20 h-full group-hover:bg-primary/40 transition-all rounded-t"></div>
            </div>
            <div className="flex-grow bg-white/5 rounded-t h-[45%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary/20 h-full group-hover:bg-primary/40 transition-all rounded-t"></div>
            </div>
            <div className="flex-grow bg-white/5 rounded-t h-[60%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary/20 h-full group-hover:bg-primary/40 transition-all rounded-t"></div>
            </div>
            <div className="flex-grow bg-white/5 rounded-t h-[55%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary/20 h-full group-hover:bg-primary/40 transition-all rounded-t"></div>
            </div>
            <div className="flex-grow bg-white/5 rounded-t h-[80%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary h-full rounded-t shadow-[0_0_20px_rgba(124,58,237,0.4)]"></div>
            </div>
            <div className="flex-grow bg-white/5 rounded-t h-[70%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary/20 h-full group-hover:bg-primary/40 transition-all rounded-t"></div>
            </div>
            <div className="flex-grow bg-white/5 rounded-t h-[90%] relative group transition-all duration-300">
              <div className="absolute bottom-0 w-full bg-primary/20 h-full group-hover:bg-primary/40 transition-all rounded-t"></div>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant font-bold tracking-widest px-2">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-surface p-8 rounded-lg flex flex-col border border-white/5">
          <h2 className="text-xl font-headline font-bold text-white tracking-tight mb-8">Categories</h2>
          <div className="flex-grow flex items-center justify-center relative">
            <div className="w-40 h-40 rounded-full border-[10px] border-surface-variant flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[10px] border-primary border-l-transparent border-b-transparent rotate-45"></div>
              <div className="absolute inset-0 rounded-full border-[10px] border-secondary border-t-transparent border-r-transparent border-l-transparent -rotate-12"></div>
              <div className="text-center">
                <span className="block text-3xl font-black font-headline text-white">8</span>
                <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest leading-tight">Active<br/>Segments</span>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-xs font-medium text-on-surface-variant">Techno/Nightlife</span>
              </div>
              <span className="text-xs font-bold text-white">42%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <span className="text-xs font-medium text-on-surface-variant">Live Gigs</span>
              </div>
              <span className="text-xs font-bold text-white">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                <span className="text-xs font-medium text-on-surface-variant">Art & Culture</span>
              </div>
              <span className="text-xs font-bold text-white">30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detailed Table */}
        <div className="lg:col-span-8 bg-surface rounded-lg overflow-hidden flex flex-col border border-white/5">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-sm font-headline font-bold text-white uppercase tracking-[0.2em]">Recent Submissions</h2>
            <button className="text-primary text-xs font-bold hover:opacity-80 transition-opacity">VIEW ALL RECORDS</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-slate-900/50">
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-white">Echoes of Noida Vol. 4</div>
                    <div className="text-[10px] text-on-surface-variant font-medium">Submitted 2h ago</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-tertiary">Instagram Graph API</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-tighter">Pending</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[85%]"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-white">more_horiz</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-white">Midnight Terrace Jazz</div>
                    <div className="text-[10px] text-on-surface-variant font-medium">Submitted 4h ago</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-tertiary">BookMyShow Hub</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-tertiary/10 text-tertiary border border-tertiary/20 uppercase tracking-tighter">Approved</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[98%]"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-white">more_horiz</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-white">Underground Bassment</div>
                    <div className="text-[10px] text-on-surface-variant font-medium">Submitted 6h ago</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-tertiary">Direct Submission</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-tighter">Flagged</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[22%]"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-white">more_horiz</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Scraper Control & Terminal Widget */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface p-6 rounded-lg border border-white/5">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">terminal</span>
              Scraper Engine
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-surface-variant rounded font-bold text-[10px] hover:bg-slate-700 transition-colors border-b-2 border-tertiary tracking-widest text-white">
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                RESUME
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-surface-variant rounded font-bold text-[10px] hover:bg-slate-700 transition-colors border-b-2 border-red-500 tracking-widest text-white">
                <span className="material-symbols-outlined text-sm">stop</span>
                HALT
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-60">
                <span>Queue Depth</span>
                <span className="text-white">1,402 tasks</span>
              </div>
              <div className="w-full h-1 bg-surface-variant rounded-full">
                <div className="bg-secondary h-full w-2/3 shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
              </div>
            </div>
          </div>

          {/* Live Terminal Feel */}
          <div className="flex-grow min-h-[160px] bg-slate-950 rounded-lg p-4 font-mono text-[9px] overflow-hidden border border-white/5 flex flex-col">
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              <span className="ml-auto text-[7px] text-white/30 uppercase font-bold tracking-widest">SESSION: 4A2B9F</span>
            </div>
            <div className="space-y-1 opacity-70 flex-grow">
              {recentScraperLogs.map((log: any, idx: number) => (
                <p key={idx} className="text-tertiary">[14:02:11] LOG: {log.source} - {log.status}</p>
              ))}
              <p className="text-tertiary">[14:02:11] INITIALIZING SOCIAL_SCRAPER_V2...</p>
              <p className="text-white/40">[14:02:12] AUTH_SUCCESS: Instagram Provider</p>
              <p className="text-white/40">[14:02:15] SCANNING: #DelhiTechno #NoidaRaves</p>
              <p className="text-secondary">[14:02:18] FOUND: 12 potential event strings</p>
              <p className="text-white/40">[14:02:22] PARSING: "Warehouse 11 Event Details"</p>
              <p className="text-primary">[14:02:25] MAPPING: Venue_ID {`->`} Noida_Sec144</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-primary tracking-tighter">{`>>>`}</span>
                <span className="animate-pulse w-1.5 h-3 bg-primary"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
