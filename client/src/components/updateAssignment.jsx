// Imports
import React, {useEffect, useState} from "react";
import { SquarePenIcon, LoaderIcon, SendHorizonalIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { assignmentService } from "@/services/assignementApi";

export default function UpdateAssignment({ assignment, refreshAssignment }) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [cohort, setCohort] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
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
    };


    function formatDateForInput(isoString) {
        const date = new Date(isoString);

        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);

        return local;
    }

    useEffect(() => {

        if (assignment) {
            setTitle(assignment?.title || '');
            setDescription(assignment?.description || '');
            setSelectedUnit(assignment?.unit?._id || assignment?.unit || '');
            setCohort(assignment?.cohort?._id || assignment?.cohort || '');
            setDueDate(formatDateForInput(assignment?.dueDate) || '')
        }

        fetchUnitSchedules();
    }, [assignment]);

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

        const payload = {
            _id: assignment?._id, title, description, unit: selectedUnit, cohort, dueDate: new Date(dueDate).toISOString()
        }

        try {
            await assignmentService.updateAssignment(payload._id, payload);
            refreshAssignment();
            toast.success('Assignment updated successfully!')
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
                <DialogTrigger>
                    <SquarePenIcon className="text-green-500 cursor-pointer hover:-translate-y-1 transition-all duration-500 "/>
                </DialogTrigger>
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Update assignment</DialogTitle>
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
                                    Saving
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Save Changes
                                    <SendHorizonalIcon />
                                </div> 
                                ) 
                            }
                        </Button>
                    </form>

                </DialogContent>
            </Dialog>
        </div>
    )
}