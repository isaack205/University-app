// Imports
import React, { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { useNavigate, Link } from 'react-router-dom';
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { KeyRoundIcon, EyeOffIcon, IdCardIcon, EyeIcon, SendHorizonalIcon, LoaderIcon} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {

    const [studentId, setStudentId] = useState('');
    const [studentIdError, setStudentIdError] = useState(null);
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState(null);
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // clear errors
        setStudentIdError('')
        setPasswordError('');

        let isValid = true;

        if (!studentId.trim()) {
            setStudentIdError = 'StudentId is required';
            isValid = false;
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        }

        if (!isValid) {
            setLoading(false);
            return;
        };

        await login({ studentId, password});

        setLoading(false);
    }
    return(
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-sm w-full bg-blue-500 border-none shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Welcome Back!</CardTitle>
                    <CardDescription className="text-black text-md">Log in to your account</CardDescription>
                </CardHeader>
                <CardContent className="ml-2 mr-2 p-2 rounded-md bg-gradient-to-b from to-gray-300">
                    <form onSubmit={handleSubmit}>
                        <div className="">
                            <div className="relative">
                                <IdCardIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                <Input 
                                    name="studentId"
                                    type="text"
                                    value={studentId}
                                    className={`pl-10 text-white border ${studentIdError || error ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                                    placeholder="Student Reg N.o"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {studentIdError && <p className="mt-1 font-bold text-red-600">{studentIdError}</p>}
                        </div>
                        <div className="mt-5">
                            <div className="relative">
                                <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                <Input 
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    className={`pl-10 border text-white ${passwordError || error ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    disabled={loading}
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                    {
                                        showPassword ? (<EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />) : (<EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />)
                                    }
                                </button>
                            </div>
                            {passwordError && <p className="mt-1 font-bold text-red-600">{passwordError}</p>}
                        </div>
                        {error && <p className="text-red-500 mt-1 font-bold">{error}</p> }
                        <div>
                            <Button className="mt-8 cursor-pointer w-full bg-green-500 hover:bg-green-600 text-lg font-bold border text-black border-black" disabled={loading} type="submit">
                                {loading ? (
                                            <div className="flex items-center gap-3">
                                                <p>Signing In</p>
                                                <LoaderIcon className="animate-spin"/>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <p>Sign In</p>
                                                <SendHorizonalIcon />
                                            </div>
                                        )
                                    }
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                    <p className="font-bold">
                        Don't have an account ? {" "}
                        <Link to='/register' className="text-blue-700 hover:text-blue-900 hover:underline font-bold">
                            Sign Up
                        </Link>
                    </p>
                    <Link to='/forgot-password' className="flex justify-end pr-4"> 
                        <p className="text-blue-700 hover:text-blue-900 hover:underline">Forgot Password?</p>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}