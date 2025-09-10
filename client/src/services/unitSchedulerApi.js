// Imports 
import API from "./api";

// CohortService
export default cohortService = {

    // Create schedule
    createSchedule: async (scheduleData) => {
        try {
            const res = await API.post('/schedule', scheduleData);
            return res.data;
        } catch (error) {
            console.error('Error creating schedule:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get schedules by cohortId
    getSchedulesByCohort: async (cohortId) => {
        try {
            const res = await API.get(`/schedule/cohort/${cohortId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching schedules by cohort:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get schedule by id
    getScheduleById: async (scheduleId) => {
        try {
            const res = await API.get(`/schedule/${scheduleId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching schedule:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update schedule
    updateSchedule: async (scheduleId, scheduleData) => {
        try {
            const res = await API.put(`/schedule/${scheduleId}`, scheduleData);
            return res.data;
        } catch (error) {
            console.error('Error updating schedule:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete schedule
    deleteSchedule: async (scheduleId) => {
        try {
            const res = await API.delete(`/schedule/${scheduleId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting schedule:', error.response?.data || error.message);
            throw error;
        }
    }
}