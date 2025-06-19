import * as FileSystem from 'expo-file-system';

interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt?: number;
}

export class FileSystemManager<T extends BaseEntity> {
  private filePath: string;

  constructor(fileName: string) {
    this.filePath = FileSystem.documentDirectory + fileName;
  }

  async initialize(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.filePath);
      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(this.filePath, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Initialization error:', error);
      throw new Error(`Failed to initialize storage for ${this.filePath}`);
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const content = await FileSystem.readAsStringAsync(this.filePath);
      return JSON.parse(content);
    } catch (error) {
      console.error('Read error:', error);
      throw new Error('Failed to read data');
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const items = await this.getAll();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Read error:', error);
      throw new Error('Failed to read data');
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const items = await this.getAll();
      const newItem = {
        ...data,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as T;

      await FileSystem.writeAsStringAsync(
        this.filePath,
        JSON.stringify([...items, newItem])
      );

      return newItem;
    } catch (error) {
      console.error('Create error:', error);
      throw new Error('Failed to create item');
    }
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      const items = await this.getAll();
      const index = items.findIndex(item => item.id === id);

      if (index === -1) {
        throw new Error('Item not found');
      }

      const updatedItem = {
        ...items[index],
        ...updates,
        updatedAt: Date.now(),
      };

      items[index] = updatedItem;

      await FileSystem.writeAsStringAsync(
        this.filePath,
        JSON.stringify(items)
      );

      return updatedItem;
    } catch (error) {
      console.error('Update error:', error);
      throw new Error('Failed to update item');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const items = await this.getAll();
      const filtered = items.filter(item => item.id !== id);

      await FileSystem.writeAsStringAsync(
        this.filePath,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete item');
    }
  }

  async query(predicate: (item: T) => boolean): Promise<T[]> {
    try {
      const items = await this.getAll();
      return items.filter(predicate);
    } catch (error) {
      console.error('Query error:', error);
      throw new Error('Failed to query items');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const item = await this.getById(id);
      return item !== null;
    } catch (error) {
      console.error('Exists check error:', error);
      throw new Error('Failed to check item existence');
    }
  }

  async count(): Promise<number> {
    try {
      const items = await this.getAll();
      return items.length;
    } catch (error) {
      console.error('Count error:', error);
      throw new Error('Failed to count items');
    }
  }
} 