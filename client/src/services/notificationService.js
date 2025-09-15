// Imports
import API from "./api";

export const notificationService ={

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
}