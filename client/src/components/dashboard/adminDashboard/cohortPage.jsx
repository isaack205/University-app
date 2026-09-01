// Imports
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { courseService } from "@/services/courseApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  LoaderIcon, 
  SendHorizonalIcon, 
  Search, 
  LayoutGrid, 
  List, 
  Users, 
  Calendar, 
  BookOpen, 
  PlusCircle, 
  Trash2,
  Sparkles
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import UpdateCohort from "@/components/updateCohort";
import { cohortService } from "@/services/cohortApi";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";

export default function CohortPage() {

    const [course, setCourse] = useState('');
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [cohortsLoading, setCohortsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // UI States: View mode & Search filter
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
    const [searchTerm, setSearchTerm] = useState("");

    const reset = () => {
        setName('');
        setYear('');
        setCourse('');
    };

    const fetchCohorts = async () => {
        setCohortsLoading(true);
        setErrors('');
        try {
            const data = await cohortService.getAllCohorts();
            setCohorts(data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        } finally {
            setCohortsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await courseService.getAllCourses();
            setCourses(data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        }
    };

    useEffect(() => {
        fetchCohorts();
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors('');
        setFormDataError('');

        let isValid = true;
        let errorsObj = {};

        // Validation
        if (!name.trim()) {
            errorsObj.name = 'Cohort name is required.';
            isValid = false;
        }

        if (!year.trim()) {
            errorsObj.year = 'Cohort year is required.';
            isValid = false;
        }

        if (!course.trim()) {
            errorsObj.course = 'Cohort course is required.';
            isValid = false;
        }

        setFormDataError(errorsObj);

        if (!isValid) {
            setLoading(false);
            toast.error('Clear form errors');
            return;
        }

        try {
            await cohortService.createCohort({ name, year, course });
            toast.success('Cohort registered successfully');
            fetchCohorts();
            reset();
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!';
            toast.error(errorMessage);
            setErrors(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Filtered cohorts for search
    const filteredCohorts = cohorts.filter((c) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (c.name && c.name.toLowerCase().includes(term)) ||
            (c.year && String(c.year).includes(term)) ||
            (c.course?.name && c.course.name.toLowerCase().includes(term)) ||
            (c.course?.code && c.course.code.toLowerCase().includes(term))
        );
    });

    // Placeholder delete handler
    const handleDeleteCohort = async (cohort) => {
        setDeletingId(cohort._id);
        try {
            await cohortService.deleteCohort(cohort._id);
            toast.success(`Cohort "${cohort.name}" deleted successfully.`);
            fetchCohorts();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete cohort.';
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
                            Academic Structure
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Cohort Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Register new student cohorts and manage existing active groups.
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

            {/* Error Banner */}
            {errors && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    ! {errors}
                </div>
            )}

            {/* ── Main 2-Column Responsive Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ── LEFT COLUMN: Registration Form Card ── */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <PlusCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Register Cohort</h2>
                            <p className="text-[11px] text-slate-400">Add a new cohort to a course</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Cohort Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="cohortName" className="text-xs font-bold text-slate-700">
                                Cohort Name
                            </Label>
                            <Input
                                id="cohortName"
                                name="name"
                                type="text"
                                value={name}
                                className={clsx(
                                    "rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500",
                                    formDataError.name && "border-red-500 ring-red-200"
                                )}
                                onChange={(e) => setName((e.target.value).toUpperCase())}
                                required
                                disabled={loading}
                                placeholder="e.g. EB1/24"
                            />
                            {formDataError.name && (
                                <p className="text-[11px] font-medium text-red-600">{formDataError.name}</p>
                            )}
                        </div>

                        {/* Cohort Year */}
                        <div className="space-y-1.5">
                            <Label htmlFor="cohortYear" className="text-xs font-bold text-slate-700">
                                Cohort Year
                            </Label>
                            <Input
                                id="cohortYear"
                                name="year"
                                type="number"
                                value={year}
                                className={clsx(
                                    "rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500",
                                    formDataError.year && "border-red-500 ring-red-200"
                                )}
                                onChange={(e) => setYear(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="2024"
                                min="2000"
                                max="2050"
                            />
                            {formDataError.year && (
                                <p className="text-[11px] font-medium text-red-600">{formDataError.year}</p>
                            )}
                        </div>

                        {/* Associated Course */}
                        <div className="space-y-1.5">
                            <Label htmlFor="cohortCourse" className="text-xs font-bold text-slate-700">
                                Associated Course
                            </Label>
                            <Select
                                id="cohortCourse"
                                name="course"
                                value={course}
                                required
                                disabled={loading}
                                onValueChange={(value) => setCourse(value)}
                            >
                                <SelectTrigger className="w-full rounded-xl border-slate-200 text-xs bg-slate-50">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>
                                            {c.name} ({c.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formDataError.course && (
                                <p className="text-[11px] font-medium text-red-600">{formDataError.course}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <LoaderIcon className="animate-spin h-4 w-4" />
                                    <span>Registering...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Register Cohort</span>
                                    <SendHorizonalIcon className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </form>
                </div>

                {/* ── RIGHT COLUMN: Cohort Directory ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Directory Toolbar: Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search cohort name, year, or course..."
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

                        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-end sm:self-auto">
                            Showing {filteredCohorts.length} of {cohorts.length} Cohorts
                        </div>
                    </div>

                    {/* Directory Content Display */}
                    {cohortsLoading ? (
                        /* Skeleton loading grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                                    <div className="h-3 w-4/5 bg-slate-100 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCohorts.length === 0 ? (
                        /* Empty state */
                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
                            <Users className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-sm font-bold text-slate-700">No cohorts found</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {searchTerm ? `No cohort matches "${searchTerm}".` : 'Register a new cohort using the form on the left.'}
                            </p>
                        </div>
                    ) : viewMode === "grid" ? (
                        /* ── CARD GRID VIEW ── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredCohorts.map((cohort) => (
                                <div
                                    key={cohort._id}
                                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
                                >
                                    {/* Card Top Row */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                    {cohort.name}
                                                </h3>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    Year {cohort.year}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Menu: Update Modal + Delete Icon */}
                                        <div className="flex items-center gap-1">
                                            <UpdateCohort courses={courses} cohort={cohort} refreshCohorts={fetchCohorts} />
                                            <DeleteConfirmDialog
                                                title="Delete Cohort"
                                                description={`Are you sure you want to delete cohort "${cohort.name}" (Year ${cohort.year})? This action is permanent and will affect associated student registrations.`}
                                                onConfirm={() => handleDeleteCohort(cohort)}
                                                loading={deletingId === cohort._id}
                                            />
                                        </div>
                                    </div>

                                    {/* Associated Course Badge */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                                        <BookOpen className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                                        <span className="font-semibold text-slate-800 truncate">{cohort.course?.name || "No course specified"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* ── REFINED TABLE VIEW ── */
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-xs uppercase text-slate-500">Cohort Name</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-slate-500">Year</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-slate-500">Associated Course</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-slate-500 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCohorts.map((cohort) => (
                                        <TableRow key={cohort._id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                                            <TableCell className="font-bold text-slate-900 text-xs py-3.5">{cohort.name}</TableCell>
                                            <TableCell className="text-xs text-slate-600 font-semibold">{cohort.year}</TableCell>
                                            <TableCell className="text-xs text-slate-700 font-medium">{cohort.course?.name || "N/A"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <UpdateCohort courses={courses} cohort={cohort} refreshCohorts={fetchCohorts} />
                                                    <DeleteConfirmDialog
                                                        title="Delete Cohort"
                                                        description={`Are you sure you want to delete cohort "${cohort.name}" (Year ${cohort.year})? This action is permanent and will affect associated student registrations.`}
                                                        onConfirm={() => handleDeleteCohort(cohort)}
                                                        loading={deletingId === cohort._id}
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
            </div>

        </div>
    );
}