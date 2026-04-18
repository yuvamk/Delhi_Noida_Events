"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { EventData, eventsApi } from "@/lib/api";
import { useBookmarks } from "@/hooks/useBookmarks";
import { format, parseISO } from "date-fns";
import { EventMap } from "@/components/events/EventMap";
import toast from "react-hot-toast";

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy").toUpperCase();
  } catch (e) {
    return dateStr;
  }
}

export function EventDetailClient({ event }: { event: EventData }) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(event._id);

  useEffect(() => {
    eventsApi.trackView(event._id).catch(() => {});
  }, [event._id]);

  const handleBookmark = async () => {
    await toggleBookmark(event._id, event.title);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

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
    <div className="bg-background min-h-screen pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />

      {/* Hero Section */}
      <header className="relative w-full h-[870px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${event.images?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuCPdtRYsO8R33GaXNSXDoRoxx1O4LL7ndnnIchr2TaRZnnv8QcJB_sndpP216cGZO0aPChhuCWuhLfDm7TqmMvP3aGjkQu1YRTXzmdhXZwi8dl-PvpiD6gika9yTVT--EO-oGl1MgDuteJtrvFok5AkRgyl7_sEsK9KQEECHj4AiyEWHauUtCRgaFeYPodpiBPAHwQmFNTubA4Ji7FBlKF6hCJBhnEOLzM9b_lOAUMRECLlRb-qAmWeYaQRlHKuAxMZwIQc8NcnUl0"}')` }}
        ></div>
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase font-label">{event.category}</span>
              {event.featured && (
                <span className="bg-surface-container-highest text-tertiary px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase font-label">Exclusive Access</span>
              )}
            </div>
            <h1 className="font-headline font-black italic text-6xl md:text-9xl tracking-tighter text-primary leading-none mb-4">{event.title}</h1>
            <p className="text-on-surface-variant font-headline text-lg md:text-2xl max-w-2xl tracking-tight">
              {event.shortDescription || "The ultimate nocturnal intersection of local sound and soul."}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Meta Info Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Date</span>
                <p className="font-headline text-xl font-bold">{formatDate(event.date)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Time</span>
                <p className="font-headline text-xl font-bold">{event.time || "TBD"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Venue</span>
                <p className="font-headline text-lg font-bold truncate max-w-full" title={event.venue}>{event.venue}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Organizer</span>
                <p className="font-headline text-lg font-bold truncate max-w-full" title={event.organizer?.name}>{event.organizer?.name || "Independent"}</p>
              </div>
            </section>

            {/* About Section */}
            <section className="space-y-6">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">About This Event</h2>
              <div className="space-y-4 text-on-surface-variant text-lg leading-relaxed whitespace-pre-wrap font-body">
                {event.description}
              </div>
            </section>

            {/* Agenda Section */}
            {event.speakers && event.speakers.length > 0 && (
              <section className="space-y-8">
                <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Agenda</h2>
                <div className="space-y-0 border-l border-white/10 ml-4">
                  {event.speakers.map((speaker, idx) => (
                    <div key={idx} className="relative pl-10 pb-12 group last:pb-0">
                      <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(109,221,255,0.5)] group-hover:scale-125 transition-transform ${idx % 3 === 0 ? "bg-tertiary" : idx % 3 === 1 ? "bg-primary" : "bg-secondary"}`}></div>
                      <div className="space-y-1">
                        <span className={`font-headline text-sm font-bold tracking-tighter uppercase ${idx % 3 === 0 ? "text-tertiary" : idx % 3 === 1 ? "text-primary" : "text-secondary"}`}>Main Activation</span>
                        <h3 className="text-xl font-bold font-headline">{speaker.name}</h3>
                        <p className="text-on-surface-variant">{speaker.bio || speaker.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Location Section */}
            <section className="space-y-6">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Location</h2>
              {event.location?.coordinates ? (
                <div className="rounded-2xl overflow-hidden ghost-border bg-surface-container relative group">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates[1]},${event.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative"
                  >
                    <EventMap 
                      coordinates={event.location.coordinates as [number, number]} 
                      title={event.title} 
                      venue={event.venue} 
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                      <div className="bg-primary text-on-primary-container px-6 py-3 rounded-full font-black text-sm opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-2xl pointer-events-none">
                        OPEN IN GOOGLE MAPS
                      </div>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="bg-surface-container-low p-12 rounded-lg text-center border border-white/5">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">location_off</span>
                  <p className="text-on-surface-variant">Coordinates not available for this venue.</p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.address || event.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-primary font-bold hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}
            </section>
            
          </div>

          {/* Right Column: Sticky Card */}
          <div className="lg:col-span-4 lg:block">
            <div className="sticky top-28 space-y-6">
              
              <div className="glass-card rounded-lg p-8 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">Ticket Price</p>
                    <h2 className="text-5xl font-black font-headline text-on-surface">
                      {event.price?.type === "Free" ? "FREE" : event.price?.type === "RSVP" ? "RSVP" : `₹${event.price?.amount?.toLocaleString("en-IN")}`}
                    </h2>
                  </div>
                  {event.capacity && event.attendees && (event.attendees / event.capacity > 0.7) && (
                    <div className="bg-secondary/10 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="text-secondary text-[10px] font-bold uppercase tracking-tight">Selling fast!</span>
                    </div>
                  )}
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 items-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-tertiary scale-75">check_circle</span>
                    Entry for 1 Guest
                  </li>
                  <li className="flex gap-3 items-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-tertiary scale-75">check_circle</span>
                    Digital Event Access
                  </li>
                  <li className="flex gap-3 items-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-tertiary scale-75">check_circle</span>
                    {event.capacity ? `Limited to ${event.capacity} total capacity` : "Open access protocol"}
                  </li>
                </ul>

                <div className="space-y-3">
                    <a href={event.registrationUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full py-5 rounded-full saffron-gradient text-white font-headline font-black text-lg tracking-tight flex justify-center items-center shadow-[0px_10px_30px_rgba(255,94,26,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 text-center">
                        {event.price?.type === "Free" ? "Register Now" : "Purchase Ticket"}
                    </a>
                    
                    <div className="flex gap-2">
                        <button onClick={handleBookmark} className="flex-1 py-3 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white font-bold text-sm tracking-tight flex justify-center items-center gap-2 bg-transparent">
                            <span className="material-symbols-outlined text-sm">{bookmarked ? "bookmark_added" : "bookmark"}</span>
                            {bookmarked ? "Saved" : "Save"}
                        </button>
                        <button onClick={handleCopyLink} className="flex-1 py-3 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white font-bold text-sm tracking-tight flex justify-center items-center gap-2 bg-transparent">
                            <span className="material-symbols-outlined text-sm">ios_share</span> Share
                        </button>
                    </div>
                </div>

                <p className="mt-6 text-center text-[10px] text-on-surface-variant uppercase tracking-widest">
                  {event.source ? `Source: ${event.source.toUpperCase()}` : "Independent Pulse."}
                </p>
                {event.sourceUrl && (
                  <div className="mt-4 text-center">
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest">
                      View Original Listing
                    </a>
                  </div>
                )}
              </div>

              {event.organizer?.name && (
                <div className="glass-card rounded-lg p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 flex justify-center items-center bg-surface-container-highest">
                     <span className="font-headline font-bold text-primary text-xl">{event.organizer.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-label uppercase font-bold tracking-widest text-on-surface-variant">Event Organizer</p>
                    <p className="font-headline font-bold text-white">{event.organizer.name}</p>
                  </div>
                  {event.organizer.website && (
                      <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="ml-auto material-symbols-outlined text-[#acaab3] hover:text-white transition-colors">language</a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
