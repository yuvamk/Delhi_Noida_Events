import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { EventsGridSkeleton } from '../components/LoadingSkeleton';
import { EventData } from '../api/client';
import { colors } from '../theme/colors';

const CATEGORIES = ['All', 'Tech', 'Music', 'Art', 'Food', 'Sports', 'Business', 'Comedy', 'Cultural', 'Networking', 'Startup', 'Education', 'Entertainment'];
const PRICE_TYPES = ['All', 'Free', 'Paid', 'RSVP'];

export default function DelhiEventsScreen({ navigation }: any) {
  const [category, setCategory] = useState('All');
  const [priceType, setPriceType] = useState('All');
  const [page, setPage] = useState(1);

  const { events, total, pages, loading } = useEvents({
    city: 'Delhi',
    category: category !== 'All' ? category : undefined,
    price_type: priceType !== 'All' ? priceType : undefined,
    sort: 'date',
    page,
    limit: 12,
  });

  const handlePress = (event: EventData) => {
    navigation.navigate('EventDetail', { eventId: event._id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🏙️ Delhi Events</Text>
          {total > 0 && <Text style={styles.headerCount}>{total} events</Text>}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => { setCategory(cat); setPage(1); }}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Price filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {PRICE_TYPES.map((pt) => (
          <TouchableOpacity
            key={pt}
            style={[styles.priceChip, priceType === pt && styles.priceChipActive]}
            onPress={() => { setPriceType(pt); setPage(1); }}
          >
            <Text style={[styles.priceChipText, priceType === pt && styles.priceChipTextActive]}>{pt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <ScrollView style={styles.listPad}>
          <EventsGridSkeleton count={6} />
        </ScrollView>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <EventCard event={item} onPress={handlePress} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏙️</Text>
              <Text style={styles.emptyTitle}>No Delhi events found</Text>
              <Text style={styles.emptySubtitle}>Try a different category or filter</Text>
            </View>
          }
          ListFooterComponent={
            pages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  onPress={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <Text style={styles.pageBtnText}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{page} / {pages}</Text>
                <TouchableOpacity
                  style={[styles.pageBtn, page === pages && styles.pageBtnDisabled]}
                  onPress={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                >
                  <Text style={styles.pageBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  headerCount: { color: colors.onSurfaceVariant, fontSize: 13, marginTop: 2 },
  filterRow: { flexGrow: 0, marginBottom: 4 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  chipText: { color: colors.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.primary, fontWeight: '800' },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceChipActive: { backgroundColor: colors.secondary + '33', borderColor: colors.secondary },
  priceChipText: { color: colors.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  priceChipTextActive: { color: colors.secondary, fontWeight: '800' },
  listPad: { paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  pageBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  pageInfo: { color: colors.onSurfaceVariant, fontSize: 13 },
});
