// Imports
import React, { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { Link } from 'react-router-dom';
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
import registerPhoto from '../assets/university.png';
import registerPhoto2 from "../assets/university 2.png"
import logo from "../assets/image.png"

export default function LoginPage() {

    const [studentId, setStudentId] = useState('');
    const [studentIdError, setStudentIdError] = useState(null);
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState(null);
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false);
    
    const { login, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // clear errors
        setStudentIdError('')
        setPasswordError('');

        let isValid = true;

        if (!studentId.trim()) {
            setStudentIdError('StudentId is required');
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
                            <img src={logo} className="h-15 md:h-20 w-auto rounded-[50px]"/>
                        </CardTitle>
                        <CardDescription className="text-black text-md text-2xl font-bold">Welcome Back to CampusHub </CardDescription>
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
                                        className={`pl-10 text-black border ${studentIdError || error ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
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
                                        className={`pl-10 border text-black ${passwordError || error ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
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
        </div>
    )
}