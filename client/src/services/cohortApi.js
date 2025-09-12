// Imports 
import API from "./api";

// CohortService
export const cohortService = {

    // Create cohort
    createCohort: async (cohortData) => {
        try {
            const res = await API.post('/cohort', cohortData);
            return res.data;
        } catch (error) {
            console.error('Error creating cohort:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch all cohorts
    getAllCohorts: async () => {
        try {
            const res = await API.get('/cohort/cohorts');
            return res.data;
        } catch (error) {
            console.error('Error fetching all cohorts:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get cohorts by courseId
    getCohortsByCourse: async (courseId) => {
        try {
            const res = await API.get(`/cohort/course/${courseId}`, );
            return res.data;
        } catch (error) {
            console.error('Error fetching cohort by course:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get cohort by Id
    getCohortById: async (cohortId) => {
        try {
            const res = await API.get(`/cohort/${cohortId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching cohort by Id:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update cohort
    updateCohort: async (cohortId, updatedData) => {
        try {
            const res = await API.put(`/cohort/${cohortId}`, updatedData);
            return res.data;
        } catch (error) {
            console.error('Error updating cohort:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete cohort
    deleteCohort: async (cohortId) => {
        try {
            const res = await API.delete(`/cohort/${cohortId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting cohort:', error.response?.data || error.message);
            throw error;
        }
    },
}