import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSearchEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { EventsGridSkeleton } from '../components/LoadingSkeleton';
import { EventData } from '../api/client';
import { colors } from '../theme/colors';

const CATEGORIES = ['All', 'Tech', 'Music', 'Art', 'Food', 'Sports', 'Business', 'Comedy', 'Cultural', 'Networking'];

export default function SearchScreen({ navigation, route }: any) {
  const initialQuery = route?.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('All');
  const inputRef = useRef<TextInput>(null);

  const filters = activeCategory !== 'All' ? { category: activeCategory } : undefined;
  const { events, total, loading, error } = useSearchEvents(query, filters);

  const handleEventPress = (event: EventData) => {
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
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search events, venues, artists..."
            placeholderTextColor={colors.onSurfaceVariant}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results info */}
      {query.length > 0 && !loading && (
        <Text style={styles.resultsInfo}>
          {total > 0 ? `${total} result${total !== 1 ? 's' : ''} for "${query}"` : ''}
        </Text>
      )}

      {/* Content */}
      {loading ? (
        <ScrollView style={styles.listPad}>
          <EventsGridSkeleton count={4} />
        </ScrollView>
      ) : query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search Events</Text>
          <Text style={styles.emptySubtitle}>
            Find events by title, venue, category, or artist
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Search failed</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>😕</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different keyword or category
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <EventCard event={item} onPress={handleEventPress} />}
          contentContainerStyle={styles.listContent}
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
    gap: 10,
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
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 15, paddingVertical: 11 },
  clearIcon: { color: colors.onSurfaceVariant, fontSize: 16, paddingLeft: 6 },
  chipsRow: { flexGrow: 0, marginBottom: 4 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  chipText: { color: colors.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.primary, fontWeight: '800' },
  resultsInfo: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  listPad: { paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' },
});
