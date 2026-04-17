"use client";
import { useState, useEffect, useCallback } from "react";
import { bookmarksApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export function useBookmarks() {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) { setBookmarks([]); setBookmarkedIds(new Set()); return; }
    setLoading(true);
    try {
      const res = await bookmarksApi.getAll();
      if (res.success) {
        setBookmarks(res.data || []);
        setTotal(res.total || 0);
        const ids = new Set<string>((res.data || []).map((b: any) => b.event?._id || b.event));
        setBookmarkedIds(ids);
      }
    } catch {} finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const addBookmark = useCallback(async (eventId: string, eventTitle?: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to save events");
      window.location.href = "/auth/login";
      return false;
    }
    try {
      const res = await bookmarksApi.add(eventId);
      if (res.success) {
        setBookmarkedIds((prev) => new Set([...prev, eventId]));
        toast.success(`${eventTitle || "Event"} saved to bookmarks! 🔖`);
        return true;
      } else {
        if (res.error?.includes("already")) toast.success("Already bookmarked!");
        else toast.error(res.error || "Failed to bookmark");
        return false;
      }
    } catch { toast.error("Failed to bookmark"); return false; }
  }, [isAuthenticated]);

  const removeBookmark = useCallback(async (eventId: string) => {
    try {
      const res = await bookmarksApi.remove(eventId);
      if (res.success) {
        setBookmarkedIds((prev) => { const next = new Set(prev); next.delete(eventId); return next; });
        setBookmarks((prev) => prev.filter((b) => (b.event?._id || b.event) !== eventId));
        toast.success("Bookmark removed");
        return true;
      }
      return false;
    } catch { return false; }
  }, []);

  const toggleBookmark = useCallback(async (eventId: string, title?: string) => {
    if (bookmarkedIds.has(eventId)) return removeBookmark(eventId);
    return addBookmark(eventId, title);
  }, [bookmarkedIds, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((eventId: string) => bookmarkedIds.has(eventId), [bookmarkedIds]);

  return { bookmarks, bookmarkedIds, loading, total, addBookmark, removeBookmark, toggleBookmark, isBookmarked, refetch: fetchBookmarks };
}
