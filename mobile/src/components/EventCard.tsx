import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { EventData } from '../api/client';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface Props {
  event: EventData;
  onPress: (event: EventData) => void;
  variant?: 'default' | 'compact' | 'featured';
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    Tech: '#6366f1',
    Music: '#a855f7',
    Art: '#ec4899',
    Food: '#f59e0b',
    Sports: '#22c55e',
    Business: '#3b82f6',
    Comedy: '#f97316',
    Cultural: '#14b8a6',
    Networking: '#8b5cf6',
  };
  return map[cat] || '#6366f1';
}

export function EventCard({ event, onPress, variant = 'default' }: Props) {
  const imageUri = event.images?.[0] || 'https://placehold.co/400x200/1e2433/6366f1?text=Event';
  const isFree = event.price?.type === 'Free' || event.price?.amount === 0;

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={() => onPress(event)} activeOpacity={0.8}>
        <Image source={{ uri: imageUri }} style={styles.compactImage} contentFit="cover" />
        <View style={styles.compactContent}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor(event.category) + '22' }]}>
            <Text style={[styles.categoryText, { color: categoryColor(event.category) }]}>
              {event.category}
            </Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.compactMeta}>{formatDate(event.date)} • {event.venue}</Text>
          <View style={styles.compactBottom}>
            <Text style={styles.cityBadge}>{event.city}</Text>
            <Text style={[styles.priceBadge, isFree ? styles.freePrice : styles.paidPrice]}>
              {isFree ? 'Free' : `₹${event.price?.amount}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={[styles.featuredCard, { width: CARD_WIDTH }]}
        onPress={() => onPress(event)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: imageUri }} style={styles.featuredImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.featuredGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor(event.category) }]}>
            <Text style={[styles.categoryText, { color: '#fff' }]}>{event.category}</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredMetaText}>📅 {formatDate(event.date)}</Text>
            <Text style={styles.featuredMetaText}>📍 {event.city}</Text>
          </View>
        </LinearGradient>
        {event.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(event)} activeOpacity={0.8}>
      <Image source={{ uri: imageUri }} style={styles.cardImage} contentFit="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(3,7,18,0.7)']}
        style={styles.cardImageOverlay}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor(event.category) + '22' }]}>
            <Text style={[styles.categoryText, { color: categoryColor(event.category) }]}>
              {event.category}
            </Text>
          </View>
          <Text style={[styles.priceBadge, isFree ? styles.freePrice : styles.paidPrice]}>
            {isFree ? 'Free' : `₹${event.price?.amount}`}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>📅 {formatDate(event.date)}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta} numberOfLines={1}>📍 {event.venue}, {event.city}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    height: 80,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priceBadge: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  freePrice: {
    color: colors.success,
    backgroundColor: colors.success + '22',
  },
  paidPrice: {
    color: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  cityBadge: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
  },
  // Featured variant
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 14,
    height: 220,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    padding: 16,
    justifyContent: 'flex-end',
  },
  featuredTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 6,
    lineHeight: 22,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  featuredMetaText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(250,204,21,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
  },
  featuredBadgeText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '800',
  },
  // Compact variant
  compactCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactImage: {
    width: 100,
    height: 100,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 4,
  },
  compactMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 4,
  },
  compactBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
});
