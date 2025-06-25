export interface BaseEntity {
    id: string;
    createdAt: number;
    updatedAt?: number;
}

export interface Budget extends BaseEntity {
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: 'high' | 'medium' | 'low';
    note?: string;
    status: 'active' | 'completed' | 'archived';
    completedAt?: string;
}

export interface Category extends BaseEntity {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
}

export interface Transaction extends BaseEntity {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
} 