import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEventDetail } from '../hooks/useEvents';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../contexts/AuthContext';
import { eventsApi } from '../api/client';
import { EventCard } from '../components/EventCard';
import { colors } from '../theme/colors';

export default function EventDetailScreen({ navigation, route }: any) {
  const { eventId } = route.params;
  const { event, relatedEvents, loading, error } = useEventDetail(eventId);
  const { isAuthenticated } = useAuth();
  const { addBookmark, removeBookmark, checkBookmark } = useBookmarks();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      eventsApi.trackView(eventId).catch(() => {});
    }
  }, [eventId]);

  useEffect(() => {
    if (isAuthenticated && eventId) {
      checkBookmark(eventId).then(setIsBookmarked);
    }
  }, [isAuthenticated, eventId]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    setBookmarkLoading(true);
    if (isBookmarked) {
      await removeBookmark(eventId);
      setIsBookmarked(false);
    } else {
      await addBookmark(eventId);
      setIsBookmarked(true);
    }
    setBookmarkLoading(false);
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        title: event.title,
        message: `Check out this event: ${event.title}\n📅 ${formatDate(event.date)}\n📍 ${event.venue}, ${event.city}\n\nDiscover more at Delhi & Noida Events`,
      });
    } catch {}
  };

  const handleRegister = () => {
    if (event?.registrationUrl) {
      Linking.openURL(event.registrationUrl).catch(() => {});
    }
  };

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>😕 {error || 'Event not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFree = event.price?.type === 'Free' || event.price?.amount === 0;
  const imageUri = event.images?.[0] || 'https://placehold.co/800x400/1e2433/6366f1?text=Event';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageUri }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(3,7,18,1)']}
            style={styles.heroGradient}
          />
          {/* Back & Actions */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.actionBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.actionBtnsRight}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Text style={styles.actionBtnText}>⎙</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark} disabled={bookmarkLoading}>
                <Text style={styles.actionBtnText}>{isBookmarked ? '🔖' : '🔗'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.heroBadges}>
            {event.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
              </View>
            )}
            {event.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Category & Price */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <Text style={[styles.priceBadge, isFree ? styles.freePrice : styles.paidPrice]}>
              {isFree ? '🆓 Free' : `₹${event.price?.amount}`}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Key Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>📅</Text>
              <View>
                <Text style={styles.infoCardLabel}>Date</Text>
                <Text style={styles.infoCardValue}>{formatDate(event.date)}</Text>
                {event.time && <Text style={styles.infoCardSub}>{event.time}</Text>}
              </View>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoCardLabel}>Venue</Text>
                <Text style={styles.infoCardValue} numberOfLines={2}>{event.venue}</Text>
                <Text style={styles.infoCardSub} numberOfLines={1}>{event.address}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>🏙️</Text>
              <View>
                <Text style={styles.infoCardLabel}>City</Text>
                <Text style={styles.infoCardValue}>{event.city}</Text>
              </View>
            </View>
            {event.capacity && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardIcon}>👥</Text>
                <View>
                  <Text style={styles.infoCardLabel}>Capacity</Text>
                  <Text style={styles.infoCardValue}>{event.attendees || 0}/{event.capacity}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Organizer */}
          <View style={styles.organizerCard}>
            <Text style={styles.sectionTitle}>🎪 Organizer</Text>
            <View style={styles.organizerRow}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerAvatarText}>
                  {event.organizer?.name?.[0]?.toUpperCase() || 'O'}
                </Text>
              </View>
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.organizer?.name}</Text>
                {event.organizer?.verified && (
                  <Text style={styles.organizerVerified}>✓ Verified Organizer</Text>
                )}
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>📄 About this Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <View style={styles.speakersSection}>
              <Text style={styles.sectionTitle}>🎤 Speakers</Text>
              {event.speakers.map((speaker, idx) => (
                <View key={idx} style={styles.speakerCard}>
                  <View style={styles.speakerAvatar}>
                    <Text style={styles.speakerAvatarText}>
                      {speaker.name?.[0]?.toUpperCase() || 'S'}
                    </Text>
                  </View>
                  <View style={styles.speakerInfo}>
                    <Text style={styles.speakerName}>{speaker.name}</Text>
                    {speaker.designation && (
                      <Text style={styles.speakerDesignation}>{speaker.designation}</Text>
                    )}
                    {speaker.bio && (
                      <Text style={styles.speakerBio} numberOfLines={2}>{speaker.bio}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>🏷️ Tags</Text>
              <View style={styles.tagsRow}>
                {event.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>🎯 Related Events</Text>
              {relatedEvents.slice(0, 3).map((e) => (
                <EventCard
                  key={e._id}
                  event={e}
                  onPress={(ev) => navigation.push('EventDetail', { eventId: ev._id })}
                  variant="compact"
                />
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerBtnText}>
            {event.price?.type === 'RSVP' ? 'RSVP Now' : isFree ? 'Register for Free' : `Register — ₹${event.price?.amount}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bookmarkCtaBtn, isBookmarked && styles.bookmarkCtaBtnActive]}
          onPress={handleBookmark}
        >
          <Text style={styles.bookmarkCtaBtnText}>{isBookmarked ? '🔖' : '🔗'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, padding: 32 },
  errorText: { color: colors.onSurfaceVariant, fontSize: 16, textAlign: 'center', marginBottom: 20 },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  backBtnText: { color: colors.white, fontWeight: '700' },
  heroContainer: { position: 'relative', height: 320 },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroActions: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtnsRight: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionBtnText: { color: colors.white, fontSize: 16 },
  heroBadges: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: 'rgba(250,204,21,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  featuredBadgeText: { color: '#facc15', fontSize: 11, fontWeight: '800' },
  verifiedBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  verifiedBadgeText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  content: { padding: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryBadge: { backgroundColor: colors.primary + '22', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  categoryText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  priceBadge: { fontSize: 13, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  freePrice: { color: colors.success, backgroundColor: colors.success + '22' },
  paidPrice: { color: colors.primary, backgroundColor: colors.primary + '22' },
  title: { color: colors.white, fontSize: 26, fontWeight: '900', lineHeight: 34, marginBottom: 20 },
  infoCards: { gap: 12, marginBottom: 20 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardIcon: { fontSize: 22 },
  infoCardLabel: { color: colors.onSurfaceVariant, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoCardValue: { color: colors.white, fontSize: 15, fontWeight: '700' },
  infoCardSub: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  organizerCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerAvatarText: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  organizerInfo: {},
  organizerName: { color: colors.white, fontSize: 15, fontWeight: '700' },
  organizerVerified: { color: colors.success, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  descSection: { marginBottom: 20 },
  description: { color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 22 },
  speakersSection: { marginBottom: 20 },
  speakerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  speakerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerAvatarText: { color: colors.secondary, fontSize: 16, fontWeight: '800' },
  speakerInfo: { flex: 1 },
  speakerName: { color: colors.white, fontSize: 14, fontWeight: '700' },
  speakerDesignation: { color: colors.primary, fontSize: 12, marginTop: 2 },
  speakerBio: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 4, lineHeight: 18 },
  tagsSection: { marginBottom: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { color: colors.onSurfaceVariant, fontSize: 12 },
  relatedSection: { marginBottom: 20 },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  registerBtnText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  bookmarkCtaBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkCtaBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  bookmarkCtaBtnText: { fontSize: 20 },
});
