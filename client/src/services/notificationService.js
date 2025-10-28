// Imports
import API from "./api";

export const notificationService = {

    // Create notification
    createNotification: async (notificationData) => {
        try {
            const res = await API.post('/notifications', notificationData);
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch my notifications
    getMyNotifications: async () => {
        try {
            const res = await API.get('/notifications');
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    }, 

    // Mark notifications as read
    markAllNotificationsAsRead: async () => {
        try {
            const res = await API.patch('/notifications/mark-all-read');
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    },

    // Trigger notifications manually
    triggerRemindersManually: async () => {
        try {
            const res = await API.post('/notifications/trigger/reminders');
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    },

    // Toggle Notifications
    toggleNotifications: async () => {
        try {
            const res = await API.put('/notifications/toggle');
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificatioId) => {
        try {
            const res = await API.delete(`/notifications/${notificatioId}`);
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    },

    // Save subscription
    saveSubscription: async (subscription) => {
        try {
            const res = await API.post('/notifications/push/subscribe', { subscription: subscription });
            return res.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw error;
        }
    },
}