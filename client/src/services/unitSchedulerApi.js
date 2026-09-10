// Imports 
import API from "./api";

// CohortService
export const unitScheduleService = {

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
    getMyShedule: async () => {
        try {
            const res = await API.get('/schedule/my');
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
    },

    // Create a temporary override for a unit schedule
    createOverride: async (scheduleId, overrideData) => {
        try {
            const res = await API.post(`/schedule/${scheduleId}/override`, overrideData);
            return res.data;
        } catch (error) {
            console.error('Error creating override:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get active overrides for the cohort
    getOverrides: async () => {
        try {
            const res = await API.get('/schedule/overrides');
            return res.data;
        } catch (error) {
            console.error('Error fetching overrides:', error.response?.data || error.message);
            throw error;
        }
    },

    // Cancel (delete) an active override
    cancelOverride: async (overrideId) => {
        try {
            const res = await API.delete(`/schedule/override/${overrideId}`);
            return res.data;
        } catch (error) {
            console.error('Error cancelling override:', error.response?.data || error.message);
            throw error;
        }
    },
}