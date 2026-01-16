import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { assignmentService } from "@/services/assignementApi";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LoaderIcon, 
  InfoIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  ClipboardCheckIcon,
  ClockIcon,
  UserIcon,
  HashIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const fetchedData = await assignmentService.getMyCohortsAssignements();
      setAssignments(fetchedData);
    } catch (error) {
      const errorMessage = "Error fetching assignments.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleClick = async (id) => {
    setLoadingAssignment(true);
    setOpen(true);
    setSelectedAssignment(null);
    try {
      const singleAssignmentDetails = await assignmentService.getAssignmentById(id);
      setSelectedAssignment(singleAssignmentDetails);
    } catch (error) {
      const message = "Failed to fetch assignment details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const currentDate = new Date();
  const currentAssignments = assignments.filter((a) => new Date(a.dueDate) >= currentDate);
  const pastAssignments = assignments.filter((a) => new Date(a.dueDate) < currentDate);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardCheckIcon className="text-green-600" size={32} />
          My Assignments
        </h3>
        {error && <p className="text-red-500 font-medium animate-pulse">{error}</p>}
      </div>

      {/* CURRENT ASSIGNMENTS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <h4 className="font-bold text-blue-600 flex items-center gap-2 uppercase tracking-wider text-sm">
            <ClockIcon size={18} /> Current Assignments
          </h4>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            {currentAssignments.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold">Unit</TableHead>
                <TableHead className="font-bold">Assignment Title</TableHead>
                <TableHead className="font-bold">Due Date</TableHead>
                <TableHead className="text-right font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <LoaderIcon className="animate-spin h-8 w-8 text-blue-500" />
                      <p className="font-medium">Fetching active tasks...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentAssignments.length > 0 ? (
                currentAssignments.map((assignment) => (
                  <TableRow
                    key={assignment._id}
                    onClick={() => handleClick(assignment._id)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b"
                  >
                    <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                      {assignment.unit.unitName || "N/A"}
                    </TableCell>
                    <TableCell>{assignment.title || "N/A"}</TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                       <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest">
                        {assignment.statusByStudent || "N/A"}
                       </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-400 italic">
                    No current assignments available 😊
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAST ASSIGNMENTS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden opacity-90">
        <div className="p-5 border-b bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <h4 className="font-bold text-red-500 flex items-center gap-2 uppercase tracking-wider text-sm">
            <CalendarIcon size={18} /> Completed / Past
          </h4>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              {pastAssignments.length > 0 ? (
                pastAssignments.map((assignment) => (
                  <TableRow
                    key={assignment._id}
                    onClick={() => handleClick(assignment._id)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-0"
                  >
                    <TableCell className="text-slate-500 w-1/4">{assignment.unit.unitName}</TableCell>
                    <TableCell className="text-slate-500">{assignment.title}</TableCell>
                    <TableCell className="text-right">
                       <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                        {assignment.statusByStudent || "CLOSED"}
                       </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-slate-400 italic">
                    No history found 📘
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="flex items-center gap-3 justify-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <InfoIcon className="text-blue-500" size={18} />
        <p className="text-slate-500 text-sm font-medium">
          Select a row to view full description, cohort details, and lecturer information.
        </p>
      </div>

      {/* ASSIGNMENT DETAILS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 dark:bg-slate-950 p-6 text-white">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <BookOpenIcon className="text-blue-400" />
              Assignment Brief
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            {loadingAssignment ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <LoaderIcon className="animate-spin h-10 w-10 text-blue-500" />
                <p className="text-blue-500 font-bold animate-pulse uppercase text-xs tracking-widest">Loading Details...</p>
              </div>
            ) : !selectedAssignment ? (
              <div className="text-center py-10 text-red-500 font-bold">Could not retrieve assignment details.</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Title" value={selectedAssignment.title} icon={<ClipboardCheckIcon size={14}/>} color="text-blue-600" />
                  <DetailItem label="Unit Name" value={selectedAssignment.unit.unitName} icon={<BookOpenIcon size={14}/>} />
                  <DetailItem label="Unit Code" value={selectedAssignment.unit.unitCode.toUpperCase()} icon={<HashIcon size={14}/>} />
                  <DetailItem label="Lecturer" value={`Mr/Mrs. ${selectedAssignment.unit.lecturer}`} icon={<UserIcon size={14}/>} />
                  <DetailItem label="Cohort" value={selectedAssignment.cohort.name} icon={<UserIcon size={14}/>} />
                  <DetailItem label="Due Date" value={new Date(selectedAssignment.dueDate).toLocaleString()} icon={<CalendarIcon size={14}/>} color="text-red-500" />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Full Description</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {selectedAssignment.description || "No description provided."}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase pt-4 border-t">
                  <div className="flex gap-4">
                    <span>Issued: {new Date(selectedAssignment.createdAt).toLocaleDateString()}</span>
                    <span>Status: {selectedAssignment.statusByStudent}</span>
                  </div>
                  <span>Updated: {new Date(selectedAssignment.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for Dialog items to keep the code dry
function DetailItem({ label, value, icon, color = "text-slate-900 dark:text-white" }) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </span>
      <span className={`font-bold text-sm ${color}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}