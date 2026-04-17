"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTrendingEvents, useAISearchEvents } from "@/hooks/useEvents";
import { Search, X, Bolt, Music, Palette, Utensils, Martini, Theater, Gamepad2, PartyPopper, ChevronRight } from "lucide-react";
import { useUI } from "@/contexts/UIContext";

const QUICK_CATEGORIES = [
  { id: "Nightlife", label: "Nightlife", icon: Martini, color: "bg-primary/20 text-primary hover:bg-primary/30" },
  { id: "Comedy", label: "Standup", icon: Theater, color: "bg-secondary/20 text-secondary hover:bg-secondary/30" },
  { id: "Gaming", label: "Gaming", icon: Gamepad2, color: "bg-tertiary/20 text-tertiary hover:bg-tertiary/30" },
  { id: "Festivals", label: "Festivals", icon: PartyPopper, color: "bg-white/10 text-white hover:bg-white/20" },
];

const TRENDING_SEARCHES = [
  { label: "Hackathons", icon: Bolt, color: "bg-secondary-container text-on-secondary-container" },
  { label: "Concerts", icon: Music, color: "bg-tertiary-container text-on-tertiary-container" },
  { label: "Art Gallery", icon: Palette, color: "bg-surface-container-highest text-on-surface-variant" },
  { label: "Pop-up Kitchens", icon: Utensils, color: "bg-surface-container-highest text-on-surface-variant" },
];

export function SearchOverlay() {
  const router = useRouter();
  const { closeModal } = useUI();
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  // AI Discovery Hook
  const { events: aiResults, loading: aiLoading, total: aiTotal } = useAISearchEvents(activeQuery);

  // Trending Hook
  const { events: trendingEvents } = useTrendingEvents();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveQuery(searchInput);
    }
  };

  const handleEventClick = (id: string) => {
    closeModal();
    router.push(`/events/${id}`);
  };

  const handleCategoryClick = (id: string) => {
    closeModal();
    router.push(`/category/${id.toLowerCase()}`);
  };

  return (
    <div className="w-full h-full flex flex-col pt-20 px-4 md:px-24 lg:px-48 pb-10">
      {/* Centered Search Bar */}
      <section className="flex flex-col items-center justify-center py-6 md:py-12">
        <form onSubmit={handleSearch} className="w-full relative group max-w-4xl mx-auto">
          <input
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-surface-container/40 backdrop-blur-xl border border-white/10 rounded-full py-4 md:py-6 px-6 md:px-8 text-xl md:text-2xl font-headline italic tracking-tight focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-[0px_0px_30px_rgba(189,157,255,0.1)] transition-all duration-500 placeholder:text-on-surface-variant/40 text-white"
            placeholder="What are you looking for? (e.g. free techno events)"
            type="text"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
            {searchInput && (
              <button type="button" onClick={() => {setSearchInput(""); setActiveQuery("");}} className="text-on-surface-variant hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
            <Search className="text-primary" size={24} />
          </div>
        </form>
      </section>

      <div className="max-w-4xl mx-auto w-full">
        {/* Trending Tags */}
        <section className="mb-8 md:mb-12">
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <span className="h-px w-8 bg-secondary"></span>
            <h3 className="font-inter text-[10px] uppercase tracking-[0.2em] text-secondary font-black">Trending Now</h3>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {TRENDING_SEARCHES.map((item) => (
              <button
                key={item.label}
                onClick={() => { setSearchInput(item.label); setActiveQuery(item.label); }}
                className={`px-4 py-2 rounded-full ${item.color} font-inter text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:scale-105 transition-all duration-300 border border-white/5 shadow-lg active:scale-95`}
              >
                <item.icon size={12} />
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Quick Categories Grid */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-8 bg-primary"></span>
            <h3 className="font-inter text-[10px] uppercase tracking-[0.2em] text-primary font-black">Categories</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {QUICK_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-surface-container/20 backdrop-blur-lg p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer group hover:bg-surface-container/40 transition-all duration-300 transform active:scale-[0.98]"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <cat.icon size={20} />
                </div>
                <span className="font-headline font-black italic text-xs uppercase tracking-tighter text-white">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Search Results (AI Feed) */}
        <section className="min-h-[200px] mb-10 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-tertiary"></span>
              <h3 className="font-inter text-[10px] uppercase tracking-[0.2em] text-tertiary font-black">
                {activeQuery ? "AI Search Results" : "Featured Events"}
              </h3>
            </div>
          </div>

          {aiLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surface-container/20 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : (activeQuery ? aiResults : trendingEvents).length === 0 ? (
            <div className="text-center py-10 bg-surface-container/10 rounded-3xl border border-white/5">
              <div className="text-4xl mb-4 opacity-10">📡</div>
              <p className="text-on-surface-variant font-inter text-xs font-black uppercase tracking-[0.1em]">No signals detected in this range</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(activeQuery ? aiResults : trendingEvents).map((event) => (
                <div 
                  onClick={() => handleEventClick(event._id)}
                  key={event._id}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-surface-container-low/20 border border-white/5 hover:bg-surface-container/30 hover:border-white/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    {event.images?.[0] && (
                      <img 
                        src={event.images[0]} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h4 className="font-headline text-md font-black italic tracking-tight text-white group-hover:text-primary transition-colors truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-inter text-[8px] font-black uppercase tracking-widest text-on-surface-variant">
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-3">
                    <ChevronRight size={18} className="text-on-surface-variant group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
