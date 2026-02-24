// Imports
import React, { useEffect, useState } from "react";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/authContext";
import { LoaderIcon, SendHorizonalIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import UpdateUnit from "@/components/updateUnits";
import { lecturerService } from "@/services/lecturerApi";

export default function ManageUnitSchedule() {

    const [unitName, setUnitName] = useState('');
    const [unitCode, setUnitCode] = useState('');
    const [lecturers, setLecturers] = useState({ currentSemester: []})
    const [selectedLecturer, setSelectedLecturer] = useState('');
    const [venue, setVenue] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [cohort, setCohort] = useState('');
    const [formDataError, setFormDataError] = useState('');
    const [units, setUnits] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingUnits, setLoadingUnits] = useState(false);

    const { user } = useAuth();

    const resetForm = () => {
        setUnitName('');
        setUnitCode('');
        setSelectedLecturer('');
        setVenue('');
        setDayOfWeek('');
        setStartTime('');
        setEndTime('');
        setCohort('');
        setFormDataError('');
    };

    const fetchLecturers = async () => {
        try {
            const lecturersData = await lecturerService.getLecturersByCohort(user?.cohort?._id);
            setLecturers(lecturersData);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to fetch lecturers";
            console.error(message);
        }
    }

    const fetchUnitSchedules = async () => {
        setLoadingUnits(true);

        try {
            const data = await unitScheduleService.getMyShedule();
            setUnits(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            setError(errorMessage);
            toast.error(errorMessage)
            return { success: false };
        } finally {
            setLoadingUnits(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError(null);
        setError(null);

        let errors = {};
        let isValid = true;

        if (!unitName.trim()) {
            errors.unitName = 'Unit Name is required.'
            isValid = false;
        }

        if (!unitCode.trim()) {
            errors.unitCode = 'Unit Code is required.'
            isValid = false;
        }

        if (!selectedLecturer.trim()) {
            errors.selectedLecturer = 'Lecturer name is required.'
            isValid = false;
        }

        if (!venue.trim()) {
            errors.venue = 'Venue is required.'
            isValid = false;
        }

        if (!dayOfWeek.trim()) {
            errors.dayOfWeek = 'Day of the week is required.'
            isValid = false;
        }

        if (!startTime.trim()) {
            errors.startTime = 'Start-time is required.'
            isValid = false;
        }

        if (!endTime.trim()) {
            errors.endTime = 'End-time is required.'
            isValid = false;
        }

        if (!cohort.trim()) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        setFormDataError(errors)

        if (!isValid) {
            setLoading(false);
            return;
        }

        const payload = {
            unitName, unitCode, lecturer: selectedLecturer, venue, dayOfWeek, startTime, endTime, cohort
        }

        try {
            await unitScheduleService.createSchedule(payload);
            toast.success(`Unit registered successfully`);
            fetchUnitSchedules();
            resetForm();
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            setError(errorMessage);
            toast.error(errorMessage)
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        fetchUnitSchedules();
        fetchLecturers();
    }, []);

    return (
        <div>
            <Dialog>
                <DialogTrigger className="rounded-xl shadow-xl p-1 mt-10 bg-blue-300 dark:bg-slate-800 text-white cursor-pointer hover:shadow-blue-200 transition-all duration-400 text-black">Create Unit</DialogTrigger>
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Register a unit</DialogTitle>
                        <DialogDescription className="text-red-500">* All fields are required</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <span>
                            <Label htmlFor="unitname" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Unit Name:</Label>
                            <Input
                                id="unitname"
                                name="unitName"
                                type="text"
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                className={`border ${formDataError.unitName ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                disabled={loading}
                                required
                                placeholder="Education"
                            />
                        </span>
                        {formDataError.unitName && <p className="mt-1 font-bold text-red-600">{formDataError.unitName}</p>}

                        <span>
                            <Label htmlFor="unitcode" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Unit Code:</Label>
                            <Input
                                id="unitcode"
                                name="unitCode"
                                type="text"
                                value={unitCode}
                                onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                                className={`border ${formDataError.unitCode ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                disabled={loading}
                                required
                                placeholder="cosc 111"
                            />
                        </span>
                        {formDataError.unitCode && <p className="mt-1 font-bold text-red-600">{formDataError.unitCode}</p>}

                        <span>
                            <Label htmlFor="lecturer" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Lecturer:</Label>
                            <Select
                                onValueChange={(value) => setSelectedLecturer(value)}
                                id="lecturer"
                                value={selectedLecturer}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select lecturer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lecturers.currentSemester.map(lecturer => (
                                        <SelectItem value={lecturer._id} key={lecturer._id}>
                                            {lecturer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </span>
                        {formDataError.selectedLecturer && <p className="mt-1 font-bold text-red-600">{formDataError.selectedLecturer}</p>}

                        <span>
                            <Label htmlFor="venue" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Venue:</Label>
                            <Input
                                id="venue"
                                name="venue"
                                type="text"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                className={`border ${formDataError.venue ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                disabled={loading}
                                required
                                placeholder="srpb01"
                            />
                        </span>
                        {formDataError.venue && <p className="mt-1 font-bold text-red-600">{formDataError.venue}</p>}

                        <span>
                            <Label htmlFor="dayofweek" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Day of week:</Label>
                            <Select
                                id="dayofweek"
                                value={dayOfWeek}
                                onValueChange={(value) => setDayOfWeek(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select day" />
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
                        {formDataError.dayOfWeek && <p className="mt-1 font-bold text-red-600">{formDataError.dayOfWeek}</p>}

                        <span>
                            <Label htmlFor="start-time" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Start Time:</Label>
                            <Select
                                id="start-time"
                                value={startTime}
                                onValueChange={(value) => setStartTime(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="07:00">07:00 a.m</SelectItem>
                                        <SelectItem value="10:00">10:00 a.m</SelectItem>
                                        <SelectItem value="13:00">01:00 p.m</SelectItem>
                                        <SelectItem value="16:00">04:00 p.m</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </span>
                        {formDataError.startTime && <p className="mt-1 font-bold text-red-600">{formDataError.startTime}</p>}

                        <span>
                            <Label htmlFor="end-time" className="text-lg md:text-2xl lg:text-2xl text-blue-600">End Time:</Label>
                            <Select
                                id="end-time"
                                value={endTime}
                                onValueChange={(value) => setEndTime(value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="10:00">10:00 a.m</SelectItem>
                                        <SelectItem value="13:00">01:00 p.m</SelectItem>
                                        <SelectItem value="16:00">04:00 p.m</SelectItem>
                                        <SelectItem value="19:00">07:00 p.m</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </span>
                        {formDataError.endTime && <p className="mt-1 font-bold text-red-600">{formDataError.endTime}</p>}

                        <span>
                            <Label htmlFor="cohort" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Cohort:</Label>
                            <Select
                                id="cohort"
                                value={cohort}
                                onValueChange={(value) => setCohort(value)}
                                required
                                defaultValue={user.cohort._id}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select your group/cohort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                            {user.cohort.name}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </span>
                        {formDataError.cohort && <p className="mt-1 font-bold text-red-600">{formDataError.cohort}</p>}

                        <Button className="bg-white text-black font-bold shadow-md hover:shadow-green-500 hover:shadow-xl hover:bg-white border md:text-lg lg:text-xl hover:-translate-y-1 transform easeinout duration-500 mt-5 w-full" disabled={loading} type="submit">
                            { loading ? (
                                <div className="flex gap-3 items-center">
                                    Creating
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Create unit
                                    <SendHorizonalIcon />
                                </div> 
                                ) 
                            }
                        </Button>
                    </form>

                    <DialogFooter className="sm:justify-start">
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="border rounded-xl p-5 mt-10 bg-blue-100 dark:bg-slate-800">
                <Table>
                    <TableCaption>Unit management.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">UnitCode</TableHead>
                            <TableHead>UnitName</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Venue</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    {loadingUnits ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">Loading unit details</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <TableBody>
                            {units.map(unit => (
                                <TableRow key={unit._id}>
                                    <TableCell className="font-medium">{unit.unitName}</TableCell>
                                    <TableCell>{unit.unitCode}</TableCell>
                                    <TableCell>{unit.dayOfWeek} : {unit.startTime} - {unit.endTime}</TableCell>
                                    <TableCell className="">{unit.venue}</TableCell>
                                    <TableCell className="text-right">
                                        <UpdateUnit unit={unit} refreshUnits={fetchUnitSchedules} lecturers={lecturers.currentSemester}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}

                </Table>
            </div>
        </div>
    )
}