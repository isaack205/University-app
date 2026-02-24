// Imports
import API from "./api";

// Lecturer Service
export const lecturerService = {

    // Create Lecturer
    createLecturer: async (lecturerData) => {
        try {
            const res = await API.post('/lecturer', lecturerData);
            return res.data;
        } catch (error) {
            console.error('Error creating lecturer:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get Lecturers in a cohort
    getLecturersByCohort: async (cohortId, cohortData) => {
        try {
        const res = await API.get(`/lecturer/cohort/${cohortId}`, cohortData)
            return res.data;
        } catch (error) {
            console.error('Error fetching lectureres:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update Lecturer
    updateLecturer: async (lecturerId, updatedData) => {
        try {
            const res = await API.put(`/lecturer/${lecturerId}`, updatedData)
            return res.data;
        } catch (error) {
            console.error('Error updating lecturer Info:', error.response?.data || error.message);
            throw error;
        }
    },

    // Toggle Lecturer Deleted (soft)
    toggleDeleted: async (lecturerId, updatedData) => {
        try {
            const res = await API.patch(`/lecturer/${lecturerId}/toggle-deleted`, updatedData)
            return res.data;
        } catch (error) {
            console.error('Error toggling isDeleted field:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete Lecturer
    deleteLecturer: async (lecturerId) => {
        try {
            const res = await API.delete(`/lecturer/${lecturerId}`)
            return res.data;
        } catch (error) {
            console.error('Error deleting lecturer:', error.response?.data || error.message);
            throw error;
        }
    },
}