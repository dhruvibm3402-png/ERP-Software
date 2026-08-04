import { create } from 'zustand';

interface NotificationState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  unreadCount: 0,
  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
