import type { Metadata } from "next";
import CityEventsClient from "./CityEventsClient";

export const metadata: Metadata = {
  title: "Events in Delhi 2025 — Tech, Startup, Cultural & More",
  description: "Discover the best events in Delhi — tech conferences, startup meetups, cultural festivals, hackathons, business conclaves and more. Updated daily from 10+ sources.",
  keywords: ["events in delhi", "delhi events", "tech events delhi", "startup events delhi", "cultural events delhi", "free events delhi", "hackathon delhi"],
  openGraph: {
    title: "Events in Delhi 2025",
    description: "Find the best events happening in Delhi across tech, culture, startups, business, and entertainment.",
  },
};

export default function DelhiEventsPage() {
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Events in Delhi 2025",
    description: "Discover upcoming events in Delhi, India",
    url: "https://delhi-noida-events.vercel.app/delhi-events",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />
      <CityEventsClient city="Delhi" />
    </>
  );
}
