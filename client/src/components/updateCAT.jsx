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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { catService } from "@/services/catApi";
import MarkdownEditor from "@/components/common/markdownEditor";

export default function UpdateCat({ cat, refreshCats }) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState([]);
    const [type, setType] = useState('');
    const [submissionDate, setSubmissionDate] = useState('');
    const [submissionFormat, setSubmissionFormat] = useState('');
    const [sittingDate, setSittingDate] = useState('');
    const [sittingTime, setSittingTime] = useState('');
    const [venue, setVenue] = useState('');
    const [requiredItems, setRequiredItems] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [catNumber, setCatNumber] = useState('');
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
        if (!isoString) return "";
        const date = new Date(isoString);
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 10); // Date only YYYY-MM-DD
        return local;
    }

    function formatDateTimeForInput(isoString) {
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
            setType(cat?.type || '');
            setSubmissionDate(formatDateTimeForInput(cat?.submissionDate) || '');
            setSubmissionFormat(cat?.submissionFormat || '');
            setSittingDate(formatDateForInput(cat?.sittingDate) || '');
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

        if (!type || !type.trim()) {
            errors.type = 'CAT type is required.'
            isValid = false;
        }

        if (!catNumber || !catNumber.trim()) {
            errors.catNumber = 'CAT number is required.'
            isValid = false;
        }

        // Auto calculate sittingDay from sittingDate
        let calculatedSittingDay = '';
        if (sittingDate) {
            calculatedSittingDay = new Date(sittingDate).toLocaleDateString('en-US', { weekday: 'long' });
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

        const cohortId = user?.cohort?._id || user?.cohort;

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
            cohort: cohortId,
            type,
            submissionDate: submissionIsoDate,
            submissionFormat,
            sittingDate: sittingIsoDate,
            sittingDay: calculatedSittingDay,
            sittingTime,
            venue,
            requiredItems: requiredItemsArray,
            isPublished,
            catNumber
        }

        try {
            await catService.updateCAT(payload, payload._id);
            toast.success('CAT updated successfully! ✏️')
            setIsDialogOpen(false);
            refreshCats();
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
                    <Button variant="ghost" size="icon" aria-label="Edit CAT">
                        <SquarePenIcon className="h-4 w-4 text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update CAT</DialogTitle>
                        <DialogDescription>Modify CAT details and schedule.</DialogDescription>
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
                                    placeholder="e.g. Operating Systems CAT 1"
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
                                <Label htmlFor="catNumber">CAT Number</Label>
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
                                <Label htmlFor="type">CAT Type</Label>
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

                            <div className="sm:col-span-2">
                                <MarkdownEditor
                                    id="edit-cat-description"
                                    label="Description (Optional)"
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="General instructions, topics covered, or guidelines..."
                                    disabled={loading}
                                    rows={4}
                                />
                            </div>

                            {/* Conditional fields */}
                            {type === 'takeaway' && (
                                <>
                                    <div>
                                        <Label htmlFor="submissionDate">Submission Date & Time</Label>
                                        <Input
                                            id="submissionDate"
                                            name="submissionDate"
                                            value={submissionDate}
                                            type="datetime-local"
                                            onChange={(e) => setSubmissionDate(e.target.value)}
                                            className={`mt-1.5 ${formDataError.submissionDate ? 'border-destructive' : ''}`}
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
                                            placeholder="e.g. Email / Printed PDF"
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
                                            type="date"
                                            onChange={(e) => setSittingDate(e.target.value)}
                                            className={`mt-1.5 ${formDataError.sittingDate ? 'border-destructive' : ''}`}
                                            disabled={loading}
                                        />
                                        {sittingDate && (
                                            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                                📅 Day: {new Date(sittingDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </p>
                                        )}
                                        {formDataError.sittingDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.sittingDate}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="sittingTime">Start Time</Label>
                                        <Input
                                            id="sittingTime"
                                            name="sittingTime"
                                            value={sittingTime}
                                            type="time"
                                            onChange={(e) => setSittingTime(e.target.value)}
                                            className={`mt-1.5 ${formDataError.sittingTime ? 'border-destructive' : ''}`}
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
                                            placeholder="e.g. Hall A"
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
                                            placeholder="Calculator, Fullscaps..."
                                            disabled={loading}
                                        />
                                        {formDataError.requiredItems && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.requiredItems}</p>}
                                    </div>
                                </>
                            )}

                            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                                <Checkbox
                                    id="isPublished"
                                    checked={isPublished}
                                    onCheckedChange={(checked) => setIsPublished(!!checked)}
                                    disabled={loading}
                                />
                                <Label htmlFor="isPublished" className="cursor-pointer font-medium">Published to students</Label>
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