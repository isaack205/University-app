// Imports
import React, {useState, useEffect} from "react";
import { SendHorizonalIcon, LoaderIcon, Trash2Icon, ClipboardListIcon, CalendarIcon, BookOpenIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";

export default function ManageAssignment() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState([]);
    const [cohort, setCohort] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
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

    const handleDelete = async (assignment) => {
        setDeletingId(assignment._id);
        try {
            await assignmentService.deleteAssignment(assignment._id);
            toast.success(`"${assignment.title}" deleted successfully.`);
            fetchAssignments();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete assignment.';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    return(
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">Create assignment</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Register an assignment</DialogTitle>
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
                                        Creating
                                        <LoaderIcon className="animate-spin"/>
                                    </>
                                    ) : (
                                    <>
                                        Post assignment
                                        <SendHorizonalIcon />
                                    </>
                                    )
                                }
                            </Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>

            {/* Cards List */}
            <div className="mt-6 space-y-3">
                {assignmentLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading assignments…</span>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <ClipboardListIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">No assignments yet. Create one above.</p>
                    </div>
                ) : (
                    assignments.map(assignment => (
                        <div
                            key={assignment._id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            {/* Left: Info */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <p className="font-semibold text-foreground truncate">{assignment.title}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 font-medium">
                                        <BookOpenIcon className="h-3 w-3" />
                                        {assignment.unit?.unitCode}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 font-medium">
                                        <CalendarIcon className="h-3 w-3" />
                                        Due: {new Date(assignment.dueDate).toLocaleString()}
                                    </span>
                                </div>
                                {assignment.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">{assignment.description}</p>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <UpdateAssignment assignment={assignment} refreshAssignment={fetchAssignments}/>
                                <DeleteConfirmDialog
                                    title="Delete Assignment"
                                    description={`Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`}
                                    onConfirm={() => handleDelete(assignment)}
                                    loading={deletingId === assignment._id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    )
};