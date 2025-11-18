// Imports
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
import { LoaderIcon, InfoIcon } from "lucide-react";
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

  // Fetch all assignments
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

  // Fetch single assignment details
  const handleClick = async (id) => {
    setLoadingAssignment(true);
    setOpen(true);
    setSelectedAssignment(null);

    try {
      const singleAssignmentDetails =
        await assignmentService.getAssignmentById(id);
      setSelectedAssignment(singleAssignmentDetails);
    } catch (error) {
      const message = "Failed to fetch assignment details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingAssignment(false);
    }
  };

  // Separate current and past assignments
  const currentDate = new Date();
  const currentAssignments = assignments.filter((a) => new Date(a.dueDate) >= currentDate);

  const pastAssignments = assignments.filter((a) => new Date(a.dueDate) < currentDate);

  return (
    <div>
      <h3 className="text-2xl font-bold text-green-600 underline md:text-2xl lg:text-3xl mb-4">
        My Assignments
      </h3>

      {error && <p className="text-end text-red-500 text-xl">{error}</p>}

      {/* CURRENT ASSIGNMENTS */}
      <div className="border rounded-xl p-4 shadow-xl bg-gradient-to-b from-green-500 to-gray-200 dark:from-slate-800 dark:to-slate-800 mb-10">
        <h4 className="text-xl font-bold text-blue-700 underline mb-3">
          Current Assignments
        </h4>

        <Table className="mt-2">
          <TableCaption>
            All {user?.cohort?.name} current assignments
          </TableCaption>
          <TableHeader>
            <TableRow className="font-bold text-xl">
              <TableHead>Unit</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <LoaderIcon className="animate-spin h-6 w-6 text-white" />
                    <p className="text-white font-bold text-xl">
                      Loading assignments
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : currentAssignments.length > 0 ? (
            <TableBody>
              {currentAssignments.map((assignment) => (
                <TableRow
                  key={assignment._id}
                  onClick={() => handleClick(assignment._id)}
                  className="cursor-pointer hover:bg-green-100 transition"
                >
                  <TableCell>{assignment.unit.unitName || "N/A"}</TableCell>
                  <TableCell>{assignment.title || "N/A"}</TableCell>
                  <TableCell>
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>{assignment.statusByStudent || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <p className="text-gray-500 italic text-lg">
                    No current assignments 😊
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </div>

      {/*  PAST ASSIGNMENTS  */}
      <div className="border rounded-xl p-4 shadow-xl bg-gradient-to-b from-gray-300 to-gray-100 dark:from-slate-700 dark:to-slate-700">
        <h4 className="text-xl font-bold text-red-600 underline mb-3">
          Past Assignments
        </h4>

        <Table className="mt-2">
          <TableCaption>Past {user?.cohort?.name} assignments</TableCaption>
          <TableHeader>
            <TableRow className="font-bold text-xl">
              <TableHead>Unit</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          {pastAssignments.length > 0 ? (
            <TableBody>
              {pastAssignments.map((assignment) => (
                <TableRow
                  key={assignment._id}
                  onClick={() => handleClick(assignment._id)}
                  className="cursor-pointer hover:bg-gray-100 transition"
                >
                  <TableCell>{assignment.unit.unitName || "N/A"}</TableCell>
                  <TableCell>{assignment.title || "N/A"}</TableCell>
                  <TableCell>
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>{assignment.statusByStudent || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <p className="text-gray-500 italic text-lg">
                    No past assignments 📘
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </div>

      {/* ASSIGNMENT DETAILS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-300 dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              <InfoIcon className="text-blue-500" />
              Assignment Details
            </DialogTitle>
          </DialogHeader>
          <hr className="border-green-500 border-2 dark:border-slate-500 rounded-xl" />

          {loadingAssignment ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
              <p className="text-green-500 font-bold text-md lg:text-xl">
                Loading assignment details
              </p>
            </div>
          ) : !selectedAssignment ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-red-500 font-bold text-xl">No Details</p>
            </div>
          ) : (
            <div>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Title:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedAssignment.title || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Description:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedAssignment.description || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Unit Name:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedAssignment.unit.unitName || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Unit Code:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedAssignment.unit.unitCode.toUpperCase() || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Lecturer:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  Mr/Mrs. {selectedAssignment.unit.lecturer || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Cohort:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedAssignment.cohort.name || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Start Date:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {new Date(selectedAssignment.createdAt).toLocaleString() ||
                    "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Due Date:</p>
                <p className="text-red-500 font-bold pl-5">
                  {new Date(selectedAssignment.dueDate).toLocaleString() ||
                    "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Status:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedAssignment.statusByStudent || "N/A"}
                </p>
              </span>
              <span className="flex items-center justify-end text-[12px] gap-2">
                <p className="text-gray-600">Updated:</p>
                <p className="text-gray-500 font-bold">
                  {new Date(selectedAssignment.updatedAt).toLocaleString() ||
                    "N/A"}
                </p>
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FOOTER NOTE */}
      <div className="flex items-center gap-3 mt-10 justify-center">
        <InfoIcon className="text-blue-500" />
        <p className="text-blue-600">
          To view assignment’s full details, click an individual row!
        </p>
      </div>
    </div>
  );
}
