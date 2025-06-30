import { Theme } from '@/constants/Theme';
import { NoteCategory, NoteFilter, NotePriority } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NotesFilterProps {
  filter: NoteFilter;
  onFilterChange: (filter: NoteFilter) => void;
  availableTags: string[];
}

const categories: { value: NoteCategory; label: string; icon: string }[] = [
  { value: 'personal', label: 'Personal', icon: 'person' },
  { value: 'work', label: 'Work', icon: 'briefcase' },
  { value: 'ideas', label: 'Ideas', icon: 'bulb' },
  { value: 'todo', label: 'Todo', icon: 'checkmark-circle' },
  { value: 'journal', label: 'Journal', icon: 'book' },
  { value: 'study', label: 'Study', icon: 'school' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const priorities: { value: NotePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#00B894' },
  { value: 'medium', label: 'Medium', color: '#FDCB6E' },
  { value: 'high', label: 'High', color: '#E17055' },
  { value: 'urgent', label: 'Urgent', color: '#D63031' },
];

const sortOptions = [
  { value: 'updatedAt', label: 'Last Modified' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
];

export default function NotesFilter({ filter, onFilterChange, availableTags }: NotesFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags || []);

  const updateFilter = (updates: Partial<NoteFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateFilter({ tags: newTags });
  };

  const clearFilters = () => {
    setSelectedTags([]);
    onFilterChange({
      searchQuery: '',
      category: undefined,
      priority: undefined,
      tags: [],
      showArchived: false,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filter.searchQuery || filter.category || filter.priority || 
    (filter.tags && filter.tags.length > 0) || filter.showArchived;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={filter.searchQuery}
            onChangeText={(text) => updateFilter({ searchQuery: text })}
            placeholder="Search notes..."
            placeholderTextColor={Theme.colors.textSecondary}
          />
          {filter.searchQuery && (
            <TouchableOpacity onPress={() => updateFilter({ searchQuery: '' })}>
              <Ionicons name="close-circle" size={20} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={hasActiveFilters ? Theme.colors.surface : Theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    !filter.category && styles.categoryButtonActive
                  ]}
                  onPress={() => updateFilter({ category: undefined })}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    !filter.category && styles.categoryButtonTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      filter.category === cat.value && styles.categoryButtonActive
                    ]}
                    onPress={() => updateFilter({ category: cat.value })}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={16} 
                      color={filter.category === cat.value ? Theme.colors.surface : Theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      filter.category === cat.value && styles.categoryButtonTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityContainer}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    !filter.priority && styles.priorityButtonActive
                  ]}
                  onPress={() => updateFilter({ priority: undefined })}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    !filter.priority && styles.priorityButtonTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                {priorities.map((pri) => (
                  <TouchableOpacity
                    key={pri.value}
                    style={[
                      styles.priorityButton,
                      filter.priority === pri.value && styles.priorityButtonActive,
                      { borderColor: pri.color }
                    ]}
                    onPress={() => updateFilter({ priority: pri.value })}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      filter.priority === pri.value && { color: pri.color }
                    ]}>
                      {pri.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {availableTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagButton,
                        selectedTags.includes(tag) && styles.tagButtonActive
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[
                        styles.tagButtonText,
                        selectedTags.includes(tag) && styles.tagButtonTextActive
                      ]}>
                        #{tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      filter.sortBy === option.value && styles.sortButtonActive
                    ]}
                    onPress={() => updateFilter({ sortBy: option.value as any })}
                  >
                    <Text style={[
                      styles.sortButtonText,
                      filter.sortBy === option.value && styles.sortButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.sortOrderContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    filter.sortOrder === 'asc' && styles.sortOrderButtonActive
                  ]}
                  onPress={() => updateFilter({ sortOrder: 'asc' })}
                >
                  <Ionicons name="arrow-up" size={16} color={filter.sortOrder === 'asc' ? Theme.colors.surface : Theme.colors.textSecondary} />
                  <Text style={[
                    styles.sortOrderButtonText,
                    filter.sortOrder === 'asc' && styles.sortOrderButtonTextActive
                  ]}>
                    Ascending
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    filter.sortOrder === 'desc' && styles.sortOrderButtonActive
                  ]}
                  onPress={() => updateFilter({ sortOrder: 'desc' })}
                >
                  <Ionicons name="arrow-down" size={16} color={filter.sortOrder === 'desc' ? Theme.colors.surface : Theme.colors.textSecondary} />
                  <Text style={[
                    styles.sortOrderButtonText,
                    filter.sortOrder === 'desc' && styles.sortOrderButtonTextActive
                  ]}>
                    Descending
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Archive Toggle */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.archiveToggle}
                onPress={() => updateFilter({ showArchived: !filter.showArchived })}
              >
                <Ionicons 
                  name={filter.showArchived ? "archive" : "archive-outline"} 
                  size={20} 
                  color={filter.showArchived ? Theme.colors.accent : Theme.colors.textSecondary} 
                />
                <Text style={styles.archiveToggleText}>Show Archived</Text>
              </TouchableOpacity>
            </View>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Ionicons name="refresh" size={16} color={Theme.colors.error} />
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceHighlight,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    paddingVertical: Theme.spacing.md,
  },
  filterButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  filterPanel: {
    maxHeight: 400,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  filterSection: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  categoryButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Theme.colors.surface,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  priorityButtonActive: {
    backgroundColor: Theme.colors.surface,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
  },
  priorityButtonTextActive: {
    color: Theme.colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  tagButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  tagButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  tagButtonText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  tagButtonTextActive: {
    color: Theme.colors.surface,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  sortButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  sortButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
  },
  sortButtonTextActive: {
    color: Theme.colors.surface,
  },
  sortOrderContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  sortOrderButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  sortOrderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
  },
  sortOrderButtonTextActive: {
    color: Theme.colors.surface,
  },
  archiveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
  },
  archiveToggleText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.surface,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.error,
  },
}); 