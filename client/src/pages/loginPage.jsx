import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { KeyRoundIcon, EyeOffIcon, IdCardIcon, EyeIcon, SendHorizonalIcon, LoaderIcon, MailWarningIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
    const [googleLoading, setGoogleLoading] = useState(false);

    const { login, googleLogin, error, clearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (clearError) clearError();
    }, []);

    const handleGoogleSSO = async () => {
        setGoogleLoading(true);
        try {
            const testEmail = prompt("Enter your Google Account Email:", "student.google@gmail.com");
            if (!testEmail) {
                setGoogleLoading(false);
                return;
            }
            const testName = testEmail.split("@")[0].replace(".", " ");

            const result = await googleLogin({
                email: testEmail,
                name: testName,
                googleId: `goog_${Date.now()}`
            });

            if (result && result.success) {
                toast.success("Google Sign-In successful!");
                navigate("/home", { replace: true });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Google Sign-In failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        setStudentIdError('');
        setPasswordError('');

        let isValid = true;

        if (!studentId.trim()) {
            setStudentIdError('StudentId or Email is required');
            isValid = false;
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        }

        if (!isValid) {
            setLoading(false);
            return;
        }

        await login({ studentId, password });
        setLoading(false);
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
                            <img src={logo} className="h-15 md:h-20 w-auto rounded-[50px]"/>
                        </CardTitle>
                        <CardDescription className="text-black text-md md:text-2xl font-bold">Welcome Back to CampusHub </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="ml-2 mr-2 p-2 rounded-md bg-gradient-to-b from to-gray-300 space-y-4">
                        {/* Google SSO Button */}
                        <Button
                            type="button"
                            onClick={handleGoogleSSO}
                            disabled={googleLoading || loading}
                            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-sm"
                        >
                            {googleLoading ? (
                                <LoaderIcon className="animate-spin h-4 w-4 text-blue-600" />
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                            )}
                            Continue with Google
                        </Button>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-3">
                            <div className="border-t border-gray-400 w-full" />
                            <span className="bg-gray-200 px-3 text-[10px] uppercase font-black tracking-wider text-gray-700 shrink-0 rounded-full">
                                OR LOGIN WITH CREDENTIALS
                            </span>
                            <div className="border-t border-gray-400 w-full" />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <div className="relative">
                                    <IdCardIcon className="absolute top-1/2 -translate-y-1/2 ml-2 text-gray-700"/>
                                    <Input 
                                        name="studentId"
                                        type="text"
                                        value={studentId}
                                        className={`pl-10 text-black border ${studentIdError ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        placeholder="Email / Student Reg N.o"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {studentIdError && <p className="mt-1 font-bold text-red-600">{studentIdError}</p>}
                            </div>

                            <div className="mt-5">
                                <div className="relative">
                                    <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2 text-gray-700"/>
                                    <Input 
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        className={`pl-10 border text-black ${passwordError ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
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

                            {error && (
                                <div className={`mt-4 p-3 rounded-md flex items-start gap-3 ${error.includes('verify') ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                    {error.includes('verify') ? <MailWarningIcon className="w-5 h-5 mt-0.5 shrink-0" /> : <p className="font-bold shrink-0">!</p>}
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <Button className="mt-3 md:mt-8 cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-lg font-bold border text-white border-blue-500 shadow-xl" disabled={loading} type="submit">
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
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col items-center">
                        <p className="font-bold text-black mt-2">
                            Don't have an account ? {" "}
                            <Link to='/register' className="text-blue-700 hover:text-blue-900 hover:underline font-bold">
                                Sign Up
                            </Link>
                        </p>
                        <div className="flex justify-between w-full mt-4 text-sm px-2">
                            <Link to='/forgot-password' className="text-blue-700 hover:text-blue-900 hover:underline font-medium"> 
                                Forgot Password?
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