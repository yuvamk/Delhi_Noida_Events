"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, Share2, ExternalLink, Clock, Copy, Tag } from "lucide-react";
import { EventData, eventsApi } from "@/lib/api";
import { useEvents } from "@/hooks/useEvents";
import { useBookmarks } from "@/hooks/useBookmarks";
import { EventCard } from "@/components/events/EventCard";
import { EventsGridSkeleton } from "@/components/ui/LoadingSkeleton";
import EventMap from "@/components/events/EventMap";
import toast from "react-hot-toast";

const EMOJI: Record<string, string> = {
  Tech: "💻", Startup: "🚀", Cultural: "🎭", Business: "💼",
  Sports: "⚽", Education: "📚", Entertainment: "🎵",
  Hackathon: "⚡", Meetup: "🤝", Conference: "🎤",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getTimeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "Past event";
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
  return `In ${Math.floor(days / 30)} months`;
}

export function EventDetailClient({ event }: { event: EventData }) {
  const [activeImage, setActiveImage] = useState(0);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(event._id);

  // Track view
  useEffect(() => {
    eventsApi.trackView(event._id).catch(() => {});
  }, [event._id]);

  // Related events
  const { events: related, loading: relatedLoading } = useEvents({
    category: event.category,
    limit: 3,
    page: 1,
  });
  const relatedFiltered = related.filter((e) => e._id !== event._id).slice(0, 3);

  const handleBookmark = async () => {
    await toggleBookmark(event._id, event.title);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const timeUntil = getTimeUntil(event.date);
  const isPast = timeUntil === "Past event";

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date,
    endDate: event.endDate || event.date,
    location: { "@type": "Place", name: event.venue, address: event.address || `${event.city}, India` },
    organizer: { "@type": "Organization", name: event.organizer?.name || "Unknown" },
    image: event.images?.[0],
    offers: {
      "@type": "Offer",
      price: event.price?.amount || 0,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: event.registrationUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />

      <div className="min-h-screen bg-surface pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 font-inter overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href={`/category/${event.category.toLowerCase()}`} className="hover:text-white transition-colors">{event.category}</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold truncate">{event.title}</span>
          </nav>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
            
            {/* ─── LEFT COLUMN ─── */}
            <div>
              {/* Hero Image */}
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8 bg-surface-container border border-white/5">
                {event.images?.[0] ? (
                  <img src={event.images[activeImage] || event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-surface to-surface-container-high flex items-center justify-center text-8xl opacity-50">
                    {EMOJI[event.category] || "📅"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent pointer-events-none"></div>
                
                {/* Overlay badges */}
                <div className="absolute top-6 left-6 flex gap-3">
                  <span className="bg-primary text-on-primary-container px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    {event.category}
                  </span>
                  {event.featured && (
                    <span className="bg-tertiary/20 border border-tertiary text-tertiary px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                      ⭐ Featured
                    </span>
                  )}
                  {isPast && (
                    <span className="bg-error border border-error/50 text-onError px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                      Past Event
                    </span>
                  )}
                </div>
              </div>

              {/* Image thumbnails */}
              {event.images && event.images.length > 1 && (
                <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                  {event.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImage === i ? "border-primary scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & badges */}
              <div className="mb-10">
                <h1 className="font-headline text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {[
                    { icon: Calendar, text: formatDate(event.date) },
                    { icon: Clock, text: `${event.time || "TBD"}${timeUntil !== "Past event" ? ` (${timeUntil})` : ""}` },
                    { icon: MapPin, text: `${event.venue}, ${event.city}` },
                    ...(event.attendees ? [{ icon: Users, text: `${event.attendees.toLocaleString("en-IN")} attending` }] : []),
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
                      <Icon size={16} className="text-secondary" /> {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-10">
                  {event.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-white/5 text-xs font-bold text-on-surface-variant">
                      <Tag size={12} className="text-primary" /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="bg-surface-container border border-white/5 rounded-2xl p-8 mb-8">
                <h2 className="font-headline text-2xl font-black text-white mb-6">About This Setup</h2>
                <div className="text-on-surface-variant leading-loose font-inter whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-surface-container border border-white/5 rounded-2xl p-8 mb-8">
                <h2 className="font-headline text-2xl font-black text-white mb-6">Coordinates</h2>
                <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-6">
                  <MapPin size={16} className="text-secondary" /> {event.venue}, {event.address || event.city}
                </div>
                <div className="rounded-xl overflow-hidden border border-white/5">
                  <EventMap 
                    events={[event]} 
                    center={event.location?.coordinates ? [event.location.coordinates[1], event.location.coordinates[0]] : [28.6139, 77.2090]} 
                    zoom={15} 
                    height={300} 
                  />
                </div>
              </div>

              {/* Share buttons */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleCopyLink} className="bg-surface-container hover:bg-surface-container-high border border-white/10 text-white text-sm font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Copy size={16} /> Copy URL
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" className="bg-surface-container hover:bg-surface-container-high border border-white/10 text-[#1DA1F2] text-sm font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Share2 size={16} /> Twitter
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${event.title} - ${typeof window !== "undefined" ? window.location.href : ""}`)}`} target="_blank" rel="noopener noreferrer" className="bg-surface-container hover:bg-surface-container-high border border-white/10 text-[#25D366] text-sm font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Share2 size={16} /> WhatsApp
                </a>
              </div>
            </div>

            {/* ─── RIGHT SIDEBAR ─── */}
            <div className="sticky top-28">
              {/* Action Box */}
              <div className="bg-surface-container border border-white/5 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl blur-3xl pointer-events-none"></div>
                
                <div className="mb-6 relative z-10">
                  <div className={`font-headline text-4xl font-black mb-1 ${event.price?.type === "Free" ? "text-secondary" : "text-white"}`}>
                    {event.price?.type === "Free" ? "FREE" : event.price?.type === "RSVP" ? "RSVP" : `₹${event.price?.amount?.toLocaleString("en-IN")}`}
                  </div>
                  <div className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                    {event.capacity ? `${event.capacity.toLocaleString("en-IN")} total spots` : "Open access protocol"}
                  </div>
                </div>

                {/* Capacity bar */}
                {event.attendees && event.capacity && (
                  <div className="mb-8 relative z-10">
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all duration-1000 ${event.attendees / event.capacity > 0.85 ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min((event.attendees / event.capacity) * 100, 100)}%` }} />
                    </div>
                    <div className="text-xs font-bold text-on-surface-variant flex justify-between">
                      <span>{event.attendees.toLocaleString()} deployed</span>
                      <span>{Math.round((event.attendees / event.capacity) * 100)}% full</span>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="relative z-10">
                  {!isPast ? (
                    <>
                      <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="bg-primary text-on-primary-container font-black w-full py-4 rounded-xl flex items-center justify-center gap-2 mb-3 hover:scale-[1.02] transition-transform shadow-lg">
                        {event.price?.type === "Free" ? "Acquire Access" : event.price?.type === "RSVP" ? "Submit RSVP" : "Purchase Ticket"} <ExternalLink size={18} />
                      </a>
                      <button onClick={handleBookmark} className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${bookmarked ? "bg-secondary/10 border-secondary border text-secondary" : "bg-surface border border-white/10 hover:bg-surface-container-high text-white"}`}>
                        {bookmarked ? <><BookmarkCheck size={18} /> Saved to Arsenal</> : <><Bookmark size={18} /> Save for Later</>}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6 border border-white/5 rounded-xl bg-surface">
                      <div className="text-4xl mb-3 opacity-50">⏰</div>
                      <p className="text-on-surface-variant font-bold text-sm">Connection Terminated</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Organizer details */}
              {event.organizer?.name && (
                <div className="bg-surface-container border border-white/5 rounded-2xl p-6 mb-6">
                  <h3 className="font-headline text-lg font-black text-white mb-4 uppercase tracking-widest text-xs">Origin Protocol</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl font-black border border-primary/30">
                      {event.organizer.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white leading-tight">{event.organizer.name}</div>
                      {event.organizer.website && (
                        <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-secondary hover:text-white transition-colors">
                          Verify origin <ExternalLink size={10} className="inline" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Info Box */}
              <div className="bg-surface-container border border-white/5 rounded-2xl p-6">
                <h3 className="font-headline text-lg font-black text-white mb-4 uppercase tracking-widest text-xs">Extraction Data</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                    { label: "Matrix", value: event.time || "TBD" },
                    { label: "Location", value: event.city },
                    { label: "Class", value: event.category },
                    ...(event.source ? [{ label: "Node", value: event.source }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-xs font-bold text-on-surface-variant uppercase">{label}</span>
                      <span className="text-sm font-bold text-white text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Events */}
          <div className="mt-32 border-t border-white/5 pt-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="material-symbols-outlined text-secondary text-3xl">hub</span>
              <h2 className="font-headline text-3xl font-black text-white">Related Networks</h2>
            </div>
            
            {relatedLoading ? (
              <EventsGridSkeleton count={3} />
            ) : relatedFiltered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedFiltered.map((e) => <EventCard key={e._id} event={e} />)}
              </div>
            ) : (
              <p className="text-on-surface-variant bg-surface-container p-6 rounded-xl border border-white/5">No active localized networks detected.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
