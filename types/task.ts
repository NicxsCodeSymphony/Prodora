import { BaseEntity } from './budget';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task extends BaseEntity {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    tags?: string[];
    category?: string;
    note?: string;
    subtasks?: SubTask[];
    parentId?: string;
    order: number;
}

export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

export interface TaskCategory {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

export interface TaskTag {
    id: string;
    name: string;
    color: string;
} 