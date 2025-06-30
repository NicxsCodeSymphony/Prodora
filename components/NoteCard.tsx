import { Theme } from '@/constants/Theme';
import { Note, NoteCategory, NotePriority } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isLargeScreen = width >= 768;

const categoryColors: Record<NoteCategory, string> = {
  personal: '#FF6B6B',
  work: '#4ECDC4',
  ideas: '#45B7D1',
  todo: '#96CEB4',
  journal: '#FFEAA7',
  study: '#DDA0DD',
  other: '#A8E6CF',
};

const priorityColors: Record<NotePriority, string> = {
  low: '#00B894',
  medium: '#FDCB6E',
  high: '#E17055',
  urgent: '#D63031',
};

const priorityIcons: Record<NotePriority, string> = {
  low: 'flag-outline',
  medium: 'flag',
  high: 'flag',
  urgent: 'warning',
};

export default function NoteCard({ note, onPress, onPin, onArchive, onDelete }: NoteCardProps) {
  const getContentLength = () => {
    if (isSmallScreen) return 80;
    if (isMediumScreen) return 100;
    return 120;
  };

  const truncatedContent = note.content.length > getContentLength() 
    ? `${note.content.substring(0, getContentLength())}...` 
    : note.content;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM dd');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, note.isPinned && styles.pinnedContainer]} 
      onPress={() => onPress(note)}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {note.title}
            </Text>
            {note.isPinned && (
              <Ionicons name="pin" size={isSmallScreen ? 14 : 16} color={Theme.colors.primary} />
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onPin(note.id)}
            >
              <Ionicons 
                name={note.isPinned ? "pin" : "pin-outline"} 
                size={isSmallScreen ? 16 : 18} 
                color={note.isPinned ? Theme.colors.primary : Theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onArchive(note.id)}
            >
              <Ionicons 
                name={note.isArchived ? "archive" : "archive-outline"} 
                size={isSmallScreen ? 16 : 18} 
                color={note.isArchived ? Theme.colors.accent : Theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onDelete(note.id)}
            >
              <Ionicons name="trash-outline" size={isSmallScreen ? 16 : 18} color={Theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.content} numberOfLines={isSmallScreen ? 2 : 3}>
          {truncatedContent}
        </Text>

        {/* Tags */}
        {note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, isSmallScreen ? 2 : 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {note.tags.length > (isSmallScreen ? 2 : 3) && (
              <Text style={styles.moreTags}>+{note.tags.length - (isSmallScreen ? 2 : 3)}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.metadata}>
            <View style={styles.categoryContainer}>
              <View 
                style={[
                  styles.categoryDot, 
                  { backgroundColor: categoryColors[note.category] }
                ]} 
              />
              <Text style={styles.categoryText}>
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </Text>
            </View>
            
            <View style={styles.priorityContainer}>
              <Ionicons 
                name={priorityIcons[note.priority] as any} 
                size={isSmallScreen ? 12 : 14} 
                color={priorityColors[note.priority]} 
              />
              <Text style={[styles.priorityText, { color: priorityColors[note.priority] }]}>
                {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.date}>
            {formatDate(note.updatedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: isSmallScreen ? Theme.spacing.sm : Theme.spacing.md,
  },
  pinnedContainer: {
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: isSmallScreen ? Theme.spacing.md : Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minHeight: isSmallScreen ? 120 : 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  title: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    lineHeight: isSmallScreen ? 24 : 28,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: isSmallScreen ? Theme.spacing.xs : Theme.spacing.sm,
  },
  actionButton: {
    padding: isSmallScreen ? Theme.spacing.xs : Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    minWidth: isSmallScreen ? 32 : 36,
    minHeight: isSmallScreen ? 32 : 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'normal',
    lineHeight: isSmallScreen ? 18 : 20,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.sm,
  },
  tag: {
    backgroundColor: Theme.colors.surfaceHighlight,
    paddingHorizontal: isSmallScreen ? Theme.spacing.sm : Theme.spacing.md,
    paddingVertical: isSmallScreen ? Theme.spacing.xs : Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  tagText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'normal',
    lineHeight: isSmallScreen ? 16 : 20,
    color: Theme.colors.textSecondary,
  },
  moreTags: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'normal',
    lineHeight: isSmallScreen ? 16 : 20,
    color: Theme.colors.textSecondary,
    alignSelf: 'center',
    marginLeft: Theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  metadata: {
    flexDirection: 'row',
    gap: isSmallScreen ? Theme.spacing.sm : Theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  categoryDot: {
    width: isSmallScreen ? 6 : 8,
    height: isSmallScreen ? 6 : 8,
    borderRadius: isSmallScreen ? 3 : 4,
  },
  categoryText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'normal',
    lineHeight: isSmallScreen ? 16 : 20,
    color: Theme.colors.textSecondary,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  priorityText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    lineHeight: isSmallScreen ? 16 : 20,
  },
  date: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'normal',
    lineHeight: isSmallScreen ? 16 : 20,
    color: Theme.colors.textSecondary,
  },
}); 