import { useState, useEffect, useCallback } from 'react';
import { bookmarksApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export function useBookmarks() {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBookmarks = useCallback(
    async (reset = false) => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const p = reset ? 1 : page;
        const res = await bookmarksApi.getAll(p);
        if (res.success) {
          const newItems = res.data || [];
          setBookmarks((prev) => (reset ? newItems : [...prev, ...newItems]));
          setHasMore(newItems.length === 10);
          if (reset) setPage(1);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    },
    [isAuthenticated, page]
  );

  useEffect(() => {
    fetchBookmarks(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addBookmark = useCallback(async (eventId: string) => {
    const res = await bookmarksApi.add(eventId);
    if (res.success) await fetchBookmarks(true);
    return !!res.success;
  }, [fetchBookmarks]);

  const removeBookmark = useCallback(async (eventId: string) => {
    const res = await bookmarksApi.remove(eventId);
    if (res.success) {
      setBookmarks((prev) => prev.filter((b) => b.event?._id !== eventId && b._id !== eventId));
    }
    return !!res.success;
  }, []);

  const checkBookmark = useCallback(async (eventId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    const res = await bookmarksApi.check(eventId);
    return res.data?.isBookmarked ?? false;
  }, [isAuthenticated]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
      fetchBookmarks();
    }
  }, [loading, hasMore, fetchBookmarks]);

  return { bookmarks, loading, addBookmark, removeBookmark, checkBookmark, loadMore, refetch: () => fetchBookmarks(true) };
}
