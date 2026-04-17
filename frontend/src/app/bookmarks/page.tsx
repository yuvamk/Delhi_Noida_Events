"use client";
import { useBookmarks } from "@/hooks/useBookmarks";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { useRouter } from "next/navigation";
import { Trash2, ExternalLink } from "lucide-react";
import { EventsGridSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

const EMOJI: Record<string, string> = {
  Tech: "💻", Startup: "🚀", Cultural: "🎭", Business: "💼",
  Sports: "⚽", Education: "📚", Entertainment: "🎵",
  Hackathon: "⚡", Meetup: "🤝", Conference: "🎤",
};

function BookmarkCard({ bookmark, onRemove }: { bookmark: any; onRemove: (id: string) => void }) {
  const router = useRouter();
  const event = bookmark.event;
  if (!event || !event._id) return null;

  const date = new Date(event.date);
  const isPast = date < new Date();
  const imageSrc = event.images?.[0] ? event.images[0] : null;

  return (
    <div className="group relative transition-all duration-500 hover:-translate-y-2 h-[420px] w-full flex flex-col cursor-pointer" onClick={() => router.push(`/events/${event.slug || event._id}`)}>
      <div className="relative h-full rounded-xl overflow-hidden bg-surface-container w-full">
        {isPast && (
           <div className="absolute top-4 left-4 bg-error text-onError px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest z-20">
             Past Event
           </div>
        )}

        {imageSrc ? (
          <img 
            alt={event.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'grayscale opacity-50' : ''}`} 
            src={imageSrc} 
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-surface to-surface-container-high flex items-center justify-center text-6xl opacity-50 group-hover:scale-110 transition-transform duration-700">
            {EMOJI[event.category] || "📅"}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-0 p-6 w-full flex flex-col">
          <span className="inline-block bg-primary text-on-primary-container w-fit px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(189,157,255,0.4)]">
            {event.category || "Events"}
          </span>
          <h3 className="font-headline text-2xl font-bold text-white mb-3 leading-tight line-clamp-2">
            {event.title}
          </h3>
          <div className="flex flex-col gap-2 text-on-surface-variant text-sm font-medium mb-4">
            <div className="flex items-center justify-between w-full">
               <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-primary">calendar_today</span> {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
               <span className="font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded text-xs">{event.price?.type === "Free" ? "FREE" : `₹${event.price?.amount || 0}`}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <span className="material-symbols-outlined text-sm text-secondary">location_on</span> <span className="truncate">{event.city}</span>
            </div>
          </div>

          <div className="flex gap-3">
             <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-primary text-on-primary-container text-xs font-black py-2 rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
             >
               Register <ExternalLink size={12} />
             </a>
             <button
              onClick={(e) => { e.stopPropagation(); onRemove(event._id); }}
              className="bg-error/10 text-error border border-error/30 text-xs font-black px-4 rounded-md flex items-center justify-center gap-2 hover:bg-error/20 transition-colors"
             >
               <Trash2 size={12} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookmarksContent() {
  const { bookmarks, loading, total, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <span className="material-symbols-outlined text-4xl text-primary drop-shadow-[0_0_15px_rgba(189,157,255,0.4)]">bookmarks</span>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-white">Your Arsenal</h1>
          </div>
          <p className="text-on-surface-variant text-lg">
            {total > 0 ? `${total} verified points of interest isolated.` : "Your scanner history is currently empty."}
          </p>
        </div>

        {loading ? (
          <EventsGridSkeleton count={8} />
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-24 bg-surface-container rounded-2xl border border-white/5">
            <div className="text-6xl mb-6 opacity-30">📂</div>
            <h3 className="font-headline text-3xl font-bold text-white mb-3">Archive Empty</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-8 font-inter">Explore the grid and save events to your localized arsenal for quick access.</p>
            <Link href="/events" className="bg-primary text-on-primary-container font-black px-8 py-3 rounded-full hover:scale-105 transition-transform inline-block shadow-[0_0_20px_rgba(189,157,255,0.2)]">
              Scan Global Directory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bm) => (
              <BookmarkCard key={bm._id} bookmark={bm} onRemove={removeBookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
