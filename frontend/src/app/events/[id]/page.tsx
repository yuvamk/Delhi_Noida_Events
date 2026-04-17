import { notFound } from "next/navigation";
import { EventDetailClient } from "./EventDetailClient";
import { Metadata } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const MOCK_EVENT: any = {
  _id: "mock-event",
  title: "DE·NE",
  description: "Experience the dark heart of the city at DE·NE. We are bringing together the most influential underground techno artists from the NCR region for a one-night-only showcase of industrial soundscapes and immersive visual art.\n\nThis isn't just a party; it's a curated editorial experience. Featuring 4D spatial audio and a 360-degree LED installation designed by the 'Neon Collective', we are redefining what nightlife means in the capital.",
  shortDescription: "The ultimate nocturnal intersection of Delhi sound and Noida soul.",
  category: "Trending",
  city: "Noida",
  date: new Date().toISOString(),
  time: "22:00 - 04:00",
  venue: "The Obsidian",
  address: "Plot 12, Sector 144, Noida Expressway",
  location: { coordinates: [77.2090, 28.6139] },
  price: { amount: 0, currency: "INR", type: "Free" },
  registrationUrl: "#",
  images: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCPdtRYsO8R33GaXNSXDoRoxx1O4LL7ndnnIchr2TaRZnnv8QcJB_sndpP216cGZO0aPChhuCWuhLfDm7TqmMvP3aGjkQu1YRTXzmdhXZwi8dl-PvpiD6gika9yTVT--EO-oGl1MgDuteJtrvFok5AkRgyl7_sEsK9KQEECHj4AiyEWHauUtCRgaFeYPodpiBPAHwQmFNTubA4Ji7FBlKF6hCJBhnEOLzM9b_lOAUMRECLlRb-qAmWeYaQRlHKuAxMZwIQc8NcnUl0",
  ],
  tags: ["Techno", "Underground", "EDM"],
  organizer: { name: "Electric Delhi" },
  capacity: 500,
  attendees: 420,
  source: "Neon Editorial",
  sourceUrl: "#",
  featured: true,
  verified: true,
  speakers: [
    { name: "Zero State", bio: "Ambient modular synth set. Visual warm-up begins.", designation: "Opener" },
    { name: "Aether Flow & Kinesis", bio: "Industrial Techno showcase.", designation: "Main Activation" },
    { name: "Neon Curator", bio: "High-bpm hard techno closing set.", designation: "The Void" }
  ]
};

// Pre-generate a set of known slugs at build time (empty = all dynamic)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API}/events?limit=50&page=1`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const events = data.data || data.events || [];
    return events.map((e: any) => ({ id: e.slug || e._id }));
  } catch {
    // Return a few static IDs from seed data as fallback
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "mock-event"].map((id) => ({ id: String(id) }));
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (id === "mock-event") return { title: `${MOCK_EVENT.title} | ${MOCK_EVENT.city} Events 2025` };

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

  if (id === "mock-event") {
    return <EventDetailClient event={MOCK_EVENT} />;
  }

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
