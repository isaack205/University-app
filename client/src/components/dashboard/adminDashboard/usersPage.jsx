// Imports
import React, { useEffect, useState } from "react";
import { authService } from "@/services/authApi";
import { cohortService } from "@/services/cohortApi";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderIcon } from "lucide-react";
import UpdateRole from "@/components/updateRole";
import clsx from "clsx";
import { EyeIcon } from "lucide-react";

export default function UsersEditPage() {

    const [cohorts, setCohorts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedCohort, setSelectedCohort] = useState();
    const [usersInCohort, setUsersInCohort] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userCohortCount, setUserCohortCount] = useState(0);
    const [errors, setErrors] = useState(null);

    const fetchCohorts = async () => {

        try {
            const cohortData = await cohortService.getAllCohorts();
            setCohorts(cohortData);
        } catch (error) {
            console.error(error.response?.data?.message || error.message || 'An unexpected error occured');
        }
    };

    const fetchAllUsers = async () => {
        setLoading(true);

        try {
            const response = await authService.getAllUsers();
            setUsers(response.users);
            
        } catch (error) {
            const message = "Failed to load student list."
            toast.error(message);
            setErrors(message);
            console.error(error.response?.data?.message || error.message || 'An unexpected error occured');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersByCohort = async () => {
        if (!selectedCohort) return;
        setLoading(true);

        try {
            const response = await authService.getUsersByCohort(selectedCohort);
            setUsersInCohort(response.users);
            setUserCohortCount(response.count)
        } catch (error) {
            const message = "Failed to load cohort student list."
            toast.error(message);
            setErrors(message);
            console.error(error.response?.data?.message || error.message || 'An unexpected error occured');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        fetchCohorts();
        fetchAllUsers();
    }, []);

    useEffect(() => {

        if (selectedCohort) fetchUsersByCohort();
    }, [selectedCohort]);

    return(
        <div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">
                    Administration
                </p>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    User Directory
                </h1>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                    Search, filter, and manage student access across all active cohorts.
                </p>
            </div>
            <div className="mb-10">
                <Select
                    value={selectedCohort}
                    onValueChange={(value) => setSelectedCohort(value)}
                    disabled={loading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Loading..." : ""} />
                    </SelectTrigger>
                    <SelectContent>
                        {cohorts.map(cohort => (
                            <SelectItem key={cohort._id} value={cohort._id} >
                                {cohort.name}
                            </SelectItem>
                        ))}
                        <SelectItem>
                            All
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <div className="flex items-center justify-end gap-1">
                    <EyeIcon className="text-blue-500"/>
                    <p className="text-blue-500">Viewing:</p> 
                    {!selectedCohort ? users?.length : userCohortCount} / {users?.length} -
                    <p>Users</p>
                </div>
                <Table> 
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold">PhoneNumber</TableHead>
                            <TableHead className="font-bold">Course</TableHead>
                            <TableHead className="font-bold">Cohort</TableHead>
                            <TableHead className="font-bold">Created at</TableHead>
                            <TableHead className="text-right font-bold">Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                            <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                    <LoaderIcon className="animate-spin h-8 w-8 text-blue-500" />
                                    <p className="font-medium">Fetching users...</p>
                                </div>
                            </TableCell>
                            </TableRow>
                        ): !selectedCohort ? (
                            users.map((user) => (
                                    <TableRow
                                        key={user._id}
                                        className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold">
                                                    {user.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                                                        {user.name || "N/A"}
                                                    </p>
                                                <p className="text-xs text-slate-500 uppercase tracking-tighter">
                                                    ID: {user.studentId || "No ID"}
                                                </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                                            {user.email || "N/A"}
                                        </TableCell>
                                        
                                        <TableCell className="text-slate-600 dark:text-slate-400">
                                            {user.phoneNumber || "Not provided"}
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                                            {user.course.name || "N/A"}
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                                            {user.cohort.name || "N/A"}
                                        </TableCell>

                                        <TableCell className="text-slate-400 text-[11px] font-medium">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                user.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : user.role === 'classRep'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                                {user.role || "student"}
                                                <UpdateRole user={user}/>
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))

                        ) : usersInCohort.length > 0 ? (
                            usersInCohort.map((user) => (
                                <TableRow
                                    key={user._id}
                                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                                >
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold">
                                                {user.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                                                    {user.name || "N/A"}
                                                </p>
                                            <p className="text-xs text-slate-500 uppercase tracking-tighter">
                                                ID: {user.studentId || "No ID"}
                                            </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                                        {user.email || "N/A"}
                                    </TableCell>
                                    
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {user.phoneNumber || "Not provided"}
                                    </TableCell>

                                    <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                                        {user.course.name || "N/A"}
                                    </TableCell>

                                    <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                                        {user.cohort.name || "N/A"}
                                    </TableCell>

                                    <TableCell className="text-slate-400 text-[11px] font-medium">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            user.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : user.role === 'classRep'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {user.role || "student"}
                                            <UpdateRole user={user}/>
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-400 italic">
                                    No users in selected Cohort/Select Cohort 😊
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}