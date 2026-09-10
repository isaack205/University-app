// Imports
import API from "./api";

export const adminDashboardService = {

    // Admin summary metrics
    getDashboardSummary: async () => {
        try {
            const res = await API.get('/admin/dashboard/summary');
            return res.data;
        } catch (error) {
            console.error('Error fetching admin summary', error.response?.data || error.message);
            throw error;
        }
    },

    // Recent user activity feed
    getRecentActivity: async () => {
        try {
            const res = await API.get('/admin/dashboard/recent-activity');
            return res.data;
        } catch (error) {
            console.error('Error fetching recent activity', error.response?.data || error.message);
            throw error;
        }
    },

    // Feedback status breakdown
    getFeedbackSummary: async () => {
        try {
            const res = await API.get('/admin/dashboard/feedback-summary');
            return res.data;
        } catch (error) {
            console.error('Error fetching feedback summary', error.response?.data || error.message);
            throw error;
        }
    },

    // Push notification delivery stats (last 30 days)
    getDeliveryStats: async () => {
        try {
            const res = await API.get('/admin/dashboard/delivery-stats');
            return res.data;
        } catch (error) {
            console.error('Error fetching delivery stats', error.response?.data || error.message);
            throw error;
        }
    }
}