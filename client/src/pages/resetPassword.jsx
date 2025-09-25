// Imports
import React, { useState, useEffect } from "react";
import { authService } from "@/services/authApi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, KeyRoundIcon } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordPage() {

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState('');
    const [conformPasswordError, setConfirmPasswordError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const navigate =  useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlToken = queryParams.get('token');

        console.log("🔍 Raw search:", window.location.search);
        console.log("🔑 Extracted token:", urlToken);

        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('No password reset token found in the URL.');
            toast.error('Invalid link: No reset token provided.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Clear errors
        setNewPasswordError('');
        setConfirmPasswordError('');
        setError('');

        let isValid = true;

        // Validate new password
        if (!newPassword.trim()) {
            setNewPasswordError('New password is required');
            isValid = false;
        } else if (newPassword.length < 8) {
            setNewPasswordError('New password must be atleast 8 characters');
            isValid = false;
        }

        // Validate confirm password password
        if (!confirmPassword.trim()) {
            setConfirmPasswordError('Please fill in confirm password');
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }

        if (!token) {
            setError('Invalid or missing reset token.');
            isValid = false;
        }

        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            const resetPasswordSuccess = await authService.resetPassword({ token, newPassword });

            if (resetPasswordSuccess) {
                toast.success('Password reset successfully');
                navigate('/login');
            } else {
                toast.error('Error reseting password');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured please try again';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-sm w-full bg-blue-500  shadow-2xl rounded-3xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Reset Password!</CardTitle>
                        <CardDescription className="text-black text-md">Please fill in the field with your new password</CardDescription>
                        {error && <p className="text-red-600 mt-1 font-bold text-shadow-xs">{error}</p> }
                    </CardHeader>
                    <CardContent className="ml-2 mr-2 p-2 rounded-md bg-gradient-to-b from to-gray-300">
                        <form onSubmit={handleSubmit}>
                            <div className="mt-1">
                                <div className="relative">
                                    <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={newPassword}
                                        placeholder="Enter New Password"
                                        className={`border pl-10 ${newPasswordError ? 'border-2 border-red-600' : 'border-black'}`}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3">
                                        {showPassword ? (<EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />) : (<EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700"/>)}
                                    </button>
                                </div>
                                {newPasswordError && <p className="text-red-600 mt-1 font-bold text-shadow-xs text-shadow-black">{newPasswordError}</p>}
                            </div>
                            <div className="mt-5">
                                <div className="relative">
                                    <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        placeholder="Confirm New Password"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`border pl-10 ${newPasswordError ? 'border-2 border-red-600' : 'border-black'}`}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3">
                                        {showPassword ? (<EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />) : (<EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700"/>)}
                                    </button>
                                </div>
                                {conformPasswordError && <p className="text-red-600 mt-1 font-bold text-shadow-xs text-shadow-black">{conformPasswordError}</p>}
                            </div>
                            <div className="mt-5">
                                <Button type="submit" className="mt-8 cursor-pointer w-full bg-green-500 hover:bg-green-600 text-lg font-bold border text-black border-black" disabled={loading}>
                                    {loading ? 'Resetting' : 'Reset Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter></CardFooter>
                </Card>
            </div>
        </div>
    )
}