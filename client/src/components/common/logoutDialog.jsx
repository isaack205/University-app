// import React, { useEffect, useState } from "react";
// import { notificationService } from "@/services/notificationService";
// import { 
//   LogOutIcon
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/contexts/authContext";
// import { useNavigate } from 'react-router-dom';

// export default function LogoutDialog() {
//     const [loading, setLoading] = useState(true);
//     const [open, setOpen] = useState(false);
//     const navigate = useNavigate();
//     const { logout } = useAuth();

//     const handleLogout = () => {
//             logout();
//             navigate('/login')
//         };

//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//             <button className="flex flex-row items-center cursor-pointer gap-7">
//                 Log Out
//                 <LogOutIcon className="text-black flex text-end" />
//             </button>
//         </DialogTrigger>

//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle></DialogTitle>
//                 </DialogHeader>
//                 <DialogFooter></DialogFooter>
//             </DialogContent>

//         </Dialog>
//     );
// }


import React, { useState } from "react";
import { LogOutIcon, AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/authContext";
import { useNavigate } from 'react-router-dom';

export default function LogoutDialog() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        setOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="group flex w-full items-center cursor-pointer justify-between px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all duration-200">
                    <span className="font-semibold text-sm">Log Out</span>
                    <LogOutIcon size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                <div className="h-2 bg-red-500 w-full" />
                
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">
                            <AlertCircleIcon size={32} />
                        </div>

                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Wait, are you leaving?
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 text-base">
                                You are about to log out of **CampusHub**. You'll need to enter your credentials again to access your dashboard.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Stay here
                            </Button>
                            
                            <Button
                                onClick={handleLogout}
                                className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95"
                            >
                                Yes, Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}