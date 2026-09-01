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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { catService } from "@/services/catApi";

export default function UpdateCat({ cat, refreshCats }) {

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
        if (!isoString) return "";

        const date = new Date(isoString);

        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);

        return local;
    }

    useEffect(() => {

        if (cat) {
            setTitle(cat?.title || '');
            setDescription(cat?.description || '');
            setSelectedUnit(cat?.unit?._id || cat?.unit || '');
            setCohort(cat?.cohort?._id || cat?.cohort || '');
            setType(cat?.type || '');
            setSubmissionDate(formatDateForInput(cat?.submissionDate) || '');
            setSubmissionFormat(cat?.submissionFormat || '');
            setSittingDate(formatDateForInput(cat?.sittingDate) || '');
            setSittingDay(cat?.sittingDay || '');
            setSittingTime(cat?.sittingTime || '');
            setVenue(cat?.venue || '');
            setRequiredItems(cat?.requiredItems?.join(", ") || "");
            setIsPublished(!!cat?.isPublished);
            setCatNumber(cat?.catNumber || '')
        }

        fetchUnitSchedules();
    }, [cat]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setFormDataError(null);
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
            _id: cat?._id,
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
            await catService.updateCAT(payload, payload._id);
            refreshCats();
            toast.success('CAT updated successfully!')
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
                    <Button variant="ghost" size="icon" aria-label="Edit CAT">
                        <SquarePenIcon className="text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update CAT</DialogTitle>
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