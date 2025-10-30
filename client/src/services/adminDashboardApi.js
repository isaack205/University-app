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
    }
}