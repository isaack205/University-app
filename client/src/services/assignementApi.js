// Imports
import API from "./api";

// Assignement service
export default assignmentService = {

    // Create assignement
        createAssignment: async (assignementData) => {
        try {
            const res = await API.post('/assignements', assignementData)
            return res.data;
        } catch (error) {
            console.error('Error creating assignment', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch assignments by cohort
    getAssignmentsByCohort: async (cohortId) => {
        try {
            const res = await API.get(`/assignements/cohort/${cohortId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching assignment by cohort', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch assignments by id
    getAssignmentById: async (assignmentId) => {
        try {
            const res = await API.get(`/assignements/${assignmentId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching assignment by id', error.response?.data || error.message);
            throw error;
        }
    },

    // Update assignments by id
    updateAssignment: async (assignementId, updatedData) => {
        try {
            const res = await API.put(`/assignements/${assignementId}`, updatedData);
            return res.data;
        } catch (error) {
            console.error('Error updating assignement by id', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete assignments by id
    deleteAssignment: async (assignementId) => {
        try {
            const res = await API.delete(`/assignements/${assignementId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting assignement', error.response?.data || error.message);
            throw error;
        }
    },  
    
    // Mark assignments as completed
    markAsCompleted: async (assignementId) => {
        try {
            const res = await API.put(`/assignements/${assignementId}/complete`);
            return res.data;
        } catch (error) {
            console.error('Error marking assignement as completed', error.response?.data || error.message);
            throw error;
        }
    },
}
