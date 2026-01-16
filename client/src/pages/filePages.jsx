import React, { useEffect, useState } from "react";
import { fileUploadService } from "@/services/fileUploadApi";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { 
  DownloadIcon, 
  FileIcon, 
  LoaderIcon, 
  InfoIcon, 
  CalendarIcon, 
  UserIcon, 
  BookOpenIcon,
  ClockIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- SHARED HELPER COMPONENTS ---

const getBadgeClass = (type) => {
  switch (type) {
    case 'Assignment': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'CAT': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Notes': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
};

const FileCard = ({ file, onFileClick, onDownload, loading, selectedFile, errors }) => (
  <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
    <div className="flex items-start gap-4">
      {/* File Detail Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <button 
            onClick={() => onFileClick(file._id)}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors"
          >
            <FileIcon className="h-8 w-8 text-slate-400 group-hover:text-blue-500" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <InfoIcon className="text-blue-500" size={20} />
              File Details
            </DialogTitle>
            <DialogDescription className="text-xs font-medium uppercase tracking-widest text-slate-400 pt-1">
              Metadata & Properties
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <LoaderIcon className="animate-spin text-blue-500" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Retrieving info...</p>
            </div>
          ) : selectedFile ? (
            <div className="space-y-5 py-4">
              <DetailRow label="File Name" value={selectedFile.fileName} />
              <div className="flex justify-between items-center">
                <DetailRow label="Category" value={selectedFile.fileType} isBadge badgeClass={getBadgeClass(selectedFile.fileType)} />
                <DetailRow label="Size" value="Direct Link" />
              </div>
              <DetailRow label="Description" value={selectedFile.fileDescription || 'No description provided'} />
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <DetailRow label="Uploader" value={selectedFile.uploadedBy?.name} icon={<UserIcon size={12}/>} />
                <DetailRow label="Date" value={new Date(selectedFile.uploadedAt).toDateString()} icon={<CalendarIcon size={12}/>} />
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-red-500 font-bold">{errors || "No data found"}</div>
          )}

          <DialogFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 -m-6 mt-2">
            <button
              onClick={() => onDownload(selectedFile)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <DownloadIcon size={18} /> Download Resource
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Basic File Info */}
      <div className="flex-1 min-w-0">
        <h4 
          className="text-sm font-bold text-slate-800 dark:text-white truncate cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onDownload(file)}
        >
          {file.fileName}
        </h4>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${getBadgeClass(file.fileType)}`}>
            {file.fileType}
          </span>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <ClockIcon size={10} /> {new Date(file.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Quick Download */}
      <button 
        onClick={() => onDownload(file)}
        className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
      >
        <DownloadIcon size={20} />
      </button>
    </div>
  </div>
);

const DetailRow = ({ label, value, isBadge, badgeClass, icon }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
      {icon} {label}
    </span>
    {isBadge ? (
      <span className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
        {value}
      </span>
    ) : (
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value || 'N/A'}</span>
    )}
  </div>
);

// --- MAIN COMPONENTS ---

export function CohortFiles() {
  const [cohortFiles, setCohortFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleFileClick = async (id) => {
    setLoading(true);
    setSelectedFile(null);
    try {
      const fileDetails = await fileUploadService.getFileById(id);
      setSelectedFile(fileDetails);
    } catch (error) {
      setErrors("Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    // ... logic remains same as provided ...
    try {
        const res = await fetch(file.fileUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Download started");
    } catch (e) { toast.error("Download failed"); }
  };

  useEffect(() => {
    fileUploadService.getMyCohortsFiles().then(setCohortFiles).catch(err => setErrors(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpenIcon className="text-emerald-500" />
            {user?.cohort?.name} Resources
          </h3>
          <p className="text-sm text-slate-500 font-medium">Shared documents for your specific cohort</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohortFiles.map(file => (
          <FileCard 
            key={file._id} 
            file={file} 
            onFileClick={handleFileClick} 
            onDownload={handleDownload}
            loading={loading}
            selectedFile={selectedFile}
            errors={errors}
          />
        ))}
      </div>
    </div>
  );
}

export function GeneralFiles() {
  const [generalFiles, setGeneralFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleFileClick = async (id) => {
    setLoading(true);
    try {
      const details = await fileUploadService.getFileById(id);
      setSelectedFile(details);
    } catch (e) { setErrors("Error loading file"); }
    finally { setLoading(false); }
  };

  const handleDownload = async (file) => {
    // ... logic remains same as provided ...
     try {
        const res = await fetch(file.fileUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) { toast.error("Download failed"); }
  };

  useEffect(() => {
    fileUploadService.getGeneralFiles().then(setGeneralFiles).catch(err => setErrors(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b pb-5">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileIcon className="text-blue-500" />
          General Library
        </h3>
        <p className="text-sm text-slate-500 font-medium">Public files accessible to all cohorts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generalFiles.map(file => (
          <FileCard 
            key={file._id} 
            file={file} 
            onFileClick={handleFileClick} 
            onDownload={handleDownload}
            loading={loading}
            selectedFile={selectedFile}
            errors={errors}
          />
        ))}
      </div>
    </div>
  );
}