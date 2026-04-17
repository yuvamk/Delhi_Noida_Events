"use client";
import Link from "next/link";
import { useState } from "react";
import { EventData } from "@/lib/api";
import { useBookmarks } from "@/hooks/useBookmarks";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getTimeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "Past event";
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  return `In ${Math.floor(days / 7)}w`;
}

const EMOJI: Record<string, string> = {
  Tech: "💻", Startup: "🚀", Cultural: "🎭", Business: "💼",
  Sports: "⚽", Education: "📚", Entertainment: "🎵",
  Hackathon: "⚡", Meetup: "🤝", Conference: "🎤",
};

interface EventCardProps {
  event: EventData;
  variant?: "default" | "featured" | "compact";
}

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const [imgError, setImgError] = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(event._id);
  const timeUntil = getTimeUntil(event.date);
  const slug = event.slug || event._id;

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark(event._id, event.title);
  };

  const imageSrc = !imgError && event.images?.[0] ? event.images[0] : null;

  if (variant === "compact") {
    return (
      <Link href={`/events/${slug}`} className="block transition-transform hover:-translate-y-1">
        <div className="flex gap-4 p-4 items-start bg-surface-container rounded-lg border border-white/5 hover:border-white/10 transition-colors">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface flex items-center justify-center text-2xl relative">
            {imageSrc ? (
              <img src={imageSrc} alt={event.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              EMOJI[event.category] || "📅"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white mb-1 truncate">{event.title}</p>
            <p className="text-xs text-on-surface-variant flex items-center gap-2">
              <span>{formatDate(event.date)}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="truncate">{event.city}</span>
            </p>
          </div>
          <div className="text-xs font-bold text-tertiary">
            {event.price?.type === "Free" ? "Free" : `₹${event.price?.amount || 0}`}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/events/${slug}`} className="block group relative transition-all duration-500 hover:-translate-y-2 h-[420px] w-full">
      <div className="relative h-full rounded-xl overflow-hidden bg-surface-container w-full">
        {imageSrc ? (
          <img 
            alt={event.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src={imageSrc} 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-surface to-surface-container-high flex items-center justify-center text-6xl opacity-50 group-hover:scale-110 transition-transform duration-700">
            {EMOJI[event.category] || "📅"}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-0 p-6 w-full">
          <span className="inline-block bg-primary text-on-primary-container px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(189,157,255,0.4)]">
            {event.category || "Events"}
          </span>
          <h3 className="font-headline text-2xl font-bold text-white mb-3 leading-tight line-clamp-2">
            {event.title}
          </h3>
          <div className="flex flex-col gap-2 text-on-surface-variant text-sm font-medium">
            <div className="flex items-center justify-between w-full">
               <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-primary">calendar_today</span> {formatDate(event.date)}</span>
               <span className="font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded text-xs">{event.price?.type === "Free" ? "FREE" : `₹${event.price?.amount}`}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <span className="material-symbols-outlined text-sm text-secondary">location_on</span> <span className="truncate">{event.city}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bookmark Button */}
      <button 
        onClick={handleBookmark} 
        className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-colors z-10 ${bookmarked ? 'bg-primary/20 border-primary text-primary' : 'bg-surface/50 border-white/10 text-white hover:bg-surface/80'}`}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
      </button>
    </Link>
  );
}
