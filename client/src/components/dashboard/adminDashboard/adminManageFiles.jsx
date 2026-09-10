import React, { useEffect, useState, useMemo } from "react";
import { fileUploadService } from "@/services/fileUploadApi";
import { courseService } from "@/services/courseApi";
import { cohortService } from "@/services/cohortApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LoaderIcon, SendHorizonalIcon, FolderIcon, TagIcon, SearchIcon, FilterIcon, FileArchiveIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminUpdateFile from "./adminUpdateFile";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";

export default function AdminManageFiles() {
    // Form States
    const [fileName, setFileName] = useState('');
    const [fileDescription, setFileDescription] = useState('');
    const [file, setFile] = useState();
    const [fileType, setFileType] = useState('');
    const [course, setCourse] = useState('global');
    const [cohort, setCohort] = useState('global');
    const [formDataError, setFormDataError] = useState({});
    const [uploadLoading, setUploadLoading] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Data States
    const [files, setFiles] = useState([]);
    const [courses, setCourses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterCohort, setFilterCohort] = useState('All');

    const resetForm = () => {
        setFileName('');
        setFileDescription('');
        setFile(null);
        setFileType('');
        setCourse('global');
        setCohort('global');
        setFormDataError({});
    };

    const fetchAllData = async () => {
        setLoadingFiles(true);
        try {
            const [filesRes, coursesRes, cohortsRes] = await Promise.all([
                fileUploadService.getAllFiles(),
                courseService.getAllCourses(),
                cohortService.getAllCohorts(),
            ]);
            setFiles(filesRes || []);
            setCourses(Array.isArray(coursesRes) ? coursesRes : []);
            setCohorts(Array.isArray(cohortsRes) ? cohortsRes : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data.");
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setUploadLoading(true);
        setFormDataError({});

        let errors = {};
        let isValid = true;

        if (!fileName.trim()) { errors.fileName = 'File Name is required.'; isValid = false; }
        if (!fileDescription.trim()) { errors.fileDescription = 'File Description is required.'; isValid = false; }
        if (!file) { errors.file = 'File is required.'; isValid = false; }
        if (!fileType.trim()) { errors.fileType = 'File Type is required.'; isValid = false; }

        setFormDataError(errors);

        if (!isValid) {
            setUploadLoading(false);
            return;
        }

        const formData = new FormData(); 
        formData.append("file", file);
        formData.append("fileName", fileName); 
        formData.append("fileDescription", fileDescription); 
        formData.append("fileType", fileType); 
        
        if (course !== 'global') formData.append("course", course);
        if (cohort !== 'global') formData.append("cohort", cohort);

        try {
            await fileUploadService.createFile(formData);
            toast.success(`File uploaded successfully`);
            fetchAllData();
            resetForm();
            setIsUploadOpen(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred!';
            toast.error(errorMessage);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDelete = async (fileToDelete) => {
        setDeletingId(fileToDelete._id);
        try {
            await fileUploadService.deleteFile(fileToDelete._id);
            toast.success(`"${fileToDelete.fileName}" deleted successfully.`);
            fetchAllData();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete file.';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredFiles = useMemo(() => {
        return files.filter(f => {
            const matchesSearch = f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  f.fileDescription?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'All' || f.fileType === filterType;
            let matchesCohort = true;
            if (filterCohort === 'Global') {
                matchesCohort = !f.cohort;
            } else if (filterCohort !== 'All') {
                matchesCohort = f.cohort?._id === filterCohort;
            }
            return matchesSearch && matchesType && matchesCohort;
        });
    }, [files, searchQuery, filterType, filterCohort]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                            <span>Admin Dashboard</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            <span className="text-indigo-600 font-medium">Manage Files</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
                                <FileArchiveIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Global File Repository</h1>
                                <p className="text-xs text-slate-400">Upload, view, and manage files across all cohorts</p>
                            </div>
                        </div>
                    </div>
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all hover:-translate-y-0.5">
                                <FolderIcon className="mr-2 h-4 w-4" /> Upload New File
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Upload New File</DialogTitle>
                                <DialogDescription>Admins can upload global files (no cohort) or target specific cohorts.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleUploadSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="filename">File Name</Label>
                                        <Input
                                            id="filename"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            className={`mt-1.5 ${formDataError.fileName ? 'border-destructive' : ''}`}
                                            disabled={uploadLoading}
                                            required
                                        />
                                        {formDataError.fileName && <p className="mt-1 text-sm text-destructive">{formDataError.fileName}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="filedescription">File Description</Label>
                                        <Input
                                            id="filedescription"
                                            value={fileDescription}
                                            onChange={(e) => setFileDescription(e.target.value)}
                                            className={`mt-1.5 ${formDataError.fileDescription ? 'border-destructive' : ''}`}
                                            disabled={uploadLoading}
                                            required
                                        />
                                        {formDataError.fileDescription && <p className="mt-1 text-sm text-destructive">{formDataError.fileDescription}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="file">Select File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className={`mt-1.5 ${formDataError.file ? 'border-destructive' : ''}`}
                                            disabled={uploadLoading}
                                            required
                                        />
                                        {formDataError.file && (<p className="mt-1 text-sm text-destructive">{formDataError.file}</p>)}
                                    </div>
                                    <div>
                                        <Label>File Type</Label>
                                        <Select value={fileType} onValueChange={setFileType} disabled={uploadLoading}>
                                            <SelectTrigger className="w-full mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="General">General (Global)</SelectItem>
                                                <SelectItem value="Event">Event (Global)</SelectItem>
                                                <SelectItem value="Assignment">Assignment</SelectItem>
                                                <SelectItem value="Notes">Notes</SelectItem>
                                                <SelectItem value="CAT">CAT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formDataError.fileType && <p className="mt-1 text-sm text-destructive">{formDataError.fileType}</p>}
                                    </div>
                                    <div>
                                        <Label>Course</Label>
                                        <Select value={course} onValueChange={setCourse} disabled={uploadLoading}>
                                            <SelectTrigger className="w-full mt-1.5"><SelectValue placeholder="Global (No course)" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="global">Global (No specific course)</SelectItem>
                                                {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Cohort</Label>
                                        <Select value={cohort} onValueChange={setCohort} disabled={uploadLoading}>
                                            <SelectTrigger className="w-full mt-1.5"><SelectValue placeholder="Global (No cohort)" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="global">Global (No specific cohort)</SelectItem>
                                                {cohorts.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="mt-6">
                                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={uploadLoading} type="submit">
                                        { uploadLoading ? <><LoaderIcon className="mr-2 animate-spin h-4 w-4"/> Uploading</> : <><SendHorizonalIcon className="mr-2 h-4 w-4"/> Upload File</> }
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="px-8 py-7">
                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            type="text" 
                            placeholder="Search files by name or description..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FilterIcon className="h-4 w-4 text-slate-400" />
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="File Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Types</SelectItem>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Event">Event</SelectItem>
                                    <SelectItem value="Assignment">Assignment</SelectItem>
                                    <SelectItem value="Notes">Notes</SelectItem>
                                    <SelectItem value="CAT">CAT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Select value={filterCohort} onValueChange={setFilterCohort}>
                            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Cohort Scope" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Scopes</SelectItem>
                                <SelectItem value="Global">Global Only</SelectItem>
                                {cohorts.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* File List */}
                <div className="space-y-3">
                    {loadingFiles ? (
                        <div className="flex flex-col items-center justify-center py-20 text-indigo-600 gap-3">
                            <LoaderIcon className="animate-spin h-8 w-8" />
                            <span className="font-medium">Loading repository...</span>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-3 bg-white rounded-xl border border-dashed border-slate-300">
                            <FolderIcon className="h-12 w-12 text-slate-300" />
                            <p className="text-sm">No files found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredFiles.map(file => (
                                <div key={file._id} className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-300">
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    file.cohort 
                                                        ? 'bg-violet-100 text-violet-700 border border-violet-200' 
                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    <TagIcon className="h-3 w-3" />
                                                    {file.cohort ? 'Cohort Specific' : 'Global'}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 rounded-full">{file.fileType}</span>
                                            </div>
                                        </div>
                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="block font-bold text-slate-800 text-lg mb-1 hover:text-indigo-600 hover:underline line-clamp-1">
                                            {file.fileName}
                                        </a>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                                            {file.fileDescription || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="mt-auto">
                                        {file.cohort && (
                                            <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded-lg mb-4 border border-slate-100">
                                                <span className="block font-medium text-slate-600 mb-0.5">Assigned to:</span>
                                                {file.course?.name && <span className="block truncate">• Course: {file.course.name}</span>}
                                                {file.cohort?.name && <span className="block truncate">• Cohort: {file.cohort.name}</span>}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold">
                                                    {file.uploadedBy?.name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                                <span className="truncate max-w-[100px]">{file.uploadedBy?.name || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <AdminUpdateFile fileInfo={file} refreshFiles={fetchAllData} courses={courses} cohorts={cohorts} />
                                                <DeleteConfirmDialog
                                                    title="Delete File"
                                                    description={`Are you sure you want to delete "${file.fileName}"? This action cannot be undone.`}
                                                    onConfirm={() => handleDelete(file)}
                                                    loading={deletingId === file._id}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
