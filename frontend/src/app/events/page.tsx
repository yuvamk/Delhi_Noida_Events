"use client";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Grid, List, ChevronDown, X, Search } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { EventsGridSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

const CATEGORIES = ["Tech","Startup","Cultural","Business","Sports","Education","Entertainment","Hackathon","Meetup","Conference"];
const CITIES = ["Delhi","Noida"];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function EventsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "All",
    category: searchParams.get("category") || "All",
    priceType: "All",
    sort: searchParams.get("sort") || "date",
    search: searchParams.get("q") || "",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const debouncedSearch = useDebounce(filters.search, 400);

  const { events, total, pages, loading } = useEvents({
    city: filters.city !== "All" ? filters.city : undefined,
    category: filters.category !== "All" ? filters.category : undefined,
    price_type: filters.priceType !== "All" ? filters.priceType : undefined,
    sort: filters.sort,
    q: debouncedSearch || undefined,
    page,
    limit: 12,
  });

  const activeFilterCount = [
    filters.city !== "All",
    filters.category !== "All",
    filters.priceType !== "All",
  ].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setFilters((f) => ({ ...f, city: "All", category: "All", priceType: "All", search: "" }));
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
        
        {/* Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 font-inter">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold">All Events</span>
          </nav>
          
          <div className="flex justify-between items-end flex-wrap gap-6">
            <div>
              <h1 className="font-headline text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
                The <span className="text-gradient-electric">Curated</span> List
              </h1>
              <p className="text-on-surface-variant text-lg">
                {loading ? "Syncing pulse..." : <><strong className="text-primary">{total}</strong> experiences ready for discovery.</>}
              </p>
            </div>
            
            <div className="flex gap-4 items-center flex-wrap">
              {/* View mode toggle */}
              <div className="flex bg-surface-container rounded-full p-1 ghost-border">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-full transition-all ${viewMode === "grid" ? "bg-primary text-white" : "text-on-surface-variant hover:text-white"}`}>
                  <Grid size={18} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-full transition-all ${viewMode === "list" ? "bg-primary text-white" : "text-on-surface-variant hover:text-white"}`}>
                  <List size={18} />
                </button>
              </div>
              
              <button onClick={() => setShowFilters(!showFilters)} className="relative flex items-center gap-2 bg-surface-container hover:bg-surface-container-high transition-colors text-white px-6 py-2.5 rounded-full font-bold text-sm ghost-border shadow-lg">
                <SlidersHorizontal size={16} /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <select value={filters.sort} onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); setPage(1); }} className="bg-surface-container text-white px-5 py-2.5 rounded-full text-sm font-bold appearance-none ghost-border pr-10 cursor-pointer focus:ring-0 outline-none">
                  <option value="date" className="bg-surface-container-high">Sort: Upcoming</option>
                  <option value="popular" className="bg-surface-container-high">Sort: Popular</option>
                  <option value="views" className="bg-surface-container-high">Sort: Most Viewed</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-8 group">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search events, venues, organizers..."
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
            className="w-full bg-surface-container text-on-surface px-6 py-4 pl-14 rounded-full ghost-border focus:border-primary/50 focus:ring-0 transition-all font-inter placeholder:text-on-surface-variant/50"
          />
          {filters.search && (
            <button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-surface-container p-6 md:p-8 rounded-2xl mb-8 flex flex-wrap gap-6 items-end ghost-border shadow-2xl">
            {[
              { label: "Origin City", key: "city", options: ["All", ...CITIES] },
              { label: "Vibe", key: "category", options: ["All", ...CATEGORIES] },
              { label: "Access", key: "priceType", options: ["All", "Free", "Paid", "RSVP"] },
            ].map(({ label, key, options }) => (
              <div key={key} className="flex-1 min-w-[160px]">
                <label className="block text-xs font-black text-on-surface-variant mb-2 uppercase tracking-widest">{label}</label>
                <div className="relative">
                  <select value={filters[key as keyof typeof filters]} onChange={(e) => { setFilters({ ...filters, [key]: e.target.value }); setPage(1); }} className="w-full bg-surface text-white px-4 py-3 rounded-lg appearance-none border border-white/5 focus:border-primary focus:ring-0 text-sm">
                    {options.map((opt) => <option key={opt} value={opt} className="bg-surface">{opt}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
            ))}
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="h-[46px] px-6 rounded-lg text-on-surface-variant hover:text-error transition-colors text-sm font-bold flex items-center gap-2">
                <X size={16} /> Reset
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {filters.city !== "All" && (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wide">
                <span>🏙️</span> {filters.city}
                <button onClick={() => { setFilters({ ...filters, city: "All" }); setPage(1); }} className="hover:text-white transition-colors"><X size={12} /></button>
              </span>
            )}
            {filters.category !== "All" && (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold tracking-wide">
                <span>🎭</span> {filters.category}
                <button onClick={() => { setFilters({ ...filters, category: "All" }); setPage(1); }} className="hover:text-white transition-colors"><X size={12} /></button>
              </span>
            )}
            {filters.priceType !== "All" && (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs font-bold tracking-wide">
                <span>🎟️</span> {filters.priceType}
                <button onClick={() => { setFilters({ ...filters, priceType: "All" }); setPage(1); }} className="hover:text-white transition-colors"><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Events grid */}
        {loading ? (
          <EventsGridSkeleton count={12} />
        ) : events.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {events.map((event) => (
              <EventCard key={event._id} event={event} variant={viewMode === "list" ? "compact" : "default"} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-surface-container rounded-2xl ghost-border mt-8">
            <div className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</div>
            <h3 className="font-headline text-3xl font-bold text-white mb-2">No pulses found</h3>
            <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
              {filters.search ? `We couldn't track down "${filters.search}". ` : ""}Try adjusting your filters to discover something new.
            </p>
            <button onClick={clearAll} className="bg-primary text-on-primary-container font-black px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16 pb-8">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-10 h-10 rounded-full bg-surface-container ghost-border flex items-center justify-center text-white disabled:opacity-30 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(7, pages) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page - 3 + i;
              if (p > pages || p < 1) return null;
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${p === page ? 'bg-primary text-on-primary-container' : 'bg-surface-container ghost-border text-on-surface-variant hover:text-white'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="w-10 h-10 rounded-full bg-surface-container ghost-border flex items-center justify-center text-white disabled:opacity-30 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        )}
      </div>
    </div>
  );
}
