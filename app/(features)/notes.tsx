import NoteModal from '@/components/modals/NoteModal';
import NoteCard from '@/components/NoteCard';
import NotesFilter from '@/components/NotesFilter';
import NotesStats from '@/components/NotesStats';
import Button from '@/components/ui/Button';
import { Theme } from '@/constants/Theme';
import { Note, NoteFilter, NoteStats } from '@/types/notes';
import { notesService } from '@/utils/notesService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<NoteStats | null>(null);
  const [filter, setFilter] = useState<NoteFilter>({
    searchQuery: '',
    category: undefined,
    priority: undefined,
    tags: [],
    showArchived: false,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Initialize service and load data
  useEffect(() => {
    initializeNotes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
      loadStats();
      loadTags();
    }, [filter])
  );

  const initializeNotes = async () => {
    await notesService.initialize();
    loadNotes();
    loadStats();
    loadTags();
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const filteredNotes = await notesService.getFilteredNotes(filter);
      setNotes(filteredNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const noteStats = await notesService.getStats();
      setStats(noteStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await notesService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleCreateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await notesService.createNote(noteData);
      setIsModalVisible(false);
      loadNotes();
      loadStats();
      loadTags();
    } catch (error) {
      console.error('Failed to create note:', error);
      Alert.alert('Error', 'Failed to create note');
    }
  };

  const handleUpdateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedNote) return;
    
    try {
      await notesService.updateNote(selectedNote.id, noteData);
      setIsModalVisible(false);
      setSelectedNote(null);
      loadNotes();
      loadStats();
      loadTags();
    } catch (error) {
      console.error('Failed to update note:', error);
      Alert.alert('Error', 'Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notesService.deleteNote(id);
              loadNotes();
              loadStats();
              loadTags();
            } catch (error) {
              console.error('Failed to delete note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handlePinNote = async (id: string) => {
    try {
      await notesService.togglePin(id);
      loadNotes();
      loadStats();
    } catch (error) {
      console.error('Failed to pin note:', error);
      Alert.alert('Error', 'Failed to pin note');
    }
  };

  const handleArchiveNote = async (id: string) => {
    try {
      await notesService.toggleArchive(id);
      loadNotes();
      loadStats();
    } catch (error) {
      console.error('Failed to archive note:', error);
      Alert.alert('Error', 'Failed to archive note');
    }
  };

  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setIsModalVisible(true);
  };

  const handleFilterChange = (newFilter: NoteFilter) => {
    setFilter(newFilter);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={Theme.colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No notes found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {filter.searchQuery || filter.category || filter.priority || (filter.tags && filter.tags.length > 0)
          ? 'Try adjusting your filters'
          : 'Create your first note to get started'
        }
      </Text>
      {!filter.searchQuery && !filter.category && !filter.priority && (!filter.tags || filter.tags.length === 0) && (
        <Button
          title="Create Note"
          onPress={() => setIsModalVisible(true)}
          style={styles.createButton}
        />
      )}
    </View>
  );

  const renderNote = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={handleNotePress}
      onPin={handlePinNote}
      onArchive={handleArchiveNote}
      onDelete={handleDeleteNote}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Notes</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsStatsVisible(!isStatsVisible)}
            >
              <Ionicons 
                name="stats-chart" 
                size={24} 
                color={isStatsVisible ? Theme.colors.primary : Theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Panel */}
        {isStatsVisible && stats && (
          <NotesStats stats={stats} />
        )}
      </View>

      {/* Filter */}
      <NotesFilter
        filter={filter}
        onFilterChange={handleFilterChange}
        availableTags={availableTags}
      />

      {/* Notes List */}
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNotes}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          notes.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Create Note FAB */}
      {notes.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={Theme.colors.surface} />
        </TouchableOpacity>
      )}

      {/* Note Modal */}
      <NoteModal
        visible={isModalVisible}
        note={selectedNote}
        onSave={selectedNote ? handleUpdateNote : handleCreateNote}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedNote(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  headerButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  listContainer: {
    padding: Theme.spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  listHeader: {
    marginBottom: Theme.spacing.md,
  },
  listHeaderText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.xl,
  },
  createButton: {
    minWidth: 150,
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.xl,
    right: Theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});