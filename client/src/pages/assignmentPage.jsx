// Imports
import React, {useEffect, useState} from "react";
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
import { LoaderIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon } from "lucide-react";

export default function AssignmentPage() {

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAssignment, setLoadingAssignment] = useState(false);
    const [open, setOPen] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    
    const fetchAssignments = async () => {
        setLoading(true)

        try {
            const fetchedData = await assignmentService.getMyCohortsAssignements();
            setAssignments(fetchedData);
        } catch (error) {
            const errorMessage = ('Error fetching assignments:', error)
            toast.error(errorMessage)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {

        fetchAssignments();
    }, []);

    const handleClick = async (id) => {
        setLoadingAssignment(true);
        setOPen(true);
        setSelectedAssignment(null)

        try {
            const singleAssignmentDetails = await assignmentService.getAssignmentById(id);
            setSelectedAssignment(singleAssignmentDetails);
        } catch (error) {
            const message = ("Failed to fetch assignment details:", error);
            setError(message)
            toast.error(message);
        } finally {
            setLoadingAssignment(false)
        };
    }

    return(
        <div>
            <h3 className="text-2xl font-bold text-green-600 underline md:text-2xl lg:text-3xl mb-4">My Assignments</h3>
            {error && <p className="text-end text-red-500 text-xl">{error}</p> }
            
            <Dialog open={open} onOpenChange={setOPen} >
                <div className="border rounded-xl p-4 shadow-xl bg-gradient-to-b from-green-500 to-gray-200">
                    <Table className="mt-4">
                        <TableCaption>All {user.cohort.name} assignments</TableCaption>
                        <TableHeader>
                            <TableRow className="font-bold text-xl">
                                <TableHead className="w-[100px]">Unit</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Due date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        {loading ? (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            <LoaderIcon className="animate-spin h-6 w-6 text-white" />
                                            <p className="text-white font-bold text-xl">Loading assignments</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        ) : assignments.length !== 0 ? (
                            <TableBody>
                                {assignments.map(assignment => (
                                    <TableRow key={assignment._id} onClick={() => handleClick(assignment._id)} className="cursor-pointer">
                                        <TableCell> {assignment.unit.unitName || 'N/A'} </TableCell>
                                        <TableCell> {assignment.title || 'N/A'} </TableCell>
                                        <TableCell> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'N/A'} </TableCell>
                                        <TableCell> {assignment.statusByStudent || 'N/A'} </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        ) : (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            <p className="text-red-500 font-bold text-xl">No assignments found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                </div>
                <DialogContent className="bg-gray-300">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center justify-center gap-2">
                            <InfoIcon className="text-blue-500"/>
                            Assignment details!
                        </DialogTitle>
                    </DialogHeader>
                    <hr className="border-green-500 border-2 rounded-xl"/>

                    {loadingAssignment ? (
                        <div className="flex flex-row items-center justify-center gap-2">
                            <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                            <p className="text-green-500 font-bold text-md lg:text-xl">Loading assignment details</p>
                        </div>
                    ) : !selectedAssignment ? (
                        <div className="flex flex-row items-center justify-center gap-2">
                            <p className="text-red-500 font-bold text-xl">No Details</p>
                        </div>
                    ) : (
                        <div>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Title:</p>
                                <p className="text-yellow-600 font-bold pl-5">{selectedAssignment.title || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Description:</p>
                                <p className="text-yellow-600 font-bold pl-5">{selectedAssignment.description || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Unit Name:</p>
                                <p className="text-yellow-600 font-bold pl-5">{selectedAssignment.unit.unitName || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Unit Code:</p>
                                <p className="text-yellow-600 font-bold pl-5">{(selectedAssignment.unit.unitCode.toUpperCase()) || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Lecturer:</p>
                                <p className="text-yellow-600 font-bold pl-5">Mr/Mrs. {selectedAssignment.unit.lecturer || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Cohort:</p>
                                <p className="text-yellow-600 font-bold pl-5">{selectedAssignment.cohort.name || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Start date::</p>
                                <p className="text-yellow-600 font-bold pl-5">{new Date (selectedAssignment.createdAt).toLocaleString() || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Due Date:</p>
                                <p className="text-red-500 font-bold pl-5">{new Date (selectedAssignment.dueDate).toLocaleString() || 'N/A'}</p> 
                            </span>
                            <span className="flex flex-col justify-center ">
                                <p className="font-bold text-lg">Status:</p>
                                <p className="text-yellow-600 font-bold pl-5">{selectedAssignment.statusByStudent || 'N/A'}</p> 
                            </span>
                            <span className="flex items-center justify-end text-[12px] gap-2">
                                <p className="text-gray-600">Updated:</p>
                                <p className="text-gray-500 font-bold">{new Date (selectedAssignment.updatedAt).toLocaleString() || 'N/A'}</p> 
                            </span>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-3 mt-10 justify-center">
                <InfoIcon className="text-blue-500"/>
                <p className="text-blue-600">To view assignments full details click individual row!</p>
            </div>
        </div>
    )
}