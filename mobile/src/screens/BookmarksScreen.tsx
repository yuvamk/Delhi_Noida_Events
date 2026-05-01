import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../contexts/AuthContext';
import { EventsGridSkeleton } from '../components/LoadingSkeleton';
import { colors } from '../theme/colors';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function BookmarkCard({
  bookmark,
  onPress,
  onRemove,
  removing,
}: {
  bookmark: any;
  onPress: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  const event = bookmark.event || {};
  const priceLabel =
    event.price?.type === 'Free'
      ? 'Free'
      : event.price?.amount
      ? `₹${event.price.amount}`
      : event.price?.type || '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {event.images?.[0] ? (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageEmoji}>🎪</Text>
        </View>
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageEmoji}>🎪</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{event.title || 'Event'}</Text>
        <Text style={styles.cardMeta}>📅 {event.date ? formatDate(event.date) : '—'}</Text>
        <Text style={styles.cardMeta}>📍 {event.city || ''}</Text>
        {priceLabel ? (
          <View style={[styles.priceBadge, event.price?.type === 'Free' && styles.priceBadgeFree]}>
            <Text style={styles.priceText}>{priceLabel}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={onRemove}
        disabled={removing}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {removing ? (
          <ActivityIndicator size="small" color={colors.error} />
        ) : (
          <Text style={styles.removeIcon}>🗑️</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function BookmarksScreen({ navigation }: any) {
  const { isAuthenticated } = useAuth();
  const { bookmarks, loading, removeBookmark } = useBookmarks();
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔖 Bookmarks</Text>
        </View>
        <View style={styles.unauthState}>
          <Text style={styles.unauthIcon}>🔖</Text>
          <Text style={styles.unauthTitle}>Save Your Favourites</Text>
          <Text style={styles.unauthSubtitle}>
            Login to save and manage your bookmarked events
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleRemove = async (eventId: string) => {
    setRemovingId(eventId);
    await removeBookmark(eventId);
    setRemovingId(null);
  };

  const handleCardPress = (bookmark: any) => {
    const id = bookmark.event?._id;
    if (id) navigation.navigate('EventDetail', { eventId: id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🔖 Bookmarks{' '}
          {bookmarks.length > 0 && (
            <Text style={styles.headerCount}>({bookmarks.length})</Text>
          )}
        </Text>
      </View>

      {loading ? (
        <View style={styles.listPad}>
          <EventsGridSkeleton count={4} />
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any event to save it here
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={styles.exploreBtnText}>Explore Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item._id || item.event?._id}
          renderItem={({ item }) => (
            <BookmarkCard
              bookmark={item}
              onPress={() => handleCardPress(item)}
              onRemove={() => handleRemove(item.event?._id)}
              removing={removingId === item.event?._id}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: { color: colors.white, fontSize: 26, fontWeight: '900' },
  headerCount: { color: colors.primary, fontSize: 18 },
  listPad: { paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  unauthState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  unauthIcon: { fontSize: 64, marginBottom: 16 },
  unauthTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  unauthSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  loginBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 100,
  },
  exploreBtnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    width: 88,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageEmoji: { fontSize: 28 },
  cardBody: { flex: 1, padding: 12, gap: 4 },
  cardTitle: { color: colors.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardMeta: { color: colors.onSurfaceVariant, fontSize: 12 },
  priceBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: colors.primary + '33',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceBadgeFree: { backgroundColor: colors.success + '33' },
  priceText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  removeBtn: { padding: 14, alignItems: 'center', justifyContent: 'center' },
  removeIcon: { fontSize: 20 },
});
