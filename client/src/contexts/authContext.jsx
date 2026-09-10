// Imports
import React from "react";
import { useContext, useEffect, useState, createContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from "@/services/authApi";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { pushManager } from "@/utils/pushManager";

// Create the authContext
const AuthContext = createContext(null);

// Hook to use the context created above
export const useAuth = () => {
    return useContext(AuthContext)
};

// Authprovider that wrpas up the app
export const AuthProvider = ({ children }) => {

    const token = localStorage.getItem('userToken');

    const [user, setUser] = useState(null);
    const [loading, setLOading] = useState(token ? true : false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('userToken')

            // If token exists fetch the user profile
            if (token) {
                const userProfile = await authService.getOwnProfile();
                setUser(userProfile.user);
            }
        } catch (error) {
            localStorage.removeItem('userToken');
            setUser(null);
            console.error('Failed to authenticate user on load', error)
        } finally {
            setLOading(false);
        }
    }

    // Ensures it runs on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Automatically subscribe user for push notifications
    useEffect(() => {
        if (user && user.notificationsEnabled) {
            pushManager.subscribeUser();
        }
    }, [user]);


    const register = async (userData) => {
        // Clear previous errors
        setError(null);

        try {
            const response = await authService.registerUser(userData);
            toast.success(response.message || 'Registration successful! Please check your email for activation link.');
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'User registration failed';
            toast.error(message);
            setError(message);
            return false;
        } finally {
            setLOading(false);
        }
    }

    const googleLogin = async (googleData) => {
        setError(null);
        try {
            const response = await authService.googleAuth(googleData);
            localStorage.setItem('userToken', response.token);
            setUser(response.user);
            toast.success('Google authentication successful!');

            const needsOnboarding = response.needsOnboarding || (response.user.role !== 'admin' && (!response.user.course || !response.user.cohort));

            if (response.user.role === "admin") {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }

            return { success: true, needsOnboarding };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Google authentication failed';
            toast.error(message);
            setError(message);
            return false;
        } finally {
            setLOading(false);
        }
    };

    const login = async (credentials) => {
        // Clear errors
        setError(null);

        try {
            const response = await authService.loginUser(credentials);
            localStorage.setItem('userToken', response.token);
            setUser(response.user);
            toast.success('Welcome back!');

            const needsOnboarding = response.user.role !== 'admin' && (!response.user.course || !response.user.cohort);

            if (response.user.role === "admin") {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }
            
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            toast.error(message);
            setError(message);
            return false;
        } finally {
            setLOading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        toast.success('Logged out successfully!');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const clearError = () => {
        setError('');
    };

    const value = {
        user,
        loading,
        error,
        clearError,
        updateUser,
        isAuthenticated: !!user,
        refreshUser: checkAuthStatus,
        hasRole: (roles) => {
            if (!user || !user.role) return false;
            if (Array.isArray(roles)) {
                return roles.includes(user.role);
            }
            return user.role === roles;
        },
        register,
        login,
        googleLogin,
        logout,
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoaderCircle className="animate-spin h-30 w-30"/>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}