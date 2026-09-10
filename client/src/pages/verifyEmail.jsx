import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authApi";
import { Button } from "@/components/ui/button";
import { LoaderIcon, CheckCircle2Icon, XCircleIcon, MailIcon } from "lucide-react";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading"); // loading, success, error
    const [message, setMessage] = useState("Verifying your email address...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing verification link.");
            return;
        }

        const verify = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus("success");
                setMessage("Your email has been verified successfully!");
            } catch (error) {
                setStatus("error");
                setMessage(error.response?.data?.message || "Failed to verify email. The link may have expired.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
                
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                            <LoaderIcon className="w-8 h-8 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Email</h2>
                        <p className="text-slate-500">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2Icon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h2>
                        <p className="text-slate-600 mb-8">{message}</p>
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl text-lg"
                            onClick={() => navigate('/login')}
                        >
                            Continue to Login
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                            <XCircleIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
                        <p className="text-slate-600 mb-8">{message}</p>
                        <div className="flex flex-col gap-3 w-full">
                            <Button 
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-xl text-lg"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
