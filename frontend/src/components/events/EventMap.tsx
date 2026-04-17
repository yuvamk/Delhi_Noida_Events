"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import to solve SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface EventMapProps {
  events: any[];
  center?: [number, number];
  zoom?: number;
  height?: string | number;
}

export default function EventMap({ events, center = [28.6139, 77.2090], zoom = 11, height = 400 }: EventMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Fix for missing Leaflet marker icons in React
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isMounted || !L) return <div style={{ height, background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>Loading map...</div>;

  return (
    <div style={{ height, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(99,102,241,0.2)" }}>
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event) => {
          const coords = event.location?.coordinates || [28.6139, 77.2090];
          // Leaflet expects [lat, lng], MongoDB usually stores [lng, lat]
          const position: [number, number] = [coords[1], coords[0]];
          
          return (
            /* @ts-ignore */
            <Marker key={event._id} position={position}>
              {/* @ts-ignore */}
              <Popup>
                 <div style={{ color: "var(--color-text-primary)", minWidth: 150 }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "var(--color-text-primary)" }}>{event.title}</h4>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-text-secondary)" }}>{event.venue}</p>
                  <a href={`/events/${event.slug || event._id}`} style={{ fontSize: 12, color: "var(--color-accent-primary)", fontWeight: 600, textDecoration: "none" }}>View Details →</a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
