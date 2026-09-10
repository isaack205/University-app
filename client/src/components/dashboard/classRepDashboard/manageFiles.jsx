// Imports
import React, { useEffect, useState } from "react";
import { fileUploadService } from "@/services/fileUploadApi";
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
import { useAuth } from "@/contexts/authContext";
import { LoaderIcon, SendHorizonalIcon, Trash2Icon, FolderIcon, TagIcon, SearchIcon, UploadIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UpdateFile from "@/components/updateFile";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";

export default function ManageFiles() {

    const [fileName, setFileName] = useState('');
    const [fileDescription, setFileDescription] = useState('');
    const [file, setFile] = useState();
    const [fileType, setFileType] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { user } = useAuth();

    const resetForm = () => {
        setFileName('');
        setFileDescription('');
        setFile(null);
        setFileType('');
        setFormDataError({});
    };

    const fetchFiles = async () => {
        setLoadingFiles(true);

        try {
            const data = await fileUploadService.getMyCohortsFiles();
            setFiles(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            setError(errorMessage);
            toast.error(errorMessage)
            return { success: false };
        } finally {
            setLoadingFiles(false);
        }
    }

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        if (selectedFile && !fileName.trim()) {
            const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
            setFileName(nameWithoutExt);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError({});
        setError(null);

        let errors = {};
        let isValid = true;

        if (!fileName.trim()) {
            errors.fileName = 'File Name is required.'
            isValid = false;
        }

        if (!fileDescription.trim()) {
            errors.fileDescription = 'File Description is required.'
            isValid = false;
        }

        if (!file) {
            errors.file = 'File is required.'
            isValid = false;
        }

        if (!fileType.trim()) {
            errors.fileType = 'File Type is required.'
            isValid = false;
        }

        const courseId = user?.course?._id || user?.course;
        const cohortId = user?.cohort?._id || user?.cohort;

        if (!courseId) {
            errors.course = 'Course is required.'
            isValid = false;
        }

        if (!cohortId) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        setFormDataError(errors)

        if (!isValid) {
            setLoading(false);
            return;
        }

       const formData = new FormData(); 
       formData.append("file", file);
       formData.append("fileName", fileName); 
       formData.append("fileDescription", fileDescription); 
       formData.append("fileType", fileType); 
       formData.append("course", courseId); 
       formData.append("cohort", cohortId);

        try {
            await fileUploadService.createFile(formData);
            toast.success(`File uploaded successfully 🚀`);
            setIsDialogOpen(false);
            fetchFiles();
            resetForm();
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            setError(errorMessage);
            toast.error(errorMessage)
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (file) => {
        setDeletingId(file._id);
        try {
            await fileUploadService.deleteFile(file._id);
            toast.success(`"${file.fileName}" deleted successfully.`);
            fetchFiles();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete file.';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const filteredFiles = files.filter(f =>
        f.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.fileType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.fileDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <UploadIcon className="h-4 w-4" />
                            Upload File
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Upload new file</DialogTitle>
                            <DialogDescription>
                                Upload course materials, notes, or assignment files for <strong>{user?.cohort?.name || "your cohort"}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="file">Select File</Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                                        onChange={(e) => handleFileSelect(e.target.files[0])}
                                        className={`mt-1.5 cursor-pointer ${formDataError.file ? 'border-destructive' : ''}`}
                                        disabled={loading}
                                        required
                                    />
                                    {formDataError.file && (<p className="mt-1 text-sm font-medium text-destructive">{formDataError.file}</p>)}
                                </div>

                                <div>
                                    <Label htmlFor="filename">File Name</Label>
                                    <Input
                                        id="filename"
                                        name="fileName"
                                        type="text"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        className={`mt-1.5 ${formDataError.fileName ? 'border-destructive' : ''}`}
                                        disabled={loading}
                                        required
                                        placeholder="e.g. Lecture Notes Week 3"
                                    />
                                    {formDataError.fileName && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileName}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="filetype">File Type</Label>
                                    <Select
                                        id="filetype"
                                        value={fileType}
                                        onValueChange={(value) => setFileType(value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="w-full mt-1.5">
                                            <SelectValue placeholder="Select file type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="Notes">Notes</SelectItem>
                                                <SelectItem value="Assignment">Assignment</SelectItem>
                                                <SelectItem value="CAT">CAT</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {formDataError.fileType && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileType}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="filedescription">File Description</Label>
                                    <Input
                                        id="filedescription"
                                        name="fileDescription"
                                        type="text"
                                        value={fileDescription}
                                        onChange={(e) => setFileDescription(e.target.value)}
                                        className={`mt-1.5 ${formDataError.fileDescription ? 'border-destructive' : ''}`}
                                        disabled={loading}
                                        required
                                        placeholder="Brief description of file contents"
                                    />
                                    {formDataError.fileDescription && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileDescription}</p>}
                                </div>
                            </div>

                            <DialogFooter className="pt-3 border-t">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
                                </DialogClose>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} type="submit">
                                    { loading ? (
                                        <>
                                            Uploading
                                            <LoaderIcon className="animate-spin h-4 w-4 ml-1"/>
                                        </>
                                        ) : (
                                        <>
                                            Upload File
                                            <SendHorizonalIcon className="h-4 w-4 ml-1" />
                                        </>
                                        )
                                    }
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Live Search Input */}
                <div className="relative flex-1 sm:max-w-xs">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-sm"
                    />
                </div>
            </div>

            {/* Cards List */}
            <div className="mt-6 space-y-3">
                {loadingFiles ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading files…</span>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <FolderIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">
                            {searchQuery ? `No files matching "${searchQuery}"` : "No files yet. Upload one above."}
                        </p>
                    </div>
                ) : (
                    filteredFiles.map(file => (
                        <div
                            key={file._id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            {/* Left: Info */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <p className="font-semibold text-foreground truncate">{file.fileName}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 font-medium">
                                        <TagIcon className="h-3 w-3" />
                                        {file.fileType}
                                    </span>
                                </div>
                                {file.fileDescription && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">{file.fileDescription}</p>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <UpdateFile fileInfo={file} refreshFiles={fetchFiles}/>
                                <DeleteConfirmDialog
                                    title="Delete File"
                                    description={`Are you sure you want to delete "${file.fileName}"? This action cannot be undone.`}
                                    onConfirm={() => handleDelete(file)}
                                    loading={deletingId === file._id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}