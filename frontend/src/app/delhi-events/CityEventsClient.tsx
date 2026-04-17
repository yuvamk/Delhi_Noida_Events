"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, X } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { EventsGridSkeleton } from "@/components/ui/LoadingSkeleton";

const CATEGORIES = ["Tech","Startup","Cultural","Business","Sports","Education","Entertainment","Hackathon","Meetup","Conference"];

const cityData = {
  Delhi: { emoji: "🏛️", color: "text-primary", bg: "bg-surface", keywordPhrase: "Events in Delhi 2025", desc: "India's capital & the hub of culture, politics, tech, and endless events." },
  Noida: { emoji: "🌆", color: "text-tertiary", bg: "bg-surface", keywordPhrase: "Events in Noida 2025", desc: "NCR's silicon valley — home to startups, IT companies, and vibrant events." },
};

interface Props { city: "Delhi" | "Noida"; }

export default function CityEventsClient({ city }: Props) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { events, total, pages, loading } = useEvents({
    city,
    category: categoryFilter !== "All" ? categoryFilter : undefined,
    price_type: priceFilter !== "All" ? priceFilter : undefined,
    sort: "date",
    page,
    limit: 12,
  });

  const data = cityData[city];

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Hero Banner */}
      <div className={`relative overflow-hidden pt-32 pb-24 border-b border-white/5`}>
         <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-12 font-inter">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className={`${data.color} font-bold`}>{city} Events</span>
          </nav>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            <div className="text-8xl md:text-9xl opacity-80 filter drop-shadow-2xl">{data.emoji}</div>
            <div>
              <h1 className="font-headline text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                {data.keywordPhrase}
              </h1>
              <p className="text-on-surface-variant text-xl max-w-2xl leading-relaxed mb-6 font-inter">
                {data.desc}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold bg-surface-container w-fit px-4 py-2 rounded-full border border-white/5 shadow-lg">
                <span className={`material-symbols-outlined ${data.color} text-lg`}>location_on</span>
                <span className="text-white">{loading ? 'Syncing...' : `${total} Pulses Active`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16">
        {/* Category chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 mb-4 mt-2">
          {["All", ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1); }} className={`
              px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border
              ${categoryFilter === cat 
                ? `bg-primary/10 border-primary ${data.color}` 
                : "bg-surface-container border-white/5 text-on-surface-variant hover:text-white hover:border-white/20"}
            `}>
              {cat}
            </button>
          ))}
        </div>

        {/* Price + count row */}
        <div className="flex flex-wrap items-center gap-4 mb-12 pb-6 border-b border-white/5">
          {["All", "Free", "Paid", "RSVP"].map((p) => (
            <button key={p} onClick={() => { setPriceFilter(p); setPage(1); }} className={`
              px-5 py-2 rounded-lg text-sm font-bold transition-all border
              ${priceFilter === p 
                ? "bg-secondary/10 border-secondary text-secondary" 
                : "bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high"}
            `}>
              {p === "All" ? "Any Access" : p}
            </button>
          ))}
          {(categoryFilter !== "All" || priceFilter !== "All") && (
            <button onClick={() => { setCategoryFilter("All"); setPriceFilter("All"); setPage(1); }} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-error transition-colors">
              <X size={14} /> Clear filters
            </button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <EventsGridSkeleton count={8} />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        ) : (
          <div className="text-center py-32 bg-surface-container rounded-2xl border border-white/5">
             <div className="text-6xl mb-6 opacity-50">{data.emoji}</div>
            <h3 className="font-headline text-3xl font-bold text-white mb-3">Silent Zone</h3>
            <p className="text-on-surface-variant mb-8 font-inter">No experiences found for your specific vibe in {city}.</p>
            <button onClick={() => { setCategoryFilter("All"); setPriceFilter("All"); }} className="bg-primary text-on-primary-container font-black px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Clear Filters
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

        {/* SEO Content */}
        <div className="mt-32 p-10 bg-surface-container rounded-2xl border border-white/5 relative overflow-hidden">
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <h2 className="font-headline text-2xl font-bold text-white mb-4 relative z-10">
            The {city} Scene
          </h2>
          <p className="text-on-surface-variant leading-relaxed text-sm md:text-base font-inter max-w-4xl relative z-10">
            {city === "Delhi"
              ? "Delhi, India's capital city, is a vibrant hub of events spanning technology, culture, business, and entertainment. From world-class tech conferences at Pragati Maidan to intimate startup meetups in Gurugram, Delhi hosts thousands of events every month. Our platform aggregates the pulse of the city so you never miss a beat."
              : "Noida, part of the National Capital Region, has emerged as one of India's fastest-growing tech hubs. Home to major IT companies, startups, and educational institutions like Amity University, Noida hosts a growing calendar of tech meetups, hackathons, business conclaves, and cultural events. We curate the best of the best."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
