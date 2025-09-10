// Imports 
import API from "./api";

// CohortService
export default cohortService = {

    // Get upcoming items
    getUpcomingItems: async (upcomingData) => {
        try {
            const res = await API.get('/upcoming', upcomingData);
            return res.data;
        } catch (error) {
            console.error('Error fetching upcoming items:', error.response?.data || error.message);
            throw error;
        }
    },
}