// Imports
import React, { useState, useEffect } from "react";
import { authService } from "@/services/authApi";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, KeyRoundIcon, LoaderIcon, SendHorizonalIcon, AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import registerPhoto from "../assets/university.png";
import registerPhoto2 from "../assets/university 2.png";
import logo from "../assets/image.png";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const urlToken = searchParams.get('token');

        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('No password reset token found in the link. Please request a new link.');
            toast.error('Invalid or missing reset token.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNewPasswordError('');
        setConfirmPasswordError('');
        setError('');

        let isValid = true;

        if (!newPassword.trim()) {
            setNewPasswordError('New password is required');
            isValid = false;
        } else if (newPassword.length < 8) {
            setNewPasswordError('New password must be at least 8 characters');
            isValid = false;
        }

        if (!confirmPassword.trim()) {
            setConfirmPasswordError('Please confirm your new password');
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }

        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset.');
            isValid = false;
        }

        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            const res = await authService.resetPassword({ token, newPassword });

            if (res) {
                toast.success('Password reset successfully! You can now log in.');
                navigate('/login');
            } else {
                toast.error('Error resetting password');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row lg:flex-row items-center flex-start justify-start bg-gradient-to-b from-blue-300 via-white to-purple-400">
            <div className="md:w-[50%] lg:w-[50%]">
                <img src={registerPhoto} alt="" className="hidden md:block h-30 w-full md:h-screen lg:h-screen"/>
            </div>
            <div className="block md:hidden w-full h-70 overflow-hidden">
                <img src={registerPhoto2} alt="" className="w-full h-full object-cover"/>
            </div>
                        
            <div className="w-full md:w-[50%] lg:w-[50%] flex justify-center p-2 m-5 md:m-5">
                <Card className="w-full shadow-2xl border-none bg-no">
                    <CardHeader className="text-center">
                        <CardTitle className="flex justify-center">
                            <img src={logo} alt="Logo" className="h-15 md:h-20 w-auto rounded-[50px]"/>
                        </CardTitle>
                        <CardDescription className="text-black text-md md:text-2xl font-bold">
                            Reset Password
                        </CardDescription>
                        <p className="text-slate-700 text-xs md:text-sm mt-1">
                            Create a new secure password for your account.
                        </p>
                    </CardHeader>
                    
                    <CardContent className="ml-2 mr-2 p-2 rounded-md bg-gradient-to-b from to-gray-300 space-y-4">
                        {!token ? (
                            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-center space-y-3">
                                <AlertCircleIcon className="w-8 h-8 text-amber-600 mx-auto" />
                                <h4 className="font-bold text-base">Invalid or Missing Token</h4>
                                <p className="text-xs text-amber-800">
                                    The password reset link is invalid or has expired. Please request a new password reset link.
                                </p>
                                <Link to="/forgot-password" className="inline-block mt-2">
                                    <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4">
                                        Request New Link
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="relative">
                                        <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2 text-gray-700 h-5 w-5"/>
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={newPassword}
                                            placeholder="Enter New Password (min. 8 chars)"
                                            className={`pl-10 pr-10 text-black border ${newPasswordError ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                if (newPasswordError) setNewPasswordError('');
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowNewPassword(!showNewPassword)} 
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showNewPassword ? <EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" /> : <EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700"/>}
                                        </button>
                                    </div>
                                    {newPasswordError && <p className="text-red-600 mt-1 font-bold">{newPasswordError}</p>}
                                </div>

                                <div>
                                    <div className="relative">
                                        <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2 text-gray-700 h-5 w-5"/>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            placeholder="Confirm New Password"
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (confirmPasswordError) setConfirmPasswordError('');
                                            }}
                                            className={`pl-10 pr-10 text-black border ${confirmPasswordError ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
                                            required
                                            disabled={loading}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" /> : <EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700"/>}
                                        </button>
                                    </div>
                                    {confirmPasswordError && <p className="text-red-600 mt-1 font-bold">{confirmPasswordError}</p>}
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-semibold">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Button 
                                        type="submit" 
                                        className="mt-3 md:mt-8 cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-lg font-bold border text-white border-blue-500 shadow-xl" 
                                        disabled={loading || !token}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <p>Resetting Password</p>
                                                <LoaderIcon className="animate-spin"/>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <p>Reset Password</p>
                                                <SendHorizonalIcon />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col items-center">
                        <div className="flex justify-between w-full mt-4 text-sm px-2">
                            <Link to='/login' className="text-blue-700 hover:text-blue-900 hover:underline font-medium flex items-center gap-1">
                                <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                            </Link>
                            <Link to='/help' className="text-blue-700 hover:text-blue-900 hover:underline font-medium"> 
                                Help & Support
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}