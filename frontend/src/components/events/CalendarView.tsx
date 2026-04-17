"use client";
import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";
import Link from "next/link";
import { EventData } from "@/lib/api";

interface CalendarViewProps {
  events: EventData[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const selectedEvents = useMemo(() => {
    if (!selected) return [];
    return events.filter((e) => isSameDay(new Date(e.date), selected));
  }, [selected, events]);

  const eventDates = useMemo(() => {
    return events.map(e => new Date(e.date));
  }, [events]);

  return (
    <div className="calendar-view-container" style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
      gap: 32,
      background: "var(--color-bg-glass)",
      borderRadius: "var(--radius-lg)",
      padding: "clamp(1.5rem, 5vw, 2.5rem)",
      border: "1px solid var(--color-border)",
      backdropFilter: "blur(20px)"
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, color: "var(--color-accent-primary)" }}>
          <span style={{ fontSize: 20 }}>📅</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: "var(--color-text-primary)" }}>Pick a Date</h3>
        </div>
        
        <style>{`
          .rdp { --rdp-accent-color: var(--color-accent-primary); --rdp-background-color: var(--color-bg-secondary); margin: 0; }
          .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; font-weight: 700; }
          .rdp-day:hover:not(.rdp-day_selected) { background: var(--color-bg-card-hover); }
          .rdp-head_cell { color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; font-weight: 700; }
          .rdp-month { color: var(--color-text-primary); }
          .rdp-nav_button { color: var(--color-accent-primary); }
        `}</style>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ hasEvent: eventDates }}
          modifiersStyles={{
            hasEvent: { textDecoration: "underline", textDecorationColor: "var(--color-accent-primary)", textDecorationThickness: "2px" }
          }}
        />
      </div>

      <div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "'Space Grotesk',sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {selected ? format(selected, "MMMM d, yyyy") : "Select a date"}
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 400 }}>{selectedEvents.length} events</span>
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 350, overflowY: "auto", paddingRight: 8 }}>
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <Link key={event._id} href={`/events/${event.slug || event._id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: 16, background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--color-bg-card-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 24 }}>✨</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{event.title}</h4>
                      <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>🕒 {event.time || "TBD"} · 📍 {event.city}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <p>No events scheduled for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
