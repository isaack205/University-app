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
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(fileInfo?.fileType || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formDataError, setFormDataError] = useState({});
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        if (fileInfo) {
            setFileName(fileInfo.fileName || '');
            setFileDescription(fileInfo.fileDescription || '');
            setFileType(fileInfo.fileType || '');
        }
    }, [fileInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError({});

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

        const courseId = user?.course?._id || user?.course;
        const cohortId = user?.cohort?._id || user?.cohort;

        const formData = new FormData();
        if (file) {
            formData.append("file", file);
        }
        formData.append("fileName", fileName);
        formData.append("fileDescription", fileDescription);
        formData.append("fileType", fileType);
        if (courseId) formData.append("course", courseId);
        if (cohortId) formData.append("cohort", cohortId);

        try {
            await fileUploadService.updateFile(fileInfo?._id, formData);
            toast.success(`File updated successfully ✏️`);
            setIsDialogOpen(false);
            refreshFiles();
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!';
            toast.error(errorMessage);
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Edit file">
                        <SquarePenIcon className="h-4 w-4 text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update file</DialogTitle>
                        <DialogDescription>Update file properties or optionally upload a replacement file.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                                    placeholder="File name"
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
                                    placeholder="Description"
                                />
                                {formDataError.fileDescription && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.fileDescription}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="file">Replace File (Optional)</Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="mt-1.5 cursor-pointer"
                                    disabled={loading}
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">Leave empty to keep current file.</p>
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
                            </DialogClose>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} type="submit">
                                { loading ? (
                                    <>
                                        Saving
                                        <LoaderIcon className="animate-spin h-4 w-4 ml-1"/>
                                    </>
                                    ) : (
                                    <>
                                        Save changes
                                        <SendHorizonalIcon className="h-4 w-4 ml-1" />
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