"use client";
import { useState } from "react";
import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { EventsGridSkeleton } from "@/components/ui/LoadingSkeleton";

const CITIES = ["Delhi", "Noida"];

interface Props { category: string; emoji: string; }

export default function CategoryClient({ category, emoji }: Props) {
  const [cityFilter, setCityFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { events, total, pages, loading } = useEvents({
    category,
    city: cityFilter !== "All" ? cityFilter : undefined,
    sort: "date",
    page,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Hero */}
      <div className={`relative overflow-hidden pt-32 pb-24 border-b border-white/5`}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-12 font-inter">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-secondary font-bold">{category}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            <div className="text-8xl md:text-9xl opacity-80 filter drop-shadow-2xl">{emoji}</div>
            <div>
              <h1 className="font-headline text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                {category} Events in <span className="text-secondary">Delhi-NCR</span>
              </h1>
              <div className="flex items-center gap-2 text-sm font-bold bg-surface-container w-fit px-4 py-2 rounded-full border border-white/5 shadow-lg">
                <span className={`material-symbols-outlined text-secondary text-lg`}>bolt</span>
                <span className="text-white">{total} {category.toLowerCase()} events discovered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16">
        {/* City filter */}
        <div className="flex flex-wrap items-center gap-4 mb-12 pb-6 border-b border-white/5">
          {["All", ...CITIES].map((city) => (
            <button key={city} onClick={() => { setCityFilter(city); setPage(1); }} className={`
              px-6 py-2.5 rounded-full text-sm font-bold transition-all border
              ${cityFilter === city 
                ? "bg-secondary/10 border-secondary text-secondary" 
                : "bg-surface-container border-white/5 text-on-surface-variant hover:text-white hover:border-white/20"}
            `}>
              {city === "All" ? "All Cities" : `📍 ${city}`}
            </button>
          ))}
          <span className="text-on-surface-variant text-sm ml-auto font-bold flex items-center">
            {loading ? "Loading..." : `${total} results`}
          </span>
        </div>

        {/* Events Grid */}
        {loading ? (
          <EventsGridSkeleton count={8} />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        ) : (
          <div className="text-center py-32 bg-surface-container rounded-2xl border border-white/5">
            <div className="text-6xl mb-6 opacity-50">{emoji}</div>
            <h3 className="font-headline text-3xl font-bold text-white mb-3">No {category} events in {cityFilter === "All" ? "Delhi-NCR" : cityFilter}</h3>
            <p className="text-on-surface-variant mb-8 font-inter">Check back soon — our scraper pulses the network every 6 hours.</p>
            <button onClick={() => setCityFilter("All")} className="bg-primary text-on-primary-container font-black px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Show All Cities
            </button>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-20">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-10 h-10 rounded-full bg-surface-container ghost-border flex items-center justify-center text-white disabled:opacity-30 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p > pages) return null;
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${p === page ? 'bg-primary text-on-primary-container' : 'bg-surface-container border border-white/5 text-on-surface-variant hover:text-white'}`}>
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
