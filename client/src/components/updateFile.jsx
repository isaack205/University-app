// Imports
import React, { useEffect, useState } from "react";
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
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SendHorizonalIcon, LoaderIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authContext";
import { SquarePenIcon } from "lucide-react";

export default function UpdateFile({ fileInfo, refreshFiles }) {

    const [fileName, setFileName] = useState(fileInfo?.fileName || '');
    const [fileDescription, setFileDescription] = useState(fileInfo?.fileDescription || '');
    const [file, setFile] = useState();
    const [fileType, setFileType] = useState(fileInfo?.fileType || '');
    const [formDataError, setFormDataError] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const { user }= useAuth();
    const [course, setCourse] = useState(user?.course || '');
    const [cohort, setCohort] = useState(user?.cohort || '');

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
            await fileUploadService.updateFile(fileInfo?._id, formData);
            toast.success(`File updated successfully`);
            refreshFiles();
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

    return(
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Edit file">
                        <SquarePenIcon className="text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update file</DialogTitle>
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
                                        Saving
                                        <LoaderIcon className="animate-spin"/>
                                    </>
                                    ) : (
                                    <>
                                        Save changes
                                        <SendHorizonalIcon />
                                    </>
                                    )
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}