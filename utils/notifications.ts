import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationOptions {
  title: string;
  body: string;
  sound?: boolean;
  trigger?: Notifications.NotificationTriggerInput | null;
}

/**
 * Request notification permissions
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

interface NotificationProps {
  title: string;
  body: string;
  sound?: boolean;
  trigger?: Date | number;
  ongoing?: boolean;
  identifier?: string;
}

export const showNotification = async ({ title, body, sound = true, ongoing = false, identifier }: NotificationProps) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound,
      sticky: ongoing, // Makes notification persistent
      autoDismiss: !ongoing, // Prevents auto-dismissal if ongoing
    },
    trigger: null,
    identifier
  });
};

export const updateNotification = async (identifier: string, { title, body, ongoing = false }: NotificationProps) => {
  // Cancel previous notification
  await Notifications.dismissNotificationAsync(identifier);
  
  // Show new notification with same ID
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sticky: ongoing,
      autoDismiss: !ongoing,
    },
    trigger: null,
  });
};

/**
 * Show a simple notification with title and body
 * @param title - Notification title
 * @param body - Notification body
 * @returns Promise<void>
 */
export const showSimpleNotification = async (title: string, body: string): Promise<void> => {
  await showNotification({ title, body });
};

export const scheduleNotification = async ({ title, body, sound = true, trigger }: NotificationProps) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound,
    },
    trigger: trigger instanceof Date ? { 
      date: trigger,
      type: 'date'
    } : null,
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}; 