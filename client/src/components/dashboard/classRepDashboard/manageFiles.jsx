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
import { LoaderIcon, SendHorizonalIcon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import UpdateFile from "@/components/updateFile";

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

    useEffect(() => {

        refreshFiles: fetchFiles();
    }, []);

    return (
        <div>
            <Dialog>
                <DialogTrigger className="rounded-xl shadow-xl p-1 mt-10 bg-blue-300 dark:bg-slate-800 text-white cursor-pointer hover:shadow-blue-200 transition-all duration-400 text-black">Upload File</DialogTrigger>
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Upload new file</DialogTitle>
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
                                    Uploading
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Upload File
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

            <div className="border rounded-xl p-5 mt-10 bg-blue-100 dark:bg-slate-800">
                <Table>
                    <TableCaption>File management.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">File Name</TableHead>
                            <TableHead>File Description</TableHead>
                            <TableHead>File type</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    {loadingFiles ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">Loading file details</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <TableBody>
                            {files.map(file => (
                                <TableRow key={file._id}>
                                    <TableCell className="font-medium">{file.fileName}</TableCell>
                                    <TableCell>{file.fileDescription}</TableCell>
                                    <TableCell className="">{file.fileType}</TableCell>
                                    <TableCell className="text-right">
                                        <UpdateFile fileInfo={file} refreshFiles={fetchFiles}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}

                </Table>
            </div>
        </div>
    )
}