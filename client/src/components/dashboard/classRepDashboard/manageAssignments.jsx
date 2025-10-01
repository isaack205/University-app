// Imports
import React, {useState, useEffect} from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import { SendHorizonalIcon, LoaderIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/authContext";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { toast } from "sonner";
import { assignmentService } from "@/services/assignementApi";
import UpdateAssignment from "@/components/updateAssignment";

export default function ManageAssignment() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState([]);
    const [cohort, setCohort] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignments, setAssignments] = useState([])
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);

    const { user } = useAuth();

    const fetchUnitSchedules = async () => {

        try {
            const data = await unitScheduleService.getMyShedule();
            setUnits(data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured.'
            setErrors(errorMessage);
            toast.error(errorMessage)
            return false;
        }
    }

    const fetchAssignments = async () => {

        setAssignmentLoading(true);

        try {
            const data = await assignmentService.getMyCohortsAssignements();
            setAssignments(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured.'
            setErrors(errorMessage);
            return false;
        } finally {
            setAssignmentLoading(false);
        }

    }

    useEffect(() => {

        fetchUnitSchedules();
        fetchAssignments();
    }, []);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedUnit('');
        setDueDate('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError(null);
        setErrors(null);

        let isValid = true;
        let errors = {};

        if (!title.trim()) {
            errors.title = 'Title is required.'
            isValid = false;
        }

        if (!selectedUnit.trim()) {
            errors.selectedUnit = 'Unit is required.'
            isValid = false;
        }

        if (!cohort.trim()) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        if (!dueDate.trim()) {
            errors.dueDate = 'DueDate is required.'
            isValid = false;
        }

        setFormDataError(errors);
        
        if (!isValid) {
            setLoading(false);
            return;
        }

        const localDate = new Date(dueDate)
        const isoDate = localDate.toISOString();

        const payload = {
            title, description, unit: selectedUnit, cohort, dueDate: isoDate
        }

        try {
            await assignmentService.createAssignment(payload);
            fetchAssignments();
            resetForm();
            toast.success('Assignment posted successfully!')
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            toast.error(errorMessage)
            setErrors(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }

    return(
        <div>
            <Dialog>
                <DialogTrigger className="rounded-xl shadow-xl p-1 mt-10 bg-blue-300 cursor-pointer hover:shadow-blue-200 transition-all duration-400 text-black">Create assignment</DialogTrigger>
                <DialogContent className="bg-gray-300">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Register an assignment</DialogTitle>
                        <DialogDescription className="text-red-500">
                            * All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-red-600 text-right">{errors}</p>}

                    <form onSubmit={handleSubmit}>
                        <span>
                            <Label htmlFor="title" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Title</Label>
                            <Input 
                                id="title"
                                name="title"
                                value={title}
                                type="text"
                                onChange={(e) => setTitle(e.target.value)}
                                className={`border ${formDataError.title ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="Assignment title"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.title && <p className="mt-1 font-bold text-red-600">{formDataError.title}</p>}

                        <span>
                            <Label htmlFor="description" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Description</Label>
                            <Input 
                                id="description"
                                name="description"
                                value={description}
                                type="text"
                                onChange={(e) => setDescription(e.target.value)}
                                className='border border-green-500'
                                placeholder="Description (Optional)"
                                disabled={loading}
                            />
                        </span>

                        <div>
                            <Label htmlFor="selectedUnit" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Unit Code</Label>
                            <Select
                                onValueChange={value => setSelectedUnit(value)}
                                disabled={loading}
                                value={selectedUnit}
                                id="selectedUnit"
                                required
                            >
                                <SelectTrigger className="w-[180px] w-full ">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(unit => (
                                        <SelectItem value={unit._id} key={unit._id}>
                                            {unit.unitCode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {formDataError.selectedUnit && <p className="mt-1 font-bold text-red-600">{formDataError.selectedUnit}</p>}

                        <div>
                            <Label htmlFor="cohort" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Cohort</Label>
                            <Select
                                onValueChange={value => setCohort(value)}
                                disabled={loading}
                                value={cohort}
                                id="cohort"
                                required
                            >
                                <SelectTrigger className="w-[180px] w-full ">
                                    <SelectValue placeholder="Select your cohort:" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                        {user?.cohort.name}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formDataError.cohort && <p className="mt-1 font-bold text-red-600">{formDataError.cohort}</p>}

                        <span>
                            <Label htmlFor="duedate" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Due Date</Label>
                            <Input 
                                id="duedate"
                                name="dueDate"
                                value={dueDate}
                                type="datetime-local"
                                onChange={(e) => setDueDate(e.target.value)}
                                className={`border ${formDataError.dueDate ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="Enter date"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.dueDate && <p className="mt-1 font-bold text-red-600">{formDataError.dueDate}</p>}

                        <Button className="bg-white text-black font-bold shadow-md hover:shadow-green-500 hover:shadow-xl hover:bg-white border md:text-lg lg:text-xl hover:-translate-y-1 transform easeinout duration-500 mt-5 w-full" disabled={loading} type="submit">
                            { loading ? (
                                <div className="flex gap-3 items-center">
                                    Creating
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Post assignment
                                    <SendHorizonalIcon />
                                </div> 
                                ) 
                            }
                        </Button>
                    </form>

                </DialogContent>
            </Dialog>
            
            <div className="border rounded-xl p-5 mt-10 bg-blue-100">
                <Table>
                    <TableCaption>Assignments manager.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Title</TableHead>
                            <TableHead>UnitCode</TableHead>
                            <TableHead>DueDate</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    {assignmentLoading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">Loading assignments data.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        ) : (
                        <TableBody>
                            {assignments.map(assignment => (
                                <TableRow key={assignment._id}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>{assignment.unit.unitCode}</TableCell>
                                    <TableCell>{new Date (assignment.dueDate).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <UpdateAssignment assignment={assignment} refreshAssignment={fetchAssignments}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
            </div>
            
        </div>
    )
};