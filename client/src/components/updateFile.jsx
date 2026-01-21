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
                <DialogTrigger className="">
                    <SquarePenIcon className="text-green-500 cursor-pointer hover:-translate-y-1 transition-all duration-500 "/>
                </DialogTrigger>
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Update file</DialogTitle>
                        <DialogDescription className="text-red-500">* All fields are required</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <span>
                            <Label htmlFor="filename" className="text-lg md:text-2xl lg:text-2xl text-blue-600">File Name:</Label>
                            <Input
                                id="filename"
                                name="fileName"
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className={`border ${formDataError.fileName ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                disabled={loading}
                                required
                                placeholder="Word Docs"
                            />
                        </span>
                        {formDataError.fileName && <p className="mt-1 font-bold text-red-600">{formDataError.fileName}</p>}

                        <span>
                            <Label htmlFor="filedescription" className="text-lg md:text-2xl lg:text-2xl text-blue-600">File Description:</Label>
                            <Input
                                id="filedescription"
                                name="fileDescription"
                                type="text"
                                value={fileDescription}
                                onChange={(e) => setFileDescription(e.target.value)}
                                className={`border ${formDataError.fileDescription ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                disabled={loading}
                                required
                                placeholder="description"
                            />
                        </span>
                        {formDataError.fileDescription && <p className="mt-1 font-bold text-red-600">{formDataError.fileDescription}</p>}

                        <span>
                            <Label
                                htmlFor="file"
                                className="text-lg md:text-2xl lg:text-2xl text-blue-600"
                            >
                                Select File:
                            </Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                                onChange={(e) => setFile(e.target.files[0])}
                                className={`border ${
                                formDataError.file ? "border-2 border-red-500 shadow shadow-red-500" : "border-green-500"
                                }`}
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.file && (<p className="mt-1 font-bold text-red-600">{formDataError.file}</p>)}


                        <span>
                            <Label htmlFor="filetype" className="text-lg md:text-2xl lg:text-2xl text-blue-600">File Type:</Label>
                            <Select
                                id="filetype"
                                value={fileType}
                                onValueChange={(value) => setFileType(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
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
                        </span>
                        {formDataError.fileType && <p className="mt-1 font-bold text-red-600">{formDataError.fileType}</p>}

                        <span>
                            <Label htmlFor="course" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Course:</Label>
                            <Select
                                id="course"
                                value={course}
                                onValueChange={(value) => setCourse(value)}
                                required
                                defaultValue={user.course._id}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
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
                        </span>
                        {formDataError.course && <p className="mt-1 font-bold text-red-600">{formDataError.course}</p>}

                        <span>
                            <Label htmlFor="cohort" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Cohort:</Label>
                            <Select
                                id="cohort"
                                value={cohort}
                                onValueChange={(value) => setCohort(value)}
                                required
                                defaultValue={user.cohort._id}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
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
                        </span>
                        {formDataError.cohort && <p className="mt-1 font-bold text-red-600">{formDataError.cohort}</p>}

                        <Button className="bg-white text-black font-bold shadow-md hover:shadow-green-500 hover:shadow-xl hover:bg-white border md:text-lg lg:text-xl hover:-translate-y-1 transform easeinout duration-500 mt-5 w-full" disabled={loading} type="submit">
                            { loading ? (
                                <div className="flex gap-3 items-center">
                                    Saving
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Save changes
                                    <SendHorizonalIcon />
                                </div> 
                                ) 
                            }
                        </Button>
                    </form>

                    <DialogFooter className="sm:justify-start">
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}