import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { EventsGridSkeleton } from '../components/LoadingSkeleton';
import { EventData } from '../api/client';
import { colors } from '../theme/colors';

const CATEGORIES = ['All', 'Tech', 'Startup', 'Cultural', 'Business', 'Sports', 'Education', 'Entertainment', 'Hackathon', 'Meetup', 'Conference', 'Workshop', 'Comedy', 'Music', 'Nightlife', 'Art', 'Food', 'Spiritual', 'Networking', 'Other'];
const CITIES = ['All', 'Delhi', 'Noida', 'Gurgaon', 'NCR'];
const PRICE_TYPES = ['All', 'Free', 'Paid', 'RSVP'];
const SORT_OPTIONS = [
  { label: 'Upcoming', value: 'date' },
  { label: 'Popular', value: 'popular' },
  { label: 'Most Viewed', value: 'views' },
];

export default function EventsScreen({ navigation, route }: any) {
  const routeParams = route?.params || {};
  const [filters, setFilters] = useState({
    city: routeParams.city || 'All',
    category: routeParams.category || 'All',
    priceType: 'All',
    sort: routeParams.sort || 'date',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { events, total, pages, loading } = useEvents({
    city: filters.city !== 'All' ? filters.city : undefined,
    category: filters.category !== 'All' ? filters.category : undefined,
    price_type: filters.priceType !== 'All' ? filters.priceType : undefined,
    sort: filters.sort,
    q: filters.search || undefined,
    page,
    limit: 12,
  });

  const activeFilterCount = [
    filters.city !== 'All',
    filters.category !== 'All',
    filters.priceType !== 'All',
  ].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setFilters((f) => ({ ...f, city: 'All', category: 'All', priceType: 'All', search: '' }));
    setPage(1);
  }, []);

  const goToEvent = (event: EventData) => {
    navigation.navigate('EventDetail', { eventId: event._id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          All Events {total > 0 && <Text style={styles.headerCount}>({total})</Text>}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterBtnText}>
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={filters.search}
          onChangeText={(text) => { setFilters({ ...filters, search: text }); setPage(1); }}
          placeholder="Search events, venues..."
          placeholderTextColor={colors.onSurfaceVariant}
        />
        {filters.search.length > 0 && (
          <TouchableOpacity onPress={() => setFilters({ ...filters, search: '' })}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active filters chips */}
      {activeFilterCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {filters.city !== 'All' && (
            <TouchableOpacity
              style={styles.chip}
              onPress={() => { setFilters({ ...filters, city: 'All' }); setPage(1); }}
            >
              <Text style={styles.chipText}>🏙️ {filters.city} ✕</Text>
            </TouchableOpacity>
          )}
          {filters.category !== 'All' && (
            <TouchableOpacity
              style={[styles.chip, styles.chipSecondary]}
              onPress={() => { setFilters({ ...filters, category: 'All' }); setPage(1); }}
            >
              <Text style={[styles.chipText, styles.chipTextSecondary]}>🎭 {filters.category} ✕</Text>
            </TouchableOpacity>
          )}
          {filters.priceType !== 'All' && (
            <TouchableOpacity
              style={[styles.chip, styles.chipTertiary]}
              onPress={() => { setFilters({ ...filters, priceType: 'All' }); setPage(1); }}
            >
              <Text style={[styles.chipText, styles.chipTextTertiary]}>🎟️ {filters.priceType} ✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Sort row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortChip, filters.sort === opt.value && styles.sortChipActive]}
            onPress={() => { setFilters({ ...filters, sort: opt.value }); setPage(1); }}
          >
            <Text style={[styles.sortChipText, filters.sort === opt.value && styles.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      {loading ? (
        <ScrollView style={styles.listPad}>
          <EventsGridSkeleton count={6} />
        </ScrollView>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <EventCard event={item} onPress={goToEvent} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>
                {filters.search ? `We couldn't find "${filters.search}".` : 'Try adjusting your filters.'}
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll}>
                  <Text style={styles.clearAllBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
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

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* City filter */}
              <Text style={styles.filterLabel}>City</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.filterOption, filters.city === c && styles.filterOptionActive]}
                    onPress={() => setFilters({ ...filters, city: c })}
                  >
                    <Text style={[styles.filterOptionText, filters.city === c && styles.filterOptionTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category filter */}
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterGridOption, filters.category === cat && styles.filterOptionActive]}
                    onPress={() => setFilters({ ...filters, category: cat })}
                  >
                    <Text style={[styles.filterOptionText, filters.category === cat && styles.filterOptionTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Type filter */}
              <Text style={styles.filterLabel}>Access</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {PRICE_TYPES.map((pt) => (
                  <TouchableOpacity
                    key={pt}
                    style={[styles.filterOption, filters.priceType === pt && styles.filterOptionActive]}
                    onPress={() => setFilters({ ...filters, priceType: pt })}
                  >
                    <Text style={[styles.filterOptionText, filters.priceType === pt && styles.filterOptionTextActive]}>
                      {pt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.applyBtn} onPress={() => { setPage(1); setShowFilters(false); }}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={() => { clearAll(); setShowFilters(false); }}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: { color: colors.white, fontSize: 26, fontWeight: '900' },
  headerCount: { color: colors.primary, fontSize: 18 },
  headerActions: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  filterBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 14, paddingVertical: 12 },
  clearSearch: { color: colors.onSurfaceVariant, fontSize: 16, padding: 4 },
  chipsRow: { paddingHorizontal: 16, marginBottom: 4, flexGrow: 0 },
  chip: {
    backgroundColor: colors.primary + '22',
    borderWidth: 1,
    borderColor: colors.primary + '55',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipSecondary: { backgroundColor: colors.secondary + '22', borderColor: colors.secondary + '55' },
  chipTertiary: { backgroundColor: colors.tertiary + '22', borderColor: colors.tertiary + '55' },
  chipText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  chipTextSecondary: { color: colors.secondary },
  chipTextTertiary: { color: colors.tertiary },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, justifyContent: 'center' },
  clearBtnText: { color: colors.onSurfaceVariant, fontSize: 11, fontWeight: '600' },
  sortRow: { paddingHorizontal: 16, flexGrow: 0, marginBottom: 8 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    marginRight: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  sortChipText: { color: colors.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  sortChipTextActive: { color: colors.primary, fontWeight: '800' },
  listPad: { paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  clearAllBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  clearAllBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerHigh,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  modalClose: { color: colors.onSurfaceVariant, fontSize: 18 },
  filterLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterOptions: { paddingLeft: 16, marginBottom: 4, flexGrow: 0 },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    marginRight: 8,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  filterOptionText: { color: colors.onSurfaceVariant, fontSize: 13 },
  filterOptionTextActive: { color: colors.primary, fontWeight: '700' },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterGridOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  applyBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  resetBtn: {
    backgroundColor: colors.surfaceContainer,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetBtnText: { color: colors.onSurfaceVariant, fontSize: 14, fontWeight: '700' },
});
