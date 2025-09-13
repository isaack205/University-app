// Imports 
import API from "./api";

// CohortService
export const courseService = {

    // Create course
    createCourse: async (coureData) => {
        try {
            const res = await API.post('/course', coureData);
            return res.data;
        } catch (error) {
            console.error('Error creating course:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch all courses
    getAllCourses: async () => {
        try {
            const res = await API.get('/course/courses');
            return res.data;
        } catch (error) {
            console.error('Error fetching all courses:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch course by id
    getCourseById: async (courseId) => {
        try {
            const res = await API.get(`/course/${courseId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching course by Id:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update course
    updateCourse: async (courseId, updatedData) => {
        try {
            const res = await API.put(`/course/${courseId}`, updatedData);
            return res.data;
        } catch (error) {
            console.error('Error updating course:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete course
    deleteCourse: async (courseId) => {
        try {
            const res = await API.delete(`/course/${courseId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting course:', error.response?.data || error.message);
            throw error;
        }
    }
}