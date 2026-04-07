import { create } from 'zustand';
import notificationService from '../services/notificationService';
import SocketService from '../socket';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,

    fetchNotifications: async (force = false) => {
        // Skip if data is already loaded and not forcing a refresh
        if (get().notifications.length > 0 && !force) return;

        set({ loading: true, error: null });
        try {
            const res = await notificationService.getNotifications();
            if (res.success) {
                const notifications = res.data;
                const unreadCount = notifications.filter(n => !n.isRead).length;
                set({ notifications, unreadCount, loading: false });
            }
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    addNotification: (notification) => {
        set((state) => {
            const updatedNotifications = [notification, ...state.notifications];
            return {
                notifications: updatedNotifications,
                unreadCount: state.unreadCount + 1
            };
        });
    },

    markAsRead: async (id) => {
        try {
            const res = await notificationService.markAsRead(id);
            if (res.success) {
                set((state) => ({
                    notifications: state.notifications.map(n => 
                        n._id === id ? { ...n, isRead: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            }
        } catch (err) {
            console.error("Mark as read failed", err);
        }
    },

    markAllAsRead: async () => {
        try {
            const res = await notificationService.markAllAsRead();
            if (res.success) {
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0
                }));
            }
        } catch (err) {
            console.error("Mark all as read failed", err);
        }
    },

}));

export default useNotificationStore;
