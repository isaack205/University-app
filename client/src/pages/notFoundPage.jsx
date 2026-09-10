import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestionIcon, HomeIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/authContext';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determine return path based on user role
    const homePath = user?.role === 'admin' ? '/admin/dashboard' : '/home';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestionIcon className="w-12 h-12 text-indigo-500" />
                </div>
                
                <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-700 mb-4">Page Not Found</h2>
                
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Oops! It looks like the page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Link to={homePath}>
                        <Button className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <HomeIcon className="w-4 h-4" />
                            {user?.role === 'admin' ? 'Return to Dashboard' : 'Return Home'}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
