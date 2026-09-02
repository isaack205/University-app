// Imports
import React, { useState } from "react";
import { LogOutIcon, AlertCircleIcon, ArrowLeftIcon, PenIcon } from "lucide-react";
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
import { authService } from "@/services/authApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";

export default function UpdateRole({ user, refreshUsers }) {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newRole, setNewRole] = useState(user?.role || 'student');

    useEffect(() => {
        if (user?.role) {
            setNewRole(user.role);
        }
    }, [user]);

    const handleUpdateRole = async () => {
        if (!newRole) {
            toast.error('Please select a role');
            return;
        }

        setLoading(true);
        setError(null);

        const payload = {
            _id: user?._id,
            newRole: newRole
        };

        try {
            await authService.updateUserRole(payload._id, payload);
            toast.success(`User role updated to ${newRole} successfully`);
            setOpen(false);
            if (refreshUsers) refreshUsers();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
            toast.error(message);
            setError(message);
            console.error('Error updating role:', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="group flex w-full items-center cursor-pointer justify-between px-1 py-2 rounded-3xl text-slate-600 dark:text-slate-300 hover:bg-green-300 dark:hover:bg-green-950/30 transition-all duration-200">
                    <PenIcon size={15} className=" " />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                <div className="h-2 bg-blue-500 w-full" />
                
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                       

                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Update {user.name || 'selected user role'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 text-base">
                                Choose new role below!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mb-10">
                            <Select
                                value={newRole}
                                onValueChange={(value) => setNewRole(value)}
                                disabled={loading}
                                defaultValue={user.role}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select New role"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="classRep">ClassRep</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            
                            <Button
                                onClick={handleUpdateRole}
                                disabled={loading}
                                className="flex-1 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95"
                            >
                                {loading ? 
                                <div className="flex flex-row items-center gap-2"> 
                                    Elevating
                                    <LoaderIcon className="animate-spin"/> 
                                </div> : 
                                <div>
                                    Elevate User
                                </div> }
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}