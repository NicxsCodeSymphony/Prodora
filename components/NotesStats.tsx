import { Theme } from '@/constants/Theme';
import { NoteStats } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NotesStatsProps {
  stats: NoteStats;
}

const statIcons = {
  total: 'document-text',
  pinned: 'pin',
  archived: 'archive',
};

const statColors = {
  total: Theme.colors.primary,
  pinned: Theme.colors.accent,
  archived: Theme.colors.textSecondary,
};

export default function NotesStats({ stats }: NotesStatsProps) {
  return (
    <View style={styles.container}>
      {/* Main Stats */}
      <View style={styles.mainStats}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: statColors.total + '20' }]}>
            <Ionicons name={statIcons.total as any} size={24} color={statColors.total} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Notes</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: statColors.pinned + '20' }]}>
            <Ionicons name={statIcons.pinned as any} size={24} color={statColors.pinned} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.pinned}</Text>
            <Text style={styles.statLabel}>Pinned</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: statColors.archived + '20' }]}>
            <Ionicons name={statIcons.archived as any} size={24} color={statColors.archived} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>{stats.archived}</Text>
            <Text style={styles.statLabel}>Archived</Text>
          </View>
        </View>
      </View>

      {/* Category Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Category</Text>
        <View style={styles.categoryStats}>
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <View key={category} style={styles.categoryStat}>
              <View style={styles.categoryDot} />
              <Text style={styles.categoryName}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text style={styles.categoryCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Priority Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Priority</Text>
        <View style={styles.priorityStats}>
          {Object.entries(stats.byPriority).map(([priority, count]) => (
            <View key={priority} style={styles.priorityStat}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
              <Text style={styles.priorityName}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
              <Text style={styles.priorityCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function getPriorityColor(priority: string): string {
  const colors = {
    low: '#00B894',
    medium: '#FDCB6E',
    high: '#E17055',
    urgent: '#D63031',
  };
  return colors[priority as keyof typeof colors] || Theme.colors.textSecondary;
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  mainStats: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  categoryStats: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary,
    marginRight: Theme.spacing.md,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  priorityStats: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Theme.spacing.md,
  },
  priorityName: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  priorityCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
}); 