// Imports
import React, {useState, useEffect} from "react";
import { SendHorizonalIcon, LoaderIcon, Trash2Icon, NotebookPenIcon, CalendarIcon, BookOpenIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/authContext";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { toast } from "sonner";
import { catService } from "@/services/catApi";
import UpdateCat from "@/components/updateCAT";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";

export default function ManageCat() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cohort, setCohort] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState([]);
    const [type, setType] = useState('');
    const [submissionDate, setSubmissionDate] = useState('');
    const [submissionFormat, setSubmissionFormat] = useState('');
    const [sittingDate, setSittingDate] = useState('');
    const [sittingDay, setSittingDay] = useState('');
    const [sittingTime, setSittingTime] = useState('');
    const [venue, setVenue] = useState('');
    const [requiredItems, setRequiredItems] = useState(''); // keep as string, convert on submit
    const [isPublished, setIsPublished] = useState(false);
    const [catNumber, setCatNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [catLoading, setCATLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [CATS, setCATS] = useState([])
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

    const fetchCATS = async () => {
        setCATLoading(true);
        try {
            const data = await catService.getCATsForCohort();
            setCATS(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured.'
            setErrors(errorMessage);
            return false;
        } finally {
            setCATLoading(false);
        }
    }

    useEffect(() => {
        if (user?.cohort?._id) setCohort(user.cohort._id);
        fetchUnitSchedules();
        fetchCATS();
    }, [user]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedUnit('');
        setType('');
        setSubmissionDate('');
        setSubmissionFormat('');
        setSittingDate('');
        setSittingDay('');
        setSittingTime('');
        setVenue('');
        setRequiredItems('');
        setCatNumber('');
        setIsPublished(false);
        setFormDataError({});
        setErrors(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError({});
        setErrors(null);

        let isValid = true;
        let errors = {};

        // common validations
        if (!title.trim()) {
            errors.title = 'Title is required.'
            isValid = false;
        }

        if (!selectedUnit.trim()) {
            errors.selectedUnit = 'Unit is required.'
            isValid = false;
        }

        if (!cohort || !cohort.trim()) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        if (!type || !type.trim()) {
            errors.type = 'CAT type is required.'
            isValid = false;
        }

        if (!catNumber || !catNumber.trim()) {
            errors.catNumber = 'CAT number is required.'
            isValid = false;
        }

        // conditional validations
        if (type === 'takeaway') {
            if (!submissionDate) {
                errors.submissionDate = 'Submission date is required for takeaway.';
                isValid = false;
            }
            if (!submissionFormat.trim()) {
                errors.submissionFormat = 'Submission format is required for takeaway.';
                isValid = false;
            }
        } else if (type === 'sitting') {
            if (!sittingDate) {
                errors.sittingDate = 'Sitting date is required for sitting CAT.';
                isValid = false;
            }
            if (!sittingDay) {
                errors.sittingDay = 'Sitting day is required for sitting CAT.';
                isValid = false;
            }
            if (!sittingTime) {
                errors.sittingTime = 'Sitting time is required for sitting CAT.';
                isValid = false;
            }
            if (!venue.trim()) {
                errors.venue = 'Venue is required for sitting CAT.';
                isValid = false;
            }
            if (!requiredItems.trim()) {
                errors.requiredItems = 'Required items are needed for sitting CAT.';
                isValid = false;
            }
        }

        setFormDataError(errors);

        if (!isValid) {
            setLoading(false);
            return;
        }

        // convert dates to ISO only if provided
        const submissionIsoDate = submissionDate ? new Date(submissionDate).toISOString() : undefined;
        const sittingIsoDate = sittingDate ? new Date(sittingDate).toISOString() : undefined;

        // convert requiredItems string -> array by comma
        const requiredItemsArray = requiredItems
            ? requiredItems.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const payload = {
            title,
            description,
            unit: selectedUnit,
            cohort,
            type,
            submissionDate: submissionIsoDate,
            submissionFormat,
            sittingDate: sittingIsoDate,
            sittingDay,
            sittingTime,
            venue,
            requiredItems: requiredItemsArray,
            isPublished,
            catNumber
        }

        try {
            await catService.createCAT(payload);
            await fetchCATS();
            resetForm();
            toast.success('CAT posted successfully!')
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            toast.error(errorMessage)
            setErrors(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (cat) => {
        setDeletingId(cat._id);
        try {
            await catService.deleteCAT(cat._id);
            toast.success(`"${cat.title}" deleted successfully.`);
            fetchCATS();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete CAT.';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    return(
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">Create CAT</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Register a CAT</DialogTitle>
                        <DialogDescription>
                            * Fields marked required depend on CAT type.
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
                                    placeholder="e.g Operating System"
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
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    id="type"
                                    value={type}
                                    onValueChange={(value) => setType(value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select CAT type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="takeaway">Take-away CAT</SelectItem>
                                            <SelectItem value="sitting">Sitting CAT</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {formDataError.type && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.type}</p>}
                            </div>

                            <div>
                                <Label htmlFor="catNumber">Cat Number</Label>
                                <Select
                                    id="catNumber"
                                    value={catNumber}
                                    onValueChange={(value) => setCatNumber(value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select CAT Number" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="CAT 1">CAT 1</SelectItem>
                                            <SelectItem value="CAT 2">CAT 2</SelectItem>
                                            <SelectItem value="CAT 3">CAT 3</SelectItem>
                                            <SelectItem value="CAT 4">CAT 4</SelectItem>
                                            <SelectItem value="CAT 5">CAT 5</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {formDataError.catNumber && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.catNumber}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={description}
                                    type="text"
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1.5"
                                    placeholder="Description (Optional)"
                                    disabled={loading}
                                />
                            </div>

                            {/* Conditional fields */}
                            {type === 'takeaway' && (
                                <>
                                    <div>
                                        <Label htmlFor="submissionDate">Submission Date</Label>
                                        <Input
                                            id="submissionDate"
                                            name="submissionDate"
                                            value={submissionDate}
                                            type="datetime-local"
                                            onChange={(e) => setSubmissionDate(e.target.value)}
                                            className={`mt-1.5 ${formDataError.submissionDate ? 'border-destructive' : ''}`}
                                            placeholder="Enter date"
                                            disabled={loading}
                                        />
                                        {formDataError.submissionDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.submissionDate}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="submissionFormat">Submission Format</Label>
                                        <Input
                                            id="submissionFormat"
                                            name="submissionFormat"
                                            value={submissionFormat}
                                            type="text"
                                            onChange={(e) => setSubmissionFormat(e.target.value)}
                                            className={`mt-1.5 ${formDataError.submissionFormat ? 'border-destructive' : ''}`}
                                            placeholder="e.g Email / Handwritten / Typed"
                                            disabled={loading}
                                        />
                                        {formDataError.submissionFormat && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.submissionFormat}</p>}
                                    </div>
                                </>
                            )}

                            {type === 'sitting' && (
                                <>
                                    <div>
                                        <Label htmlFor="sittingDate">Sitting Date</Label>
                                        <Input
                                            id="sittingDate"
                                            name="sittingDate"
                                            value={sittingDate}
                                            type="datetime-local"
                                            onChange={(e) => setSittingDate(e.target.value)}
                                            className={`mt-1.5 ${formDataError.sittingDate ? 'border-destructive' : ''}`}
                                            placeholder="Enter date"
                                            disabled={loading}
                                        />
                                        {formDataError.sittingDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.sittingDate}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="sittingDay">Sitting Day</Label>
                                        <Select
                                            id="sittingDay"
                                            value={sittingDay}
                                            onValueChange={(value) => setSittingDay(value)}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="w-full mt-1.5">
                                                <SelectValue placeholder="Select Day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Monday">Monday</SelectItem>
                                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                                    <SelectItem value="Friday">Friday</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {formDataError.sittingDay && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.sittingDay}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="sittingTime">Sitting Time</Label>
                                        <Input
                                            id="sittingTime"
                                            name="sittingTime"
                                            value={sittingTime}
                                            type="time"
                                            onChange={(e) => setSittingTime(e.target.value)}
                                            className={`mt-1.5 ${formDataError.sittingTime ? 'border-destructive' : ''}`}
                                            placeholder="Enter starting time"
                                            disabled={loading}
                                        />
                                        {formDataError.sittingTime && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.sittingTime}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="venue">Venue</Label>
                                        <Input
                                            id="venue"
                                            name="venue"
                                            value={venue}
                                            type="text"
                                            onChange={(e) => setVenue(e.target.value)}
                                            className={`mt-1.5 ${formDataError.venue ? 'border-destructive' : ''}`}
                                            placeholder="e.g Hall A"
                                            disabled={loading}
                                        />
                                        {formDataError.venue && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.venue}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="requiredItems">Required Items (comma separated)</Label>
                                        <Input
                                            id="requiredItems"
                                            name="requiredItems"
                                            value={requiredItems}
                                            type="text"
                                            onChange={(e) => setRequiredItems(e.target.value)}
                                            className={`mt-1.5 ${formDataError.requiredItems ? 'border-destructive' : ''}`}
                                            placeholder="Calculator, Fullscaps, ..."
                                            disabled={loading}
                                        />
                                        {formDataError.requiredItems && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.requiredItems}</p>}
                                    </div>
                                </>
                            )}

                            <div className="sm:col-span-2 flex items-center gap-2">
                                <Checkbox
                                    id="isPublished"
                                    checked={isPublished}
                                    onCheckedChange={(checked) => setIsPublished(!!checked)}
                                    disabled={loading}
                                />
                                <Label htmlFor="isPublished">Publish CAT</Label>
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
                                        Post CAT
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
                {catLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading CATs…</span>
                    </div>
                ) : CATS.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <NotebookPenIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">No CATs yet. Create one above.</p>
                    </div>
                ) : (
                    CATS.map(cat => (
                        <div
                            key={cat._id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            {/* Left: Info */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-foreground truncate">{cat.title}</p>
                                    <span className="text-xs font-medium text-muted-foreground">{cat.catNumber}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 font-medium">
                                        <BookOpenIcon className="h-3 w-3" />
                                        {cat.unit?.unitCode}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 font-medium capitalize">
                                        {cat.type}
                                    </span>
                                    {cat.type === 'takeaway' && cat.submissionDate && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 font-medium">
                                            <CalendarIcon className="h-3 w-3" />
                                            Submit: {new Date(cat.submissionDate).toLocaleString()}
                                        </span>
                                    )}
                                    {cat.type === 'sitting' && cat.sittingDate && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 font-medium">
                                            <CalendarIcon className="h-3 w-3" />
                                            Sits: {new Date(cat.sittingDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    <Badge className={cat.isPublished
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}
                                    >
                                        {cat.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <UpdateCat cat={cat} refreshCats={fetchCATS}/>
                                <DeleteConfirmDialog
                                    title="Delete CAT"
                                    description={`Are you sure you want to delete "${cat.title}"? This action cannot be undone.`}
                                    onConfirm={() => handleDelete(cat)}
                                    loading={deletingId === cat._id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    )
};