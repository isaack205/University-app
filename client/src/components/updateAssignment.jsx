// Imports
import React, { useEffect, useState } from "react";
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
import MarkdownEditor from "@/components/common/markdownEditor";

export default function UpdateAssignment({ assignment, refreshAssignment }) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [units, setUnits] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        if (!isoString) return '';
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
            setDueDate(formatDateForInput(assignment?.dueDate) || '');
        }
        fetchUnitSchedules();
    }, [assignment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setFormDataError({});
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

        if (!dueDate.trim()) {
            errors.dueDate = 'Due Date is required.'
            isValid = false;
        }

        setFormDataError(errors);
        
        if (!isValid) {
            setLoading(false);
            return;
        }

        const cohortId = user?.cohort?._id || user?.cohort;

        const payload = {
            _id: assignment?._id,
            title,
            description,
            unit: selectedUnit,
            cohort: cohortId,
            dueDate: new Date(dueDate).toISOString()
        }

        try {
            await assignmentService.updateAssignment(payload._id, payload);
            toast.success('Assignment updated successfully! ✏️')
            setIsDialogOpen(false);
            refreshAssignment();
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Edit assignment">
                        <SquarePenIcon className="h-4 w-4 text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update assignment</DialogTitle>
                        <DialogDescription>Modify details for this assignment.</DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-destructive text-right text-sm">{errors}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
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
                                                {unit.unitCode} – {unit.unitName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formDataError.selectedUnit && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.selectedUnit}</p>}
                            </div>

                            <div>
                                <Label htmlFor="duedate">Due Date & Time</Label>
                                <Input
                                    id="duedate"
                                    name="dueDate"
                                    value={dueDate}
                                    type="datetime-local"
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className={`mt-1.5 ${formDataError.dueDate ? 'border-destructive' : ''}`}
                                    disabled={loading}
                                    required
                                />
                                {formDataError.dueDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.dueDate}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <MarkdownEditor
                                    id="edit-assignment-description"
                                    label="Description (Optional)"
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Details, instructions, bullet points, or submission guidelines..."
                                    disabled={loading}
                                    rows={4}
                                />
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
                                        Save Changes
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