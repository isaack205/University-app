// Imports
import React, { useState } from "react";
import { authService } from "@/services/authApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // clear errors
        setError('');
        setEmailError('');

        let isValid = true;

        // Validate email
        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Invalid email format');
            isValid = false;
        };

        if (!isValid) {
            setLoading(false);
            toast.error('Correct the form errors');
            return;
        }

        try {
            const forgotPasswordSuccess = await authService.forgotPassword({ email });

            if (forgotPasswordSuccess) {
                toast.success('Check email for the password reset link');
            } else {
                toast.error('Error sending email');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-sm w-full bg-blue-500  shadow-2xl rounded-3xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Forgot Password!</CardTitle>
                        <CardDescription className="text-black text-md">Please enter the same email for your account. A password reset link will be sent to your email</CardDescription>
                    </CardHeader>
                    <CardContent className="ml-2 mr-2 p-2 rounded-md bg-gradient-to-b from to-gray-300">
                        <form onSubmit={handleSubmit}>
                            <Label htmlFor="email" className="text-lg">Email Address</Label>
                            <Input 
                                id="email"
                                name="Email"
                                value={email}
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                className={`border text-lg ${emailError ? 'border-red-500' : 'border-black'}`}
                                placeholder="Enter Email Address"
                                required
                            />
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                            <div className="mt-5">
                                <Button disabled className="mt-8 cursor-pointer w-full bg-green-500 hover:bg-green-600 text-lg font-bold border text-black border-black" type="submit">
                                    {loading ? 'Requesting ...' : 'Request password Reset Link'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center">
                        <div className="text-center">
                            <p>Remembered your password ?</p>
                            <Link to='/login' className="underline text-blue-800 font-bold hover:text-blue-900">Login Here</Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
