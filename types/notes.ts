export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  color?: string;
  attachments?: NoteAttachment[];
}

export interface NoteAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

export type NoteCategory = 
  | 'personal'
  | 'work'
  | 'ideas'
  | 'todo'
  | 'journal'
  | 'study'
  | 'other';

export type NotePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NoteFilter {
  category?: NoteCategory;
  priority?: NotePriority;
  tags?: string[];
  searchQuery?: string;
  showArchived?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface NoteStats {
  total: number;
  pinned: number;
  archived: number;
  byCategory: Record<NoteCategory, number>;
  byPriority: Record<NotePriority, number>;
} 