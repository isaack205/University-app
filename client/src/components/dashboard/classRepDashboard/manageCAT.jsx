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
  SelectGroup
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/authContext";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { toast } from "sonner";
import { catService } from "@/services/catApi";
import UpdateCat from "@/components/updateCAT";

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

    return(
        <div>
            <Dialog>
                <DialogTrigger className="rounded-xl shadow-xl p-1 mt-10 bg-blue-300 cursor-pointer hover:shadow-blue-200 dark:bg-slate-800 text-white transition-all duration-400 text-black">Create CAT</DialogTrigger>
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Register a CAT</DialogTitle>
                        <DialogDescription className="text-red-500">
                            * Fields marked required depend on CAT type.
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
                                    Creating
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Post CAT
                                    <SendHorizonalIcon />
                                </div> 
                                ) 
                            }
                        </Button>
                    </form>

                </DialogContent>
            </Dialog>
            
            <div className="border rounded-xl p-5 mt-10 bg-blue-100 dark:bg-slate-800">
                <Table>
                    <TableCaption>CAT(s) manager.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Title</TableHead>
                            <TableHead>UnitCode</TableHead>
                            <TableHead>Submission Date</TableHead>
                            <TableHead>Sitting Date</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    {catLoading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">Loading CATs data.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        ) : (
                        <TableBody>
                            {CATS.map(cat => (
                                <TableRow key={cat._id}>
                                    <TableCell className="font-medium">{cat.title}</TableCell>
                                    <TableCell>{cat.unit?.unitCode}</TableCell>
                                    <TableCell>{cat.submissionDate ? new Date(cat.type === 'takeaway' && cat.submissionDate).toLocaleString() : null}</TableCell>
                                    <TableCell>{cat.sittingDate ? new Date(cat.type === 'sitting' && cat.sittingDate).toLocaleDateString()  : null}</TableCell>
                                    <TableCell>{cat.isPublished === true ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right">
                                        <UpdateCat cat={cat} refreshCats={fetchCATS}/>
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