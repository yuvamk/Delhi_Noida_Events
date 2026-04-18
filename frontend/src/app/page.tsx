"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFeaturedEvents, useTrendingEvents, usePlatformStats, useEvents } from "@/hooks/useEvents";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real data hooks
  const [activeCity, setActiveCity] = useState("All");
  const { events: featured, loading: loadingFeatured } = useFeaturedEvents();
  const { events: trending, loading: loadingTrending } = useTrendingEvents(activeCity !== "All" ? activeCity : undefined);
  const { events: upcoming, loading: loadingUpcoming } = useEvents({ page: 1, limit: 12 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden hero-mesh px-6">
        {/* City Toggle */}
        <div className="absolute top-32 z-10">
          <div className="flex bg-surface-container-highest/40 backdrop-blur-xl ghost-border p-1.5 rounded-full">
            <button 
              onClick={() => setActiveCity("Delhi")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm transition-all ${activeCity === "Delhi" ? "bg-white/10 text-white shadow-lg" : "text-on-surface-variant hover:bg-white/5"}`}>
              <span>🏙️</span> Delhi
            </button>
            <button 
              onClick={() => setActiveCity("Noida")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm transition-all ${activeCity === "Noida" ? "bg-white/10 text-white shadow-lg" : "text-on-surface-variant hover:bg-white/5"}`}>
              <span>🌆</span> Noida
            </button>
            <button 
              onClick={() => setActiveCity("All")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm transition-all ${activeCity === "All" ? "bg-white/10 text-white shadow-lg" : "text-on-surface-variant hover:bg-white/5"}`}>
              <span>📍</span> Both
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mt-16">
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter mb-8 text-gradient-electric">
            Discover Events <br /> In Delhi & Noida
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12 group">
            <form onSubmit={handleSearch} className="flex items-center bg-surface-container-highest/60 backdrop-blur-2xl rounded-full p-2 ghost-border group-hover:border-primary/30 transition-all shadow-2xl">
              <span className="material-symbols-outlined ml-6 text-on-surface-variant">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full px-4 text-lg text-on-surface placeholder:text-on-surface-variant/50" 
                placeholder="Concerts, Tech Summits, Art Walks..." 
                type="text" 
              />
              <button type="submit" className="bg-gradient-to-r from-secondary to-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all">
                Search
              </button>
            </form>
          </div>

          {/* Hero Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="font-headline text-2xl font-bold text-white">
                <AnimatedCounter value={15000} suffix="+" />
              </p>
              <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-1">Events</p>
            </div>
            <div className="text-center">
              <p className="font-headline text-2xl font-bold text-white">
                <AnimatedCounter value={2} suffix=" Cities" />
              </p>
              <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-1">Coverage</p>
            </div>
            <div className="text-center">
              <p className="font-headline text-2xl font-bold text-white">📅 Every 6h</p>
              <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-1">Updated</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 bg-surface px-6 md:px-12">
        <div className="flex justify-between items-end mb-12 max-w-7xl mx-auto">
          <div>
            <h2 className="font-headline text-4xl font-bold mb-2">Trending Now</h2>
            <p className="text-on-surface-variant text-lg">The pulse of NCR right this minute.</p>
          </div>
          <Link href="/events" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
            View All <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar max-w-[100vw] mx-auto xl:max-w-7xl">
          {loadingTrending ? (
             <div className="text-on-surface-variant">Loading trending curations...</div>
          ) : trending.map((event, i) => (
            <Link href={`/event/${event._id}`} key={event._id} className="min-w-[320px] md:min-w-[400px] snap-start group relative transition-all duration-500 hover:-translate-y-2 block">
              <div className="relative h-[500px] rounded-lg overflow-hidden bg-surface-container">
                <img 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src={event.images?.[0] || `https://picsum.photos/seed/${event._id}/600/800`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent"></div>
                <div className="absolute bottom-0 p-8 w-full">
                  <span className="inline-block bg-tertiary text-on-tertiary px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-4">
                    {i === 0 ? "LIVE NOW" : (event.category || "TRENDING")}
                  </span>
                  <h3 className="font-headline text-2xl font-bold text-white mb-2 leading-tight">{event.title}</h3>
                  <div className="flex items-center gap-4 text-on-surface-variant text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_today</span> 
                      {new Date(event.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-xs">location_on</span> 
                       {event.city}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {trending.length < 3 && !loadingTrending && (
             <Link href="/events/mock-event" className="min-w-[320px] md:min-w-[400px] snap-start group relative transition-all duration-500 hover:-translate-y-2 block">
                <div className="relative h-[500px] rounded-lg overflow-hidden bg-surface-container">
                  <img alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBekLdEFGjOD8zK4m3w1YPPPwjdr1IfnwvW4aLTX14hJ2GlckqML4mBzv7UDmc92s-Dg_p-3JgsUw_-accjdeov59EeVQlWk0Kmu4i5hQ7TRp7JHdeODc8mo_lmKGP7qFC-pO8dIfpOosKYrwzCz1yyD2tWGnezCF1VEIV8c1OJG6iAJv8rZS2oVSq5QjUNERqdykJiZElHy9SzXNeAZL1XTdL15-e2mLrVN42JHrDKlUbu3EEV0Y5xQghg7epR6L8EpCqNNgrxInE"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent"></div>
                  <div className="absolute bottom-0 p-8 w-full">
                    <span className="inline-block bg-primary text-on-primary-container px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-4">EXCLUSIVE</span>
                    <h3 className="font-headline text-2xl font-bold text-white mb-2 leading-tight">The Heritage Art Walk & Fair</h3>
                    <div className="flex items-center gap-4 text-on-surface-variant text-sm font-medium">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_today</span> 30 Oct</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> Old Delhi</span>
                    </div>
                  </div>
                </div>
              </Link>
          )}
        </div>
      </section>

      {/* Featured Organizers Section */}
      <section className="py-24 bg-surface-container-low px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="font-headline text-4xl font-bold mb-2">Curated Organizers</h2>
          <p className="text-on-surface-variant text-lg">The tastemakers behind the city's best experiences.</p>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 mx-auto max-w-7xl">
          <div className="min-w-[280px] bg-surface-container p-6 rounded-lg ghost-border flex items-center gap-4 hover:border-primary transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xl">ZP</div>
            <div>
              <h4 className="font-bold text-white">Zodiac Productions</h4>
              <p className="text-sm text-on-surface-variant">Electronic & Techno</p>
            </div>
          </div>
          <div className="min-w-[280px] bg-surface-container p-6 rounded-lg ghost-border flex items-center gap-4 hover:border-secondary transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center font-black text-secondary text-xl">HC</div>
            <div>
              <h4 className="font-bold text-white">Heritage Collective</h4>
              <p className="text-sm text-on-surface-variant">Culture & History</p>
            </div>
          </div>
          <div className="min-w-[280px] bg-surface-container p-6 rounded-lg ghost-border flex items-center gap-4 hover:border-tertiary transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center font-black text-tertiary text-xl">TF</div>
            <div>
              <h4 className="font-bold text-white">The Foundry</h4>
              <p className="text-sm text-on-surface-variant">Tech & Networking</p>
            </div>
          </div>
          <div className="min-w-[280px] bg-surface-container p-6 rounded-lg ghost-border flex items-center gap-4 hover:border-primary transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xl">MA</div>
            <div>
              <h4 className="font-bold text-white">Modern Art India</h4>
              <p className="text-sm text-on-surface-variant">Gallery & Fine Arts</p>
            </div>
          </div>
          <div className="min-w-[280px] bg-surface-container p-6 rounded-lg ghost-border flex items-center gap-4 hover:border-secondary transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center font-black text-secondary text-xl">EB</div>
            <div>
              <h4 className="font-bold text-white">Epicurean Box</h4>
              <p className="text-sm text-on-surface-variant">Food & Mixology</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 bg-surface px-6 md:px-12">
        <h2 className="font-headline text-4xl font-bold mb-16 text-center">Explore by Vibe</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <Link href="/category/tech" className="group relative p-8 rounded-lg bg-surface-container ghost-border hover:border-primary transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">memory</span>
            </div>
            <h4 className="font-headline text-xl font-bold mb-2">Tech & Startup</h4>
            <p className="text-on-surface-variant text-sm">Networking, hackathons, and demo days.</p>
          </Link>
          <Link href="/category/music" className="group relative p-8 rounded-lg bg-surface-container ghost-border hover:border-secondary transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-4xl">music_note</span>
            </div>
            <h4 className="font-headline text-xl font-bold mb-2">Music & Arts</h4>
            <p className="text-on-surface-variant text-sm">Live gigs, galleries, and theater.</p>
          </Link>
          <Link href="/category/food" className="group relative p-8 rounded-lg bg-surface-container ghost-border hover:border-tertiary transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary text-4xl">restaurant</span>
            </div>
            <h4 className="font-headline text-xl font-bold mb-2">Food & Drink</h4>
            <p className="text-on-surface-variant text-sm">Pop-ups, brewery tours, and tastings.</p>
          </Link>
          <Link href="/category/nightlife" className="group relative p-8 rounded-lg bg-surface-container ghost-border hover:border-primary transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">nightlife</span>
            </div>
            <h4 className="font-headline text-xl font-bold mb-2">Nightlife</h4>
            <p className="text-on-surface-variant text-sm">Clubbing, late-night lounges, and DJs.</p>
          </Link>
        </div>
      </section>

      {/* Community Stories Section (Masonry) */}
      <section className="py-24 bg-surface-container-low px-6 md:px-12">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h2 className="font-headline text-5xl font-black mb-4">The Editorial Pulse</h2>
          <p className="text-on-surface-variant text-xl">Diving deep into the subcultures of Delhi and Noida.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Article 1 */}
          <div className="group cursor-pointer">
            <div className="relative rounded-lg overflow-hidden mb-4 aspect-[4/5] bg-surface-container">
              <img alt="Tech culture" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMjBfILSJulWUycZrPEfsyw6JJdkjogqi6iVrf1pc94QHxh-qVLCZsL1RPDtlHiSwgf5GeOwT6ddTFwVPcLZzxod_VaCbjrS9XMi9KKL2CYWuqH19chB5pwi6c7r_eog8hM7jHEM42kux_YbgnJELbbhovKejVCd0agSfpvtU2aBNcFECNPiVJ3YfPvsi8S2YwdGcvEOCG-MkHPXtqJjy--JgVpO6LR5q93QNQft3Mxaivid4qZrMqcJ5TQbW_jqIqvyvf-kfpUGE"/>
              <div className="absolute top-4 left-4 bg-primary text-on-primary-container px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest">SUB-CULTURE</div>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2 leading-tight">The 3AM Coder: Noida's Midnight Innovation Hubs</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">Exploring the underground cafes where the next big unicorns are being built between midnight and dawn.</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10"></div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Words by Arjun Varma</span>
            </div>
          </div>
          {/* Article 2 */}
          <div className="group cursor-pointer">
            <div className="relative rounded-lg overflow-hidden mb-4 aspect-[4/5] bg-surface-container">
              <img alt="Music scene" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4yBQrnxJxiWUkGDti-vJlHww9W_Nr_UQT9Mhu7Tq8ojIyFiM7l4q2YwelQOPIL8rlUrIxSVl9RJ9OvlYxAmC6i1F0oGVIokRnEMz-vpIDBF6vk0ShqQTM7t8mprQygkv-uX49Ih7Xye_A-FGVuSkd6UeZGqc9X0ndzYCgeQ4hYUMl5APPwsXSOAE26zRAL5c5KnaWPDocq-Tdj15WPN3X-YqafzkLIKkzL-AIBOOst2ol0Qd_EA-UP4iV_yptseES2vkdO_wpaiA"/>
              <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest">MUSIC</div>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2 leading-tight">Neon & Noise: The Return of Warehouse Techno</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">How Delhi's industrial outskirts became the unexpected home for the country's most vibrant rave scene.</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10"></div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Words by Sarah Khan</span>
            </div>
          </div>
          {/* Article 3 */}
          <div className="group cursor-pointer">
            <div className="relative rounded-lg overflow-hidden mb-4 aspect-[4/5] bg-surface-container">
              <img alt="Art scene" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBekLdEFGjOD8zK4m3w1YPPPwjdr1IfnwvW4aLTX14hJ2GlckqML4mBzv7UDmc92s-Dg_p-3JgsUw_-accjdeov59EeVQlWk0Kmu4i5hQ7TRp7JHdeODc8mo_lmKGP7qFC-pO8dIfpOosKYrwzCz1yyD2tWGnezCF1VEIV8c1OJG6iAJv8rZS2oVSq5QjUNERqdykJiZElHy9SzXNeAZL1XTdL15-e2mLrVN42JHrDKlUbu3EEV0Y5xQghg7epR6L8EpCqNNgrxInE"/>
              <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest">URBAN ART</div>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2 leading-tight">Murals of the Metro: A Gallery Without Walls</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">Tracing the stories behind the giant street art pieces transforming our daily commute into a visual journey.</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10"></div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Words by Devika Singh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary/20 via-surface-container to-secondary/20 rounded-lg p-10 md:p-16 relative overflow-hidden ghost-border">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-lg text-center md:text-left">
              <h2 className="font-headline text-4xl font-black mb-4">Never Miss a Pulse.</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">Join 50k+ urbanites receiving curated weekly lists of the best happenings in NCR. Direct to your inbox.</p>
            </div>
            <div className="w-full md:w-auto">
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input required className="bg-black/40 border-b-2 border-white/10 focus:border-primary focus:ring-0 px-6 py-4 rounded-lg text-white w-full sm:w-80" placeholder="email@address.com" type="email"/>
                <button type="submit" className="bg-white text-black font-black px-10 py-4 rounded-full hover:scale-105 transition-all">JOIN NOW</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
