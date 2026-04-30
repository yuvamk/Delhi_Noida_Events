import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFeaturedEvents, useTrendingEvents, useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { EventData } from '../api/client';
import { colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

const CATEGORIES = [
  { label: '💻 Tech', value: 'Tech' },
  { label: '🎵 Music', value: 'Music' },
  { label: '🎨 Art', value: 'Art' },
  { label: '🍕 Food', value: 'Food' },
  { label: '⚽ Sports', value: 'Sports' },
  { label: '💼 Business', value: 'Business' },
  { label: '😂 Comedy', value: 'Comedy' },
  { label: '🎭 Cultural', value: 'Cultural' },
  { label: '🤝 Networking', value: 'Networking' },
];

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCity, setActiveCity] = useState('All');

  const { events: featured, loading: loadingFeatured } = useFeaturedEvents();
  const { events: trending, loading: loadingTrending } = useTrendingEvents(
    activeCity !== 'All' ? activeCity : undefined
  );
  const { events: upcoming, loading: loadingUpcoming } = useEvents({ page: 1, limit: 8 });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery.trim() });
    }
  };

  const goToEvent = (event: EventData) => {
    navigation.navigate('EventDetail', { eventId: event._id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0f0c29', '#302b63', '#030712']}
          style={styles.hero}
        >
          {/* City Toggle */}
          <View style={styles.cityToggle}>
            {['Delhi', 'Noida', 'All'].map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityBtn, activeCity === city && styles.cityBtnActive]}
                onPress={() => setActiveCity(city)}
              >
                <Text style={[styles.cityBtnText, activeCity === city && styles.cityBtnTextActive]}>
                  {city === 'Delhi' ? '🏙️ Delhi' : city === 'Noida' ? '🌆 Noida' : '📍 Both'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.heroTitle}>Discover Events{'\n'}In Delhi & Noida</Text>
          <Text style={styles.heroSubtitle}>
            Concerts, Tech Summits, Art Walks and more
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Concerts, Tech Summits, Art Walks..."
              placeholderTextColor={colors.onSurfaceVariant}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { value: '15K+', label: 'Events' },
              { value: '500+', label: 'Organizers' },
              { value: '2', label: 'Cities' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Vibe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={styles.categoryChip}
                onPress={() => navigation.navigate('Events', { category: cat.value })}
              >
                <Text style={styles.categoryChipText}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Featured</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events', { featured: true })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loadingFeatured ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : (
            <FlatList
              horizontal
              data={featured}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <EventCard event={item} onPress={goToEvent} variant="featured" />
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No featured events yet.</Text>
              }
            />
          )}
        </View>

        {/* Trending Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending{activeCity !== 'All' ? ` in ${activeCity}` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events', { sort: 'popular' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loadingTrending ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : (
            <View style={styles.listPadding}>
              {trending.slice(0, 4).map((event) => (
                <EventCard key={event._id} event={event} onPress={goToEvent} variant="compact" />
              ))}
              {trending.length === 0 && (
                <Text style={styles.emptyText}>No trending events found.</Text>
              )}
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Upcoming</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events', {})}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loadingUpcoming ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : (
            <View style={styles.listPadding}>
              {upcoming.slice(0, 6).map((event) => (
                <EventCard key={event._id} event={event} onPress={goToEvent} />
              ))}
              {upcoming.length === 0 && (
                <Text style={styles.emptyText}>No upcoming events found.</Text>
              )}
            </View>
          )}
        </View>

        {/* Delhi / Noida shortcuts */}
        <View style={[styles.section, styles.listPadding]}>
          <Text style={styles.sectionTitle}>Explore by City</Text>
          <View style={styles.cityCards}>
            <TouchableOpacity
              style={[styles.cityCard, { backgroundColor: '#1a1035' }]}
              onPress={() => navigation.navigate('DelhiEvents')}
            >
              <Text style={styles.cityCardEmoji}>🏙️</Text>
              <Text style={styles.cityCardTitle}>Delhi Events</Text>
              <Text style={styles.cityCardSub}>Explore the capital</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cityCard, { backgroundColor: '#0f1a2e' }]}
              onPress={() => navigation.navigate('NoidaEvents')}
            >
              <Text style={styles.cityCardEmoji}>🌆</Text>
              <Text style={styles.cityCardTitle}>Noida Events</Text>
              <Text style={styles.cityCardSub}>The Silicon Valley of India</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cityToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    padding: 4,
    marginBottom: 24,
  },
  cityBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  cityBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cityBtnText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  cityBtnTextActive: {
    color: colors.white,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    paddingVertical: 10,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  searchBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryScroll: {
    paddingLeft: 16,
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipText: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  listPadding: {
    paddingHorizontal: 16,
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  cityCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cityCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cityCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cityCardTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  cityCardSub: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'center',
  },
});
