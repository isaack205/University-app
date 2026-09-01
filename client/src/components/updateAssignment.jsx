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
import { Textarea } from "./ui/textarea";

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
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Edit assignment">
                        <SquarePenIcon className="text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update assignment</DialogTitle>
                        <DialogDescription>
                            * All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-destructive text-right">{errors}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={title}
                                    type="text"
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={`mt-1.5 ${formDataError.title ? 'border-destructive' : ''}`}
                                    placeholder="Assignment title"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.title && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="selectedUnit">Unit Code</Label>
                                <Select
                                    onValueChange={value => setSelectedUnit(value)}
                                    disabled={loading}
                                    value={selectedUnit}
                                    id="selectedUnit"
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1.5">
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
                                {formDataError.selectedUnit && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.selectedUnit}</p>}
                            </div>

                            <div>
                                <Label htmlFor="cohort">Cohort</Label>
                                <Select
                                    onValueChange={value => setCohort(value)}
                                    disabled={loading}
                                    value={cohort}
                                    id="cohort"
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select your cohort:" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                            {user?.cohort.name}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {formDataError.cohort && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.cohort}</p>}
                            </div>

                            <div>
                                <Label htmlFor="duedate">Due Date</Label>
                                <Input
                                    id="duedate"
                                    name="dueDate"
                                    value={dueDate}
                                    type="datetime-local"
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className={`mt-1.5 ${formDataError.dueDate ? 'border-destructive' : ''}`}
                                    placeholder="Enter date"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.dueDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.dueDate}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1.5"
                                    placeholder="Description (Optional)"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-5">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} type="submit">
                                { loading ? (
                                    <>
                                        Saving
                                        <LoaderIcon className="animate-spin"/>
                                    </>
                                    ) : (
                                    <>
                                        Save Changes
                                        <SendHorizonalIcon />
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