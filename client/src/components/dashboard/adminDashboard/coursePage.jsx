// Imports
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { courseService } from "@/services/courseApi";
import { useAuth } from "@/contexts/authContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LoaderIcon, 
  SendHorizonalIcon, 
  Search, 
  LayoutGrid, 
  List, 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  FileText, 
  Code
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import UpdateCourse from "@/components/updateCourse";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";
import clsx from "clsx";

export default function CoursePage() {

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // UI state: View toggle & search filter
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
    const [searchTerm, setSearchTerm] = useState("");

    const reset = () => {
        setName('');
        setCode('');
        setDescription('');
    };

    const fetchCourses = async () => {
        setCoursesLoading(true);
        try {
            const data = await courseService.getAllCourses();
            setCourses(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!';
            toast.error(errorMessage);
            setErrors(errorMessage);
            return false;
        } finally {
            setCoursesLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError({});
        setErrors(null);

        let isValid = true;
        let errors = {};

        if (!name.trim()) {
            errors.name = 'Course Name is required.';
            isValid = false;
        }

        if (!code.trim()) {
            errors.code = 'Course Code is required.';
            isValid = false;
        }

        setFormDataError(errors);

        if (!isValid) {
            setLoading(false);
            return;
        }

        const payload = {
            name,
            code,
            description,
        };

        try {
            await courseService.createCourse(payload);
            toast.success('Course created successfully!');
            fetchCourses();
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

    // Filtered courses for search
    const filteredCourses = courses.filter((c) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (c.name && c.name.toLowerCase().includes(term)) ||
            (c.code && c.code.toLowerCase().includes(term)) ||
            (c.description && c.description.toLowerCase().includes(term))
        );
    });

    const handleDeleteCourse = async (course) => {
        setDeletingId(course._id);
        try {
            await courseService.deleteCourse(course._id);
            toast.success(`Course "${course.name}" deleted successfully.`);
            fetchCourses();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete course.';
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
                            Academic Curriculum
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Course &amp; Program Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Define new academic courses, assign program codes, and manage descriptions.
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

                {/* ── LEFT COLUMN: Course Creation Form Card ── */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <PlusCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Register Course</h2>
                            <p className="text-[11px] text-slate-400">Add a new academic course</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Course Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="courseName" className="text-xs font-bold text-slate-700">
                                Course Name
                            </Label>
                            <Input
                                id="courseName"
                                name="name"
                                type="text"
                                value={name}
                                className={clsx(
                                    "rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500",
                                    formDataError.name && "border-red-500 ring-red-200"
                                )}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="e.g. Computer Science"
                            />
                            {formDataError.name && (
                                <p className="text-[11px] font-medium text-red-600">{formDataError.name}</p>
                            )}
                        </div>

                        {/* Course Code */}
                        <div className="space-y-1.5">
                            <Label htmlFor="courseCode" className="text-xs font-bold text-slate-700">
                                Course Code
                            </Label>
                            <Input
                                id="courseCode"
                                name="code"
                                type="text"
                                value={code}
                                className={clsx(
                                    "rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500",
                                    formDataError.code && "border-red-500 ring-red-200"
                                )}
                                onChange={(e) => setCode((e.target.value).toUpperCase())}
                                required
                                disabled={loading}
                                placeholder="e.g. EB1"
                            />
                            {formDataError.code && (
                                <p className="text-[11px] font-medium text-red-600">{formDataError.code}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="courseDescription" className="text-xs font-bold text-slate-700">
                                Description <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                            </Label>
                            <Textarea
                                id="courseDescription"
                                name="description"
                                value={description}
                                className="rounded-xl border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 min-h-[90px]"
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                placeholder="Brief overview of course modules..."
                            />
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
                                    <span>Register Course</span>
                                    <SendHorizonalIcon className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </form>
                </div>

                {/* ── RIGHT COLUMN: Course Directory ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Directory Toolbar: Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search course name or code..."
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
                            Showing {filteredCourses.length} of {courses.length} Courses
                        </div>
                    </div>

                    {/* Directory Content Display */}
                    {coursesLoading ? (
                        /* Skeleton loader */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                                    <div className="h-3 w-4/5 bg-slate-100 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        /* Empty state */
                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
                            <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-sm font-bold text-slate-700">No courses found</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {searchTerm ? `No course matches "${searchTerm}".` : 'Register a new course using the form on the left.'}
                            </p>
                        </div>
                    ) : viewMode === "grid" ? (
                        /* ── CARD GRID VIEW ── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course._id}
                                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
                                >
                                    {/* Card Top Row */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                                                {course.code || "CRS"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                    {course.name}
                                                </h3>
                                                <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    Code: {course.code}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons: Update Modal + Delete Icon */}
                                        <div className="flex items-center gap-1">
                                            <UpdateCourse course={course} refreshCourses={fetchCourses} />
                                            <DeleteConfirmDialog
                                                title="Delete Academic Course"
                                                description={`Are you sure you want to delete course "${course.name}" (${course.code})? This will permanently remove the course registration.`}
                                                onConfirm={() => handleDeleteCourse(course)}
                                                loading={deletingId === course._id}
                                            />
                                        </div>
                                    </div>

                                    {/* Course Description */}
                                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                        {course.description ? (
                                            <div className="flex items-start gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                                <span>{course.description}</span>
                                            </div>
                                        ) : (
                                            <span className="italic text-slate-400">No description provided</span>
                                        )}
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
                                        <TableHead className="font-bold text-xs uppercase text-slate-500">Course Name</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-slate-500">Course Code</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-slate-500">Description</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-slate-500 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCourses.map((course) => (
                                        <TableRow key={course._id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                                            <TableCell className="font-bold text-slate-900 text-xs py-3.5">{course.name}</TableCell>
                                            <TableCell className="text-xs text-slate-600 font-semibold">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                                    {course.code}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 max-w-xs truncate">{course.description || "n/a"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <UpdateCourse course={course} refreshCourses={fetchCourses} />
                                                    <DeleteConfirmDialog
                                                        title="Delete Academic Course"
                                                        description={`Are you sure you want to delete course "${course.name}" (${course.code})? This will permanently remove the course registration.`}
                                                        onConfirm={() => handleDeleteCourse(course)}
                                                        loading={deletingId === course._id}
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

