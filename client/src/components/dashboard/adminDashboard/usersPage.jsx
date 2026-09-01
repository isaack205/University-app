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
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LoaderIcon, 
  Search, 
  LayoutGrid, 
  List, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  GraduationCap, 
  Trash2, 
  Mail, 
  Phone, 
  BookOpen, 
  Users, 
  Calendar,
  EyeIcon
} from "lucide-react";
import UpdateRole from "@/components/updateRole";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";
import clsx from "clsx";

export default function UsersEditPage() {

    const [cohorts, setCohorts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedCohort, setSelectedCohort] = useState("all");
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [errors, setErrors] = useState(null);

    // New UI state: View toggle & search term
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
    const [searchTerm, setSearchTerm] = useState("");

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
            const message = "Failed to load student list.";
            toast.error(message);
            setErrors(message);
            console.error(error.response?.data?.message || error.message || 'An unexpected error occured');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCohorts();
        fetchAllUsers();
    }, []);

    // Active user list dynamically filtered by cohort
    const activeRawUsers = (!selectedCohort || selectedCohort === "all")
        ? users
        : users.filter((u) => {
            const uCohortId = u.cohort?._id || u.cohort;
            return String(uCohortId) === String(selectedCohort);
        });

    // Filtered by search term
    const filteredUsers = activeRawUsers.filter((u) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (u.name && u.name.toLowerCase().includes(term)) ||
            (u.email && u.email.toLowerCase().includes(term)) ||
            (u.studentId && u.studentId.toLowerCase().includes(term)) ||
            (u.course?.name && u.course.name.toLowerCase().includes(term)) ||
            (u.cohort?.name && u.cohort.name.toLowerCase().includes(term))
        );
    });

    // Counts for stat bar
    const totalCount = activeRawUsers.length;
    const adminCount = activeRawUsers.filter(u => u.role === 'admin').length;
    const classRepCount = activeRawUsers.filter(u => u.role === 'classRep').length;
    const studentCount = activeRawUsers.filter(u => !u.role || u.role === 'student').length;

    const handleDeleteUser = async (user) => {
        setDeletingId(user._id);
        try {
            await authService.deleteUserById(user._id);
            toast.success(`User "${user.name}" deleted successfully.`);
            fetchAllUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user.';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 pb-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full ring-1 ring-indigo-200">
                            Administration
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        User Directory &amp; Access Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Search, filter, manage roles, and review access across all academic cohorts.
                    </p>
                </div>

                {/* View switcher buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                            viewMode === "grid"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Grid Cards
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                            viewMode === "table"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <List className="h-3.5 w-3.5" />
                        List Table
                    </button>
                </div>
            </div>

            {/* ── Stats Strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Total Filtered</p>
                        <p className="text-xl font-bold text-slate-800">{totalCount}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Admins</p>
                        <p className="text-xl font-bold text-slate-800">{adminCount}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Class Reps</p>
                        <p className="text-xl font-bold text-slate-800">{classRepCount}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Students</p>
                        <p className="text-xl font-bold text-slate-800">{studentCount}</p>
                    </div>
                </div>
            </div>

            {/* ── Search & Cohort Filter Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                
                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search name, email, student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Cohort Selector & counter */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="w-full sm:w-56">
                        <Select
                            value={selectedCohort}
                            onValueChange={(value) => setSelectedCohort(value)}
                            disabled={loading}
                        >
                            <SelectTrigger className="w-full rounded-xl border-slate-200 text-xs bg-slate-50">
                                <SelectValue placeholder={loading ? "Loading Cohorts..." : "Filter by Cohort"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cohorts</SelectItem>
                                {cohorts.map((cohort) => (
                                    <SelectItem key={cohort._id} value={cohort._id}>
                                        {cohort.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Counter Pill */}
                    <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-medium whitespace-nowrap">
                        <EyeIcon className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Showing {filteredUsers.length} of {activeRawUsers.length}</span>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {errors && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {errors}
                </div>
            )}

            {/* ── Main Content Display ── */}
            {loading ? (
                /* Skeleton loader */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-4 w-2/3 bg-slate-200 rounded" />
                                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded" />
                            <div className="h-3 w-4/5 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <UserX className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No users found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {searchTerm ? `No user matches "${searchTerm}". Try resetting your search filters.` : 'No users registered in this cohort yet.'}
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                /* ── CARD GRID VIEW ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredUsers.map((user) => {
                        const roleColor =
                            user.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : user.role === 'classRep'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200';

                        return (
                            <div
                                key={user._id}
                                className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                            >
                                {/* Top Accent bar */}
                                <div className={clsx(
                                    "h-1 w-full",
                                    user.role === 'admin' ? 'bg-purple-500' : user.role === 'classRep' ? 'bg-emerald-500' : 'bg-indigo-500'
                                )} />

                                <div className="p-5 space-y-4">

                                    {/* Header Row: Avatar + Name + Delete button */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {user.name || "Unnamed User"}
                                                </h3>
                                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                                    ID: {user.studentId || "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons: Role Tag + Delete Icon */}
                                        <div className="flex items-center gap-1.5">
                                            {/* Role badge with update trigger */}
                                            <span className={clsx(
                                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border",
                                                roleColor
                                            )}>
                                                {user.role || "student"}
                                                <UpdateRole user={user} />
                                            </span>

                                            <DeleteConfirmDialog
                                                title="Delete User Account"
                                                description={`Are you sure you want to delete user "${user.name || 'this user'}" (${user.email})? This action cannot be undone.`}
                                                onConfirm={() => handleDeleteUser(user)}
                                                loading={deletingId === user._id}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact & Academic details */}
                                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{user.email || "No email provided"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span>{user.phoneNumber || "No phone number"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate font-medium text-slate-700">{user.course?.name || "No Course assigned"}</span>
                                        </div>
                                    </div>

                                </div>

                                {/* Card Footer: Cohort & Date */}
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                                        <span className="font-semibold text-slate-700">{user.cohort?.name || "Unassigned Cohort"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── REFINED TABLE VIEW ── */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold text-xs uppercase text-slate-500">User</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Email</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Phone</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Course</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Cohort</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500">Joined</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-slate-500 text-right">Role &amp; Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow
                                    key={user._id}
                                    className="hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                                >
                                    <TableCell className="py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {user.name || "N/A"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 uppercase font-medium">
                                                    ID: {user.studentId || "No ID"}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-xs text-slate-600 font-medium">
                                        {user.email || "N/A"}
                                    </TableCell>

                                    <TableCell className="text-xs text-slate-500">
                                        {user.phoneNumber || "Not provided"}
                                    </TableCell>

                                    <TableCell className="text-xs text-slate-700 font-medium">
                                        {user.course?.name || "N/A"}
                                    </TableCell>

                                    <TableCell className="text-xs text-slate-700 font-medium">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                            {user.cohort?.name || "N/A"}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-[11px] text-slate-400 font-medium">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border",
                                                user.role === 'admin'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                    : user.role === 'classRep'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                            )}>
                                                {user.role || "student"}
                                                <UpdateRole user={user} />
                                            </span>

                                            <DeleteConfirmDialog
                                                title="Delete User Account"
                                                description={`Are you sure you want to delete user "${user.name || 'this user'}" (${user.email})? This action cannot be undone.`}
                                                onConfirm={() => handleDeleteUser(user)}
                                                loading={deletingId === user._id}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

        </div>
    );
}