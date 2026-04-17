import type { Metadata } from "next";
import CityEventsClient from "../delhi-events/CityEventsClient";

export const metadata: Metadata = {
  title: "Events in Noida 2025 — Tech, Startup, Business & More",
  description: "Discover the best events in Noida — tech conferences, startup meetups, hackathons, business events and more. Updated daily. Find upcoming events in Noida, Sector 62, Greater Noida.",
  keywords: ["events in noida", "noida events", "tech events noida", "startup events noida", "hackathon noida", "free events noida", "greater noida events"],
};

export default function NoidaEventsPage() {
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Events in Noida 2025",
    description: "Discover upcoming events in Noida, India",
    url: "https://delhi-noida-events.vercel.app/noida-events",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />
      <CityEventsClient city="Noida" />
    </>
  );
}
