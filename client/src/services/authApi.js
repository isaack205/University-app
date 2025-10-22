// Imports 
import ChangePasswordPage from "@/components/changePassword";
import API from "./api";

// CohortService
export const authService = {

    // Register user
    registerUser: async (userData) => {
        try {
            const res = await API.post('/auth/register', userData);
            return res.data;
        } catch (error) {
            console.error('Error registering user:', error.response?.data || error.message);
            throw error;
        }
    },

    // Login user
    loginUser: async (loginData) => {
        try {
            const res = await API.post('/auth/login', loginData);
            return res.data;
        } catch (error) {
            console.error('Error loging in user:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch profile
    getOwnProfile: async () => {
        try {
            const res = await API.get('/auth/me');
            return res.data;
        } catch (error) {
            console.error('Error fetching user profile:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update profile
    updateProfile: async (profileData) => {
        try {
            const res = await API.put('/auth/update-profile', profileData);
            return res.data;
        } catch (error) {
            console.error('Error updating profile:', error.response?.data || error.message);
            throw error;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const res = await API.put('/auth/change-password', passwordData);
            return res.data;
        } catch (error) {
            console.error('Error updating password:', error.response?.data || error.message);
            throw error;
        }
    },

    // Forgot password
    forgotPassword: async (resetEmail) => {
        try {
            const res = await API.post('/auth/forgot-password', resetEmail);
            return res.data;
        } catch (error) {
            console.error('Error sending password reset email:', error.response?.data || error.message);
            throw error;
        }
    },

    // Reset password
    resetPassword: async (resetCredentials) => {
        try {
            const res = await API.post('/auth/reset-password', resetCredentials);
            return res.data;
        } catch (error) {
            console.error('Error reseting password:' , error.response?.data || error.message);
            throw error;
        }
    },

    // Delete user profile
    deleteProfile: async () => {
        try {
            const res = await API.delete('/auth/me');
            return res.data;
        } catch (error) {
            console.error('Error deleting profile:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete user by id
    deleteUserById: async (userId) => {
        try {
            const res = await API.delete(`/auth/users/${userId}`);
            return res.data;
        } catch (error) {
            console.error('Error deleting user by ID:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch all users
    getAllUsers: async (params = {}) => {
        try {
            const res = await API.get('/auth/users', { params });
            return res.data;
        } catch (error) {
            console.error('Error fetching all users:', error.response?.data || error.message);
            throw error;
        }
    }
}