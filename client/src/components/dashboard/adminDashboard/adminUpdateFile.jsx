// Imports
import React, { useState } from "react";
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
import { fileUploadService } from "@/services/fileUploadApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SendHorizonalIcon, LoaderIcon, SquarePenIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminUpdateFile({ fileInfo, refreshFiles, courses = [], cohorts = [] }) {
    const [fileName, setFileName] = useState(fileInfo?.fileName || '');
    const [fileDescription, setFileDescription] = useState(fileInfo?.fileDescription || '');
    const [file, setFile] = useState();
    const [fileType, setFileType] = useState(fileInfo?.fileType || '');
    const [course, setCourse] = useState(fileInfo?.course?._id || 'global');
    const [cohort, setCohort] = useState(fileInfo?.cohort?._id || 'global');
    
    const [formDataError, setFormDataError] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError({});
        setError(null);

        let errors = {};
        let isValid = true;

        if (!fileName.trim()) {
            errors.fileName = 'File Name is required.';
            isValid = false;
        }

        if (!fileDescription.trim()) {
            errors.fileDescription = 'File Description is required.';
            isValid = false;
        }

        if (!fileType.trim()) {
            errors.fileType = 'File Type is required.';
            isValid = false;
        }

        setFormDataError(errors);

        if (!isValid) {
            setLoading(false);
            return;
        }

        const formData = new FormData();
        if (file) {
            formData.append("file", file);
        }
        formData.append("fileName", fileName);
        formData.append("fileDescription", fileDescription);
        formData.append("fileType", fileType);
        
        if (course !== 'global') formData.append("course", course);
        else formData.append("course", "");

        if (cohort !== 'global') formData.append("cohort", cohort);
        else formData.append("cohort", "");

        try {
            await fileUploadService.updateFile(fileInfo._id, formData);
            toast.success(`File updated successfully`);
            setOpen(false);
            if (refreshFiles) refreshFiles();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred!';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                    <SquarePenIcon className="h-3.5 w-3.5" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update File</DialogTitle>
                    <DialogDescription>Modify file metadata or upload a replacement file.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="filename">File Name</Label>
                            <Input
                                id="filename"
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className={`mt-1.5 ${formDataError.fileName ? 'border-destructive' : ''}`}
                                disabled={loading}
                                required
                            />
                            {formDataError.fileName && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileName}</p>}
                        </div>

                        <div>
                            <Label htmlFor="filedescription">File Description</Label>
                            <Input
                                id="filedescription"
                                type="text"
                                value={fileDescription}
                                onChange={(e) => setFileDescription(e.target.value)}
                                className={`mt-1.5 ${formDataError.fileDescription ? 'border-destructive' : ''}`}
                                disabled={loading}
                                required
                            />
                            {formDataError.fileDescription && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileDescription}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <Label htmlFor="file">Replacement File (Optional)</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                                onChange={(e) => setFile(e.target.files[0])}
                                className={`mt-1.5`}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Leave blank to keep the current file.</p>
                        </div>

                        <div>
                            <Label htmlFor="filetype">File Type</Label>
                            <Select
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
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Event">Event</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {formDataError.fileType && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileType}</p>}
                        </div>

                        <div>
                            <Label htmlFor="course">Course</Label>
                            <Select
                                value={course}
                                onValueChange={(value) => setCourse(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-full mt-1.5">
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="global">Global (No specific course)</SelectItem>
                                        {courses.map(c => (
                                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="cohort">Cohort</Label>
                            <Select
                                value={cohort}
                                onValueChange={(value) => setCohort(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-full mt-1.5">
                                    <SelectValue placeholder="Select cohort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="global">Global (No specific cohort)</SelectItem>
                                        {cohorts.map(c => (
                                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="mt-5">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading} type="submit">
                            {loading ? (
                                <>
                                    Updating...
                                    <LoaderIcon className="ml-2 h-4 w-4 animate-spin"/>
                                </>
                            ) : (
                                <>
                                    Update File
                                    <SendHorizonalIcon className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
