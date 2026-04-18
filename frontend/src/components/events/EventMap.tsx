"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

interface EventMapProps {
  coordinates: [number, number]; // [lng, lat]
  title: string;
  venue: string;
}

export function EventMap({ coordinates, title, venue }: EventMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Fix for Leaflet marker icon issue in Next.js
    import("leaflet").then((leaf) => {
      const DefaultIcon = leaf.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      leaf.Marker.prototype.options.icon = DefaultIcon;
      setL(leaf);
    });
  }, []);

  if (!isMounted || !L) return <div className="h-64 bg-surface-container animate-pulse rounded-lg"></div>;

  // Leaflet uses [lat, lng], but our DB might store [lng, lat] (standard GeoJSON)
  const position: [number, number] = [coordinates[1], coordinates[0]];

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden ghost-border z-0 cursor-pointer">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Tooltip permanent direction="top" offset={[0, -40]}>
            <div className="text-surface font-black text-xs px-1">
              {venue}
            </div>
          </Tooltip>
          <Popup>
            <div className="text-surface font-bold">
              <p className="mb-1">{title}</p>
              <p className="text-xs text-on-surface-variant">{venue}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
