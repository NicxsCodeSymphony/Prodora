import { Note, NoteFilter, NoteStats } from '@/types/notes';
import { FileSystemManager } from './fileSystemManager';

class NotesService {
  private fileManager: FileSystemManager<Note>;

  constructor() {
    this.fileManager = new FileSystemManager<Note>('notes.json');
  }

  async initialize() {
    try {
      await this.fileManager.initialize();
      console.log('Notes service initialized with file system storage');
    } catch (error) {
      console.error('Failed to initialize notes service:', error);
      throw error;
    }
  }

  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const newNote = await this.fileManager.create(noteData);
      return newNote;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    try {
      const updatedNote = await this.fileManager.update(id, updates);
      return updatedNote;
    } catch (error) {
      console.error('Failed to update note:', error);
      return null;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      await this.fileManager.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete note:', error);
      return false;
    }
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const note = await this.fileManager.getById(id);
      return note;
    } catch (error) {
      console.error('Failed to get note:', error);
      return null;
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const notes = await this.fileManager.getAll();
      return notes;
    } catch (error) {
      console.error('Failed to get all notes:', error);
      return [];
    }
  }

  async getFilteredNotes(filter: NoteFilter): Promise<Note[]> {
    try {
      let notes = await this.getAllNotes();

      // Filter by category
      if (filter.category) {
        notes = notes.filter(note => note.category === filter.category);
      }

      // Filter by priority
      if (filter.priority) {
        notes = notes.filter(note => note.priority === filter.priority);
      }

      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        notes = notes.filter(note =>
          filter.tags!.some(tag => note.tags.includes(tag))
        );
      }

      // Filter by search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        notes = notes.filter(note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Filter archived notes
      if (!filter.showArchived) {
        notes = notes.filter(note => !note.isArchived);
      }

      // Sort notes
      if (filter.sortBy) {
        notes.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (filter.sortBy) {
            case 'createdAt':
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            case 'updatedAt':
              aValue = a.updatedAt;
              bValue = b.updatedAt;
              break;
            case 'title':
              aValue = a.title.toLowerCase();
              bValue = b.title.toLowerCase();
              break;
            case 'priority':
              const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
              aValue = priorityOrder[a.priority];
              bValue = priorityOrder[b.priority];
              break;
            default:
              return 0;
          }

          if (filter.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Always show pinned notes first
      notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });

      return notes;
    } catch (error) {
      console.error('Failed to get filtered notes:', error);
      return [];
    }
  }

  async getStats(): Promise<NoteStats> {
    try {
      const notes = await this.getAllNotes();
      
      const stats: NoteStats = {
        total: notes.length,
        pinned: notes.filter(note => note.isPinned).length,
        archived: notes.filter(note => note.isArchived).length,
        byCategory: {
          personal: 0,
          work: 0,
          ideas: 0,
          todo: 0,
          journal: 0,
          study: 0,
          other: 0,
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
        },
      };

      notes.forEach(note => {
        stats.byCategory[note.category]++;
        stats.byPriority[note.priority]++;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        total: 0,
        pinned: 0,
        archived: 0,
        byCategory: {
          personal: 0,
          work: 0,
          ideas: 0,
          todo: 0,
          journal: 0,
          study: 0,
          other: 0,
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
        },
      };
    }
  }

  async togglePin(id: string): Promise<Note | null> {
    try {
      const note = await this.getNote(id);
      if (!note) return null;

      return await this.updateNote(id, { isPinned: !note.isPinned });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      return null;
    }
  }

  async toggleArchive(id: string): Promise<Note | null> {
    try {
      const note = await this.getNote(id);
      if (!note) return null;

      return await this.updateNote(id, { isArchived: !note.isArchived });
    } catch (error) {
      console.error('Failed to toggle archive:', error);
      return null;
    }
  }

  async addTag(id: string, tag: string): Promise<Note | null> {
    try {
      const note = await this.getNote(id);
      if (!note || note.tags.includes(tag)) return note;

      return await this.updateNote(id, { tags: [...note.tags, tag] });
    } catch (error) {
      console.error('Failed to add tag:', error);
      return null;
    }
  }

  async removeTag(id: string, tag: string): Promise<Note | null> {
    try {
      const note = await this.getNote(id);
      if (!note) return null;

      return await this.updateNote(id, { tags: note.tags.filter(t => t !== tag) });
    } catch (error) {
      console.error('Failed to remove tag:', error);
      return null;
    }
  }

  async getAllTags(): Promise<string[]> {
    try {
      const notes = await this.getAllNotes();
      const allTags = new Set<string>();
      notes.forEach(note => {
        note.tags.forEach(tag => allTags.add(tag));
      });
      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Failed to get all tags:', error);
      return [];
    }
  }
}

export const notesService = new NotesService(); 