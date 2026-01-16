// Imports
import React, { useEffect, useState} from "react";
import { fileUploadService } from "@/services/fileUploadApi";
import { toast } from "sonner";
import { DownloadIcon, FileIcon } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
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
import { LoaderIcon, InfoIcon } from "lucide-react";

export default function CohortFiles() {

    const [cohortFiles, setCohortFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    // Fetch single file details
    const handleClick = async (id) => {
        setLoading(true);
        setSelectedFile(null);

        try {
            const fileDetails = await fileUploadService.getFileById(id);
            setSelectedFile(fileDetails);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to fetch file details.";
            setErrors(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCohortFiles = async () => {
        try {
            const data = await fileUploadService.getMyCohortsFiles();
            setCohortFiles(data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured.';
            toast.error(message);
            setErrors(message);
        }
    }



    const handleDownload = async (file) => {
        try {
            const res = await fetch(file.fileUrl);
            if (!res.ok) throw new Error('Failed to fetch file');
            const blob = await res.blob();

            // Use File System Access API when supported (Chromium on Android/desktop)
            if (window.showSaveFilePicker && typeof window.showSaveFilePicker === 'function') {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: file.fileName,
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    toast.success('Saved to device');
                    return;
                } catch (err) {
                    // User may cancel — fallthrough to anchor fallback
                    console.warn('save picker cancelled or failed', err.message || err);
                }
            }

            // Fallback: create blob URL and trigger download via anchor
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.fileName || 'download';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Download failed.';
            toast.error(message);
            console.error('Download error', error);
        }
    }

    const getBadgeClass = (type) => {
        switch (type) {
            case 'Assignment':
                return 'bg-gray-400  text-white';
            case 'CAT':
                return 'bg-red-500 text-white';
            case 'Notes':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-green-500 text-white';
        }
    }

    useEffect(() => {
        fetchCohortFiles();

    }, []);

    return(
        <>
            <div className="flex justify-between">
                <h3 className="text-3xl font-bold text-green-500 underline mb-5">{user.cohort.name} Files</h3>
                {errors && <p className="text-red-500 font-bold text-md">{errors}</p> }
            </div>
            <div className="">
                {cohortFiles.map((cohortFile) => (
                    <div className="rounded-xl mb-5 shadow-xl p-4 border-1 gap-2 flex items-center hover:-translate-y-2 transition-all duration-600 ease-in-out bg-gray-200" key={cohortFile._id} >
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    title="Click to view file details"
                                    className="w-[20%] flex items-center justify-center"
                                    onClick={() => handleClick(cohortFile._id)}
                                >
                                    <FileIcon className="h-15 w-15 text-red-500 cursor-pointer" />
                                </button>
                            </DialogTrigger>
                            <DialogContent  className="bg-gray-300 dark:bg-slate-800">
                                <DialogHeader>
                                    <DialogTitle  className="text-xl flex items-center justify-center gap-2">
                                        <InfoIcon className="text-blue-500" />
                                        File Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedFile?.fileName}
                                    </DialogDescription>
                                </DialogHeader>
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">
                                            Loading file details
                                        </p>
                                    </div>
                                    ) : !selectedFile ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <p className="text-red-500 font-bold text-xl">No Details</p>
                                    </div>
                                    ) : (
                                    <div>
                                        <span className="flex flex-col justify-center ">
                                            <p className="font-bold text-lg">File Name:</p>
                                            <p className="text-gray-600">{selectedFile.fileName || 'N/A'}</p>
                                        </span>
                                        <div>
                                            <p className="font-bold text-lg">File Type:</p>
                                            <p className={`inline-block ${getBadgeClass(selectedFile.fileType)} rounded-xl p-1`}>
                                                {selectedFile.fileType}
                                            </p>
                                        </div>
                                        <span className="flex flex-col justify-center ">
                                            <p className="font-bold text-lg">Uploaded By:</p>
                                            <p className="text-gray-600">{selectedFile?.uploadedBy?.name || 'N/A'}</p>
                                        </span>
                                        <span className="flex flex-col justify-center ">
                                            <p className="font-bold text-lg">Upload Date:</p>
                                            <p className="text-gray-600">{new Date(selectedFile.uploadedAt).toDateString()}</p>
                                        </span>
                                        <span className="flex flex-col justify-center ">
                                            <p className="font-bold text-lg">Description:</p>
                                            <p className="text-gray-600">{selectedFile.fileDescription || 'N/A'}</p>
                                        </span>
                                        <span className="flex flex-col justify-center ">
                                            <p className="font-bold text-lg">Course:</p>
                                            <p className="text-gray-600">{selectedFile?.course?.name || 'N/A'}</p>
                                        </span>
                                        <span className="flex items-center justify-end text-[12px] gap-2">
                                            <p className="text-gray-600">Updated:</p>
                                            <p className="text-gray-500 font-bold">
                                                {new Date(selectedFile.updatedAt).toLocaleString() ||
                                                "N/A"}
                                            </p>
                                        </span>
                                    </div>
                                          )}
                                <DialogFooter>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(selectedFile)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Download File
                                    </button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className="flex flex-col w-[80%] gap-3">
                            <div className="flex justify-between hover:text-blue-500 hover:underline cursor-pointer" onClick={() => handleDownload(cohortFile)}>
                                <p className="text-xl md:text-xl lg:text-2xl font-bold">
                                    {cohortFile.fileName}
                                </p>
                                <button aria-label={`Download ${cohortFile.fileName}`} >
                                    <DownloadIcon className="justify-end"/>
                                </button>
                            </div>
                            <div className="flex gap-3 justify-end items-center text-[10px] ">
                                <span className={`${getBadgeClass(cohortFile.fileType)} rounded-xl p-1`}>{cohortFile.fileType}</span>
                                <span>Posted: {new Date(cohortFile.createdAt).toDateString()}</span> 
                            </div>
                        </div>
                    </div>
                ))}
            </div>
           
        </>
    )
}