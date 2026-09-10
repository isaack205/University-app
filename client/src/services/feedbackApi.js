// Imports 
import API from "./api";

// CohortService
export const feedbackService = {

    // Submit feedback
    submitFeedback: async (feedbackData) => {
        try {
            const res = await API.post('/feedback', feedbackData);
            return res.data;
        } catch (error) {
            console.error('Error submitting feedback:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch all feedback
    getAllFeedback: async () => {
        try {
            const res = await API.get('/feedback/feedbacks');
            return res.data;
        } catch (error) {
            console.error('Error fetching all feedback:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update feedback status
    updateFeedbackStatus: async (id, updateData) => {
        try {
            const res = await API.put(`/feedback/${id}`, updateData);
            return res.data;
        } catch (error) {
            console.error('Error updating feedback status:', error.response?.data || error.message);
            throw error;
        }
    }
}