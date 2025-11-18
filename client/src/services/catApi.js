// Imports 
import API from "./api";

// CAT service
export const catService = {

    // Create CAT
    createCAT: async (catData) => {
        try {
            const res = await API.post('/CAT', catData);
            return res.data;
        } catch (error) {
            console.error('Error creating CAT:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch CAT by Id 
    getCATById: async (id) => {
        try {
            const res = await API.get(`/CAT/${id}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching cat by Id:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch CATs for cohort
    getCATsForCohort: async (catData) => {
        try {
            const res = await API.get('/CAT', catData);
            return res.data;
        } catch (error) {
            console.error('Error fetching cohorts CAT(s):', error.response?.data || error.message);
            throw error;
        }
    },

    // Update CAT
    updateCAT: async (updatedCAT, catId) => {
        try {
            const res = await API.put(`/CAT/${catId}`, updatedCAT);
            return res.data;
        } catch (error) {
            console.error('Error updating CAT:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete CAT
    deleteCAT: async (catId) => {
        try {
            const res = await API.delete(`/CAT/${catId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting CAT:', error.response?.data || error.message);
            throw error;
        }
    },

    // Toggle publishing CAT
    togglePublishCAT: async (catId) => {
        try {
            const res = await API.patch(`/CAT/${catId}/publish`);
            return res.data;
        } catch (error) {
            console.error('Error publishing CAT:', error.response?.data || error.message);
            throw error;
        }
    },
}