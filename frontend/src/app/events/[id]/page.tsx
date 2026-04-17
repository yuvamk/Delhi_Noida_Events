import { notFound } from "next/navigation";
import { EventDetailClient } from "./EventDetailClient";
import { Metadata } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Pre-generate a set of known slugs at build time (empty = all dynamic)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API}/events?limit=50&page=1`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const events = data.data || data.events || [];
    return events.map((e: any) => ({ id: e.slug || e._id }));
  } catch {
    // Return a few static IDs from seed data as fallback
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => ({ id: String(id) }));
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/events/${id}`, { next: { revalidate: 300 } });
    const data = await res.json();
    const event = data.data || data.event || data;
    if (!event?.title) return { title: "Event — DelhiNoidaEvents" };
    return {
      title: `${event.title} | ${event.city} Events 2025`,
      description: (event.description || "").slice(0, 160),
      openGraph: {
        title: event.title,
        description: (event.description || "").slice(0, 160),
        images: event.images?.[0] ? [{ url: event.images[0] }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: (event.description || "").slice(0, 160),
        images: event.images?.[0] ? [event.images[0]] : [],
      },
    };
  } catch {
    return { title: "Event — DelhiNoidaEvents" };
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API}/events/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) notFound();
    const data = await res.json();
    const event = data.data || data.event || data;
    if (!event?._id && !event?.title) notFound();
    return <EventDetailClient event={event} />;
  } catch {
    notFound();
  }
}
