// Imports
import API from "./api";

// FileUpload service
export const fileUploadService = {

    // Create a file
    createFile: async (fileData) => {
        try {
            const res = await API.post('/upload', fileData);
            return res.data;
        } catch (error) {
            console.error('Error creating file:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch the specific cohort files
    getMyCohortsFiles: async (cohortFilesData) => {
        try {
            const res = await API.get('/upload/uploads', cohortFilesData);
            return res.data;
        } catch (error) {
            console.error('Error fetching my cohort files:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch by Id
    getFileById: async (fileId) => {
        try {
            const res = await API.get(`/upload/${fileId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching file by Id:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch general files
    getGeneralFiles: async (generalFilesData) => {
        try {
            const res = await API.get('/upload', generalFilesData);
            return res.data;
        } catch (error) {
            console.error('Error fetching general files:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update file
    updateFile: async (fileData, fileId) => {
        try {
            const res = await API.put(`/upload/${fileId}`, fileData);
            return res.data;
        } catch (error) {
            console.error('Error updating file:', error.response?.data || error.message);
            throw error;
        }
    },

    // delete file
    deleteFile: async (fileId) => {
        try {
            const res = await API.delete(`/upload/${fileId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting file:', error.response?.data || error.message);
            throw error;
        }
    },
}