// Imports
import React, { useState } from "react";
import { authService } from "@/services/authApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MailIcon, LoaderIcon, SendHorizonalIcon, ArrowLeftIcon } from "lucide-react";
import registerPhoto from "../assets/university.png";
import registerPhoto2 from "../assets/university 2.png";
import logo from "../assets/image.png";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setEmailError('');

        let isValid = true;

        if (!email.trim()) {
            setEmailError('Email address is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            const res = await authService.forgotPassword({ email });

            if (res) {
                setIsSubmitted(true);
                toast.success('Password reset link sent to your email!');
            } else {
                toast.error('Error sending reset email');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
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
                            Forgot Password?
                        </CardDescription>
                        <p className="text-slate-700 text-xs md:text-sm mt-1">
                            Enter the email associated with your account and we'll send you a password reset link.
                        </p>
                    </CardHeader>
                    
                    <CardContent className="ml-2 mr-2 p-2 rounded-md bg-gradient-to-b from to-gray-300 space-y-4">
                        {isSubmitted ? (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <MailIcon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Check Your Inbox</h3>
                                <p className="text-sm text-slate-600">
                                    We sent a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and spam folder.
                                </p>
                                <Button 
                                    type="button" 
                                    onClick={() => setIsSubmitted(false)}
                                    className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white font-bold h-11"
                                >
                                    Resend Link
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="relative">
                                        <MailIcon className="absolute top-1/2 -translate-y-1/2 ml-2 text-gray-700 h-5 w-5"/>
                                        <Input 
                                            name="email"
                                            type="email"
                                            value={email}
                                            className={`pl-10 text-black border ${emailError ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (emailError) setEmailError('');
                                            }}
                                            placeholder="Enter your Email Address"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {emailError && <p className="mt-1 font-bold text-red-600">{emailError}</p>}
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-semibold">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <Button 
                                        className="mt-3 md:mt-8 cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-lg font-bold border text-white border-blue-500 shadow-xl" 
                                        disabled={loading} 
                                        type="submit"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <p>Sending Link</p>
                                                <LoaderIcon className="animate-spin"/>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <p>Send Reset Link</p>
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


