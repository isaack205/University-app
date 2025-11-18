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
                <DialogTrigger>
                    <SquarePenIcon className="text-green-500 cursor-pointer hover:-translate-y-1 transition-all duration-500 "/>
                </DialogTrigger>
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Update CAT</DialogTitle>
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
                                placeholder="e.g Operating System"
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
                            <Label htmlFor="type" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Type: </Label>
                            <Select
                                id="type"
                                value={type}
                                onValueChange={(value) => setType(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select CAT type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="takeaway">Take-away CAT</SelectItem>
                                        <SelectItem value="sitting">Sitting CAT</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </span>
                        {formDataError.type && <p className="mt-1 font-bold text-red-600">{formDataError.type}</p>}

                        <span>
                            <Label htmlFor="catNumber" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Cat Number: </Label>
                            <Select
                                id="catNumber"
                                value={catNumber}
                                onValueChange={(value) => setCatNumber(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
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
                        </span>
                        {formDataError.catNumber && <p className="mt-1 font-bold text-red-600">{formDataError.catNumber}</p>}

                        {/* Conditional fields */}
                        {type === 'takeaway' && (
                            <>
                                <span>
                                    <Label htmlFor="submissionDate" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Submission Date</Label>
                                    <Input 
                                        id="submissionDate"
                                        name="submissionDate"
                                        value={submissionDate}
                                        type="datetime-local"
                                        onChange={(e) => setSubmissionDate(e.target.value)}
                                        className={`border ${formDataError.submissionDate ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                        placeholder="Enter date"
                                        disabled={loading}
                                    />
                                </span>
                                {formDataError.submissionDate && <p className="mt-1 font-bold text-red-600">{formDataError.submissionDate}</p>}

                                <span>
                                    <Label htmlFor="submissionFormat" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Submission Format</Label>
                                    <Input 
                                        id="submissionFormat"
                                        name="submissionFormat"
                                        value={submissionFormat}
                                        type="text"
                                        onChange={(e) => setSubmissionFormat(e.target.value)}
                                        className={`border ${formDataError.submissionFormat ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                        placeholder="e.g Email / Handwritten / Typed"
                                        disabled={loading}
                                    />
                                </span>
                                {formDataError.submissionFormat && <p className="mt-1 font-bold text-red-600">{formDataError.submissionFormat}</p>}
                            </>
                        )}

                        {type === 'sitting' && (
                            <>
                                <span>
                                    <Label htmlFor="sittingDate" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Sitting Date</Label>
                                    <Input 
                                        id="sittingDate"
                                        name="sittingDate"
                                        value={sittingDate}
                                        type="datetime-local"
                                        onChange={(e) => setSittingDate(e.target.value)}
                                        className={`border ${formDataError.sittingDate ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                        placeholder="Enter date"
                                        disabled={loading}
                                    />
                                </span>
                                {formDataError.sittingDate && <p className="mt-1 font-bold text-red-600">{formDataError.sittingDate}</p>}

                                <span>
                                    <Label htmlFor="sittingDay" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Sitting Day: </Label>
                                    <Select
                                        id="sittingDay"
                                        value={sittingDay}
                                        onValueChange={(value) => setSittingDay(value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="w-[180px] w-full">
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
                                </span>
                                {formDataError.sittingDay && <p className="mt-1 font-bold text-red-600">{formDataError.sittingDay}</p>}

                                <span>
                                    <Label htmlFor="sittingTime" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Sitting Time</Label>
                                    <Input 
                                        id="sittingTime"
                                        name="sittingTime"
                                        value={sittingTime}
                                        type="time"
                                        onChange={(e) => setSittingTime(e.target.value)}
                                        className={`border ${formDataError.sittingTime ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                        placeholder="Enter starting time"
                                        disabled={loading}
                                    />
                                </span>
                                {formDataError.sittingTime && <p className="mt-1 font-bold text-red-600">{formDataError.sittingTime}</p>}

                                <span>
                                    <Label htmlFor="venue" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Venue</Label>
                                    <Input 
                                        id="venue"
                                        name="venue"
                                        value={venue}
                                        type="text"
                                        onChange={(e) => setVenue(e.target.value)}
                                        className={`border ${formDataError.venue ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                        placeholder="e.g Hall A"
                                        disabled={loading}
                                    />
                                </span>
                                {formDataError.venue && <p className="mt-1 font-bold text-red-600">{formDataError.venue}</p>}

                                <span>
                                    <Label htmlFor="requiredItems" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Required Items (comma separated)</Label>
                                    <Input 
                                        id="requiredItems"
                                        name="requiredItems"
                                        value={requiredItems}
                                        type="text"
                                        onChange={(e) => setRequiredItems(e.target.value)}
                                        className={`border ${formDataError.requiredItems ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                        placeholder="Calculator, Fullscaps, ..."
                                        disabled={loading}
                                    />
                                </span>
                                {formDataError.requiredItems && <p className="mt-1 font-bold text-red-600">{formDataError.requiredItems}</p>}
                            </>
                        )}

                        <span className="flex items-center gap-2 mt-3">
                            <Label htmlFor="isPublished" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Publish CAT:</Label>
                            <Checkbox 
                                id="isPublished"
                                checked={isPublished}
                                onCheckedChange={(checked) => setIsPublished(!!checked)}
                                disabled={loading}
                                className={'border-black'}
                            />
                        </span>

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