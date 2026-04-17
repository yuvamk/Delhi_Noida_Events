"use client";
import { useState, useEffect, useCallback } from "react";
import { eventsApi, EventData } from "@/lib/api";

interface UseEventsOptions {
  city?: string;
  category?: string;
  sort?: string;
  price_type?: string;
  search?: string;
  q?: string; // alias for search
  page?: number;
  limit?: number;
  featured?: boolean;
  autoFetch?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { autoFetch = true, ...params } = options;
  const [events, setEvents] = useState<EventData[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (overrides?: Partial<UseEventsOptions>) => {
    setLoading(true);
    setError(null);
    try {
      const merged = { ...params, ...overrides };
      const searchTerm = merged.q || merged.search;
      const res = await eventsApi.getAll({
        page: merged.page || 1,
        limit: merged.limit || 12,
        ...(merged.city && merged.city !== "All" && { city: merged.city }),
        ...(merged.category && merged.category !== "All" && { category: merged.category }),
        ...(merged.sort && { sort: merged.sort }),
        ...(merged.price_type && merged.price_type !== "All" && { price_type: merged.price_type }),
        ...(searchTerm && { q: searchTerm }),
        ...(merged.featured && { featured: "true" }),
      });
      if (res.success) {
        setEvents(res.data || []);
        setTotal(res.total || 0);
        setPages(res.pages || 0);
      } else {
        setError(res.error || "Failed to load events");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    if (autoFetch) fetchEvents();
  }, [fetchEvents, autoFetch]);

  return { events, total, pages, loading, error, refetch: fetchEvents };
}

export function useFeaturedEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getFeatured().then((res) => {
      if (res.success) setEvents(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return { events, loading };
}

export function useTrendingEvents(city?: string) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getTrending(city).then((res) => {
      if (res.success) setEvents(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [city]);

  return { events, loading };
}

export function useEventDetail(id: string) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    eventsApi.getById(id).then((res: any) => {
      if (res.success) {
        setEvent(res.data);
        setRelatedEvents(res.relatedEvents || []);
      } else {
        setError(res.error || "Event not found");
      }
    }).catch(() => setError("Network error")).finally(() => setLoading(false));
  }, [id]);

  return { event, relatedEvents, loading, error };
}

export function useSearchEvents(query: string, filters?: Record<string, string>) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) { setEvents([]); setTotal(0); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await eventsApi.search(query, filters);
        if (res.success) { setEvents(res.data || []); setTotal(res.total || 0); }
        else setError(res.error || "Search failed");
      } catch { setError("Network error"); }
      finally { setLoading(false); }
    }, 400); // debounce 400ms
    return () => clearTimeout(timer);
  }, [query, JSON.stringify(filters)]);

  return { events, total, loading, error };
}

export function useAISearchEvents(query: string) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) { setEvents([]); setTotal(0); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await eventsApi.searchAI(query);
        if (res.success) { setEvents(res.data || []); setTotal(res.total || 0); }
        else setError(res.error || "AI Search failed");
      } catch { setError("Network error"); }
      finally { setLoading(false); }
    }, 500); // debounce 500ms
    return () => clearTimeout(timer);
  }, [query]);

  return { events, total, loading, error };
}

export function usePlatformStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getStats().then((res) => {
      if (res.success) setStats(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
