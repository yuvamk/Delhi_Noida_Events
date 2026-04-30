import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  count?: number;
  height?: number;
  borderRadius?: number;
}

export function SkeletonBox({ height = 20, borderRadius = 8 }: { height?: number; borderRadius?: number }) {
  return <View style={[styles.skeleton, { height, borderRadius }]} />;
}

export function EventCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox height={180} borderRadius={0} />
      <View style={styles.content}>
        <View style={styles.row}>
          <SkeletonBox height={20} />
          <SkeletonBox height={20} />
        </View>
        <SkeletonBox height={18} />
        <SkeletonBox height={14} />
        <SkeletonBox height={14} />
      </View>
    </View>
  );
}

export function EventsGridSkeleton({ count = 6 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </>
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
  content: {
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  skeleton: {
    backgroundColor: colors.surfaceContainerHighest,
    flex: 1,
  },
});
