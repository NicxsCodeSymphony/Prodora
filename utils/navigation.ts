export type AppRoute = 
  | '/(features)/focus'
  | '/auth/AccountAuth'
  | '/(features)/account'
  | '/(features)/financial'
  | '/(features)/calendar'
  | '/(features)/budget'
  | null;

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: AppRoute;
}

export const features: Feature[] = [
  {
    id: 1,
    title: 'Focus',
    description: 'Focus timer for productivity',
    icon: '🍅',
    color: '#FF6B6B',
    route: '/(features)/focus',
  },
  {
    id: 2,
    title: 'Financial',
    description: 'Track your expenses & budget',
    icon: '💰',
    color: '#4ECDC4',
    route: '/(features)/financial',
  },
  {
    id: 3,
    title: 'Account',
    description: 'Never miss important dates',
    icon: '⏰',
    color: '#45B7D1',
    route: '/auth/AccountAuth',
  },
  {
    id: 4,
    title: 'Task',
    description: 'Organize your daily tasks',
    icon: '✅',
    color: '#96CEB4',
    route: null,
  },
  {
    id: 5,
    title: 'Notes',
    description: 'Quick notes & reminders',
    icon: '📝',
    color: '#FFEAA7',
    route: null,
  },
  {
    id: 6,
    title: 'Analytics',
    description: 'Track your progress',
    icon: '📊',
    color: '#DDA0DD',
    route: null,
  },
  {
    id: 7,
    title: 'Settings',
    description: 'App configuration',
    icon: '⚙️',
    color: '#FFB347',
    route: null,
  },
  {
    id: 8,
    title: 'More',
    description: 'Additional features',
    icon: '⋯',
    color: '#9B59B6',
    route: null,
  },
]; 