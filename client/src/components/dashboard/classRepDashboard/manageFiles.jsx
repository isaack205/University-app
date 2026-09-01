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
import { LoaderIcon, SendHorizonalIcon, Trash2Icon, FolderIcon, TagIcon } from "lucide-react";
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
    const [course, setCourse] = useState('');
    const [cohort, setCohort] = useState('');
    const [formDataError, setFormDataError] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { user } = useAuth();

    const resetForm = () => {
        setFileName('');
        setFileDescription('');
        setFile();
        setFileType('');
        setCourse('');
        setCohort('');
        setFormDataError('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError(null);
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

        if (!course.trim()) {
            errors.course = 'Course is required.'
            isValid = false;
        }

        if (!cohort.trim()) {
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
       formData.append("course", course); 
       formData.append("cohort", cohort);

        try {
            await fileUploadService.createFile(formData);
            toast.success(`File uploaded successfully`);
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

        refreshFiles: fetchFiles();
    }, []);

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">Upload File</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Upload new file</DialogTitle>
                        <DialogDescription>* All fields are required</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    placeholder="Word Docs"
                                />
                                {formDataError.fileName && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileName}</p>}
                            </div>

                            <div>
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
                                    placeholder="description"
                                />
                                {formDataError.fileDescription && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileDescription}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="file">Select File</Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className={`mt-1.5 ${formDataError.file ? 'border-destructive' : ''}`}
                                    disabled={loading}
                                    required
                                />
                                {formDataError.file && (<p className="mt-1 text-sm font-medium text-destructive">{formDataError.file}</p>)}
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
                                            <SelectItem value="Assignment">Assignment</SelectItem>
                                            <SelectItem value="Notes">Notes</SelectItem>
                                            <SelectItem value="CAT">CAT</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {formDataError.fileType && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileType}</p>}
                            </div>

                            <div>
                                <Label htmlFor="course">Course</Label>
                                <Select
                                    id="course"
                                    value={course}
                                    onValueChange={(value) => setCourse(value)}
                                    required
                                    defaultValue={user.course._id}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select your course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value={user.course._id} key={user.course._id}>
                                                {user.course.name}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {formDataError.course && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.course}</p>}
                            </div>

                            <div>
                                <Label htmlFor="cohort">Cohort</Label>
                                <Select
                                    id="cohort"
                                    value={cohort}
                                    onValueChange={(value) => setCohort(value)}
                                    required
                                    defaultValue={user.cohort._id}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select your group/cohort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                                {user.cohort.name}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {formDataError.cohort && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.cohort}</p>}
                            </div>
                        </div>

                        <DialogFooter className="mt-5">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} type="submit">
                                { loading ? (
                                    <>
                                        Uploading
                                        <LoaderIcon className="animate-spin"/>
                                    </>
                                    ) : (
                                    <>
                                        Upload File
                                        <SendHorizonalIcon />
                                    </>
                                    )
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cards List */}
            <div className="mt-6 space-y-3">
                {loadingFiles ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading files…</span>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <FolderIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">No files yet. Upload one above.</p>
                    </div>
                ) : (
                    files.map(file => (
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