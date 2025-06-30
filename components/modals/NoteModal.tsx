import Button from '@/components/ui/Button';
import { Theme } from '@/constants/Theme';
import { Note, NoteCategory, NotePriority } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface NoteModalProps {
  visible: boolean;
  note?: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
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

export default function NoteModal({ visible, note, onSave, onClose }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('personal');
  const [priority, setPriority] = useState<NotePriority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setPriority(note.priority);
      setTags([...note.tags]);
      setIsPinned(note.isPinned);
    } else {
      resetForm();
    }
  }, [note, visible]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('personal');
    setPriority('medium');
    setTags([]);
    setNewTag('');
    setIsPinned(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category,
      priority,
      tags: tags.filter(tag => tag.trim()),
      isPinned,
      isArchived: false,
    };

    onSave(noteData);
    resetForm();
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {note ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter note title..."
                placeholderTextColor={Theme.colors.textSecondary}
                maxLength={100}
              />
            </View>

            {/* Content */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="Write your note here..."
                placeholderTextColor={Theme.colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.categoryContainer}
                contentContainerStyle={{ paddingRight: Theme.spacing.md }}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && styles.categoryButtonActive
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={16} 
                      color={category === cat.value ? Theme.colors.surface : Theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat.value && styles.categoryButtonTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((pri) => (
                  <TouchableOpacity
                    key={pri.value}
                    style={[
                      styles.priorityButton,
                      priority === pri.value && styles.priorityButtonActive,
                      { borderColor: pri.color }
                    ]}
                    onPress={() => setPriority(pri.value)}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      priority === pri.value && { color: pri.color }
                    ]}>
                      {pri.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag..."
                  placeholderTextColor={Theme.colors.textSecondary}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
                  <Ionicons name="add" size={20} color={Theme.colors.primary} />
                </TouchableOpacity>
              </View>
              
              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <Ionicons name="close-circle" size={16} color={Theme.colors.surface} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Pin Toggle */}
            <View style={styles.inputGroup}>
              <TouchableOpacity 
                style={styles.pinContainer}
                onPress={() => setIsPinned(!isPinned)}
              >
                <Ionicons 
                  name={isPinned ? "pin" : "pin-outline"} 
                  size={20} 
                  color={isPinned ? Theme.colors.primary : Theme.colors.textSecondary} 
                />
                <Text style={styles.pinText}>Pin to top</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={note ? "Update" : "Create"}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    width: '100%',
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  closeButton: {
    padding: Theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceHighlight,
    minHeight: 200,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
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
  tagInputContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  addTagButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  tagText: {
    fontSize: 14,
    color: Theme.colors.surface,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
  },
  pinText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
}); 