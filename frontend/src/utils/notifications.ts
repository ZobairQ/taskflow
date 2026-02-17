/**
 * Notification utilities for browser notifications and reminders
 */

export interface NotificationSettings {
  enabled: boolean;
  timing: number[]; // Minutes before due date
  type: 'browser' | 'in-app' | 'both';
}

export interface ScheduledNotification {
  taskId: string;
  taskText: string;
  dueDate: string;
  notifyAt: number; // timestamp
  timing: number; // minutes before
}

// Check if browser notifications are supported
export const areNotificationsSupported = (): boolean => {
  return 'Notification' in window;
};

// Check if notifications are permitted
export const areNotificationsPermitted = (): boolean => {
  return areNotificationsSupported() && Notification.permission === 'granted';
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!areNotificationsSupported()) {
    console.warn('Browser notifications are not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show a browser notification
export const showNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  if (!areNotificationsPermitted()) {
    console.warn('Notifications not permitted');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
};

// Show task due notification
export const showTaskDueNotification = (
  taskText: string,
  dueDate: string,
  minutesUntil: number
): Notification | null => {
  let timeMessage = '';
  if (minutesUntil <= 0) {
    timeMessage = 'is due now!';
  } else if (minutesUntil < 60) {
    timeMessage = `is due in ${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutesUntil / 60);
    timeMessage = `is due in ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return showNotification(`Task Reminder: ${taskText}`, {
    body: `Your task "${taskText}" ${timeMessage}`,
    tag: `task-due-${dueDate}`,
    requireInteraction: true,
  });
};

// Schedule notifications for a task
export const scheduleNotifications = (
  taskId: string,
  taskText: string,
  dueDate: string,
  timings: number[] = [15, 60, 1440] // 15min, 1hr, 24hr
): ScheduledNotification[] => {
  const due = new Date(dueDate);
  const now = new Date();
  const notifications: ScheduledNotification[] = [];

  timings.forEach((timing) => {
    const notifyAt = new Date(due.getTime() - timing * 60 * 1000);

    // Only schedule if the notification time is in the future
    if (notifyAt > now) {
      notifications.push({
        taskId,
        taskText,
        dueDate,
        notifyAt: notifyAt.getTime(),
        timing,
      });
    }
  });

  return notifications;
};

// Store scheduled notifications in localStorage
export const storeScheduledNotifications = (notifications: ScheduledNotification[]): void => {
  localStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
};

// Get scheduled notifications from localStorage
export const getScheduledNotifications = (): ScheduledNotification[] => {
  const stored = localStorage.getItem('scheduledNotifications');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse scheduled notifications:', error);
      return [];
    }
  }
  return [];
};

// Check and trigger due notifications
export const checkNotifications = (): void => {
  const notifications = getScheduledNotifications();
  const now = Date.now();
  const triggered: number[] = [];

  notifications.forEach((notification) => {
    // Check if it's time to trigger (within 1 minute window)
    if (Math.abs(now - notification.notifyAt) < 60000) {
      showTaskDueNotification(
        notification.taskText,
        notification.dueDate,
        notification.timing
      );
      triggered.push(notification.notifyAt);
    }
  });

  // Remove triggered notifications
  if (triggered.length > 0) {
    const remaining = notifications.filter(
      (n) => !triggered.includes(n.notifyAt)
    );
    storeScheduledNotifications(remaining);
  }
};

// Clear all scheduled notifications
export const clearScheduledNotifications = (): void => {
  localStorage.removeItem('scheduledNotifications');
};

// Clear notifications for a specific task
export const clearTaskNotifications = (taskId: string): void => {
  const notifications = getScheduledNotifications();
  const remaining = notifications.filter((n) => n.taskId !== taskId);
  storeScheduledNotifications(remaining);
};

// Start notification checker (call once on app load)
let notificationInterval: NodeJS.Timeout | null = null;

export const startNotificationChecker = (): void => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  // Check every minute
  notificationInterval = setInterval(checkNotifications, 60000);

  // Also check immediately
  checkNotifications();
};

export const stopNotificationChecker = (): void => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
};
