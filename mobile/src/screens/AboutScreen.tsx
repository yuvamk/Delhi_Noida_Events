import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const TEAM = [
  { emoji: '🎯', name: 'Yuvam', role: 'Founder', bio: 'Passionate about building communities through culture and tech.' },
  { emoji: '🎨', name: 'Aruna', role: 'Creative Director', bio: 'Curating the aesthetic pulse of Delhi & Noida.' },
  { emoji: '🎤', name: 'Abhishek', role: 'Head of Talent', bio: 'Connecting artists, performers and audiences across NCR.' },
];

export default function AboutScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient
          colors={[colors.primaryDark + 'cc', colors.secondary + '55', colors.surface]}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>⚡</Text>
          <Text style={styles.heroTitle}>The Electric Pulse of{'\n'}Delhi &amp; Noida</Text>
          <Text style={styles.heroSubtitle}>
            Your ultimate guide to events, culture, and experiences across the NCR
          </Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '15K+', label: 'Events' },
            { value: '500+', label: 'Organizers' },
            { value: '2', label: 'Cities' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Our Story */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.sectionBody}>
            Delhi and Noida are cities that never sleep — bursting with art exhibitions, live
            performances, tech conferences, food festivals, comedy nights, and so much more.
            But finding the right event at the right time was always a challenge.
          </Text>
          <Text style={styles.sectionBody}>
            VIBE was born to solve exactly that. We aggregate, curate, and surface the best
            events happening across the NCR so you never miss a moment that matters to you.
            From underground gigs in Hauz Khas to corporate summits in Sector 62, we've got it all.
          </Text>
          <Text style={styles.sectionBody}>
            We believe in the power of shared experiences to build stronger, more vibrant
            communities. Every event is an opportunity — to learn, connect, create, and celebrate.
          </Text>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet the Team</Text>
          {TEAM.map((member) => (
            <View key={member.name} style={styles.teamCard}>
              <View style={styles.teamAvatar}>
                <Text style={styles.teamEmoji}>{member.emoji}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
                <Text style={styles.teamBio}>{member.bio}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <LinearGradient
            colors={[colors.primary + '33', colors.secondary + '22']}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>Ready to explore?</Text>
            <Text style={styles.ctaSubtitle}>
              Thousands of events are waiting for you
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Events' })}
            >
              <Text style={styles.ctaBtnText}>🎪 Explore Events</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: 60 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh + 'cc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },
  hero: {
    paddingTop: 100,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 60, marginBottom: 16 },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: -16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
  },
  sectionBody: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  teamCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  teamAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamEmoji: { fontSize: 24 },
  teamInfo: { flex: 1 },
  teamName: { color: colors.white, fontSize: 16, fontWeight: '800' },
  teamRole: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  teamBio: { color: colors.onSurfaceVariant, fontSize: 13, marginTop: 6, lineHeight: 18 },
  cta: { paddingHorizontal: 20, paddingTop: 28 },
  ctaGradient: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  ctaTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  ctaSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 100,
  },
  ctaBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
});
