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
import { LoaderIcon, SendHorizonalIcon, Trash2Icon, CalendarClockIcon, ClockIcon, MapPinIcon } from "lucide-react";
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
import UpdateUnit from "@/components/updateUnits";
import { lecturerService } from "@/services/lecturerApi";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";

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
    const [deletingId, setDeletingId] = useState(null);

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

    const handleDelete = async (unit) => {
        setDeletingId(unit._id);
        try {
            await unitScheduleService.deleteSchedule(unit._id);
            toast.success(`"${unit.unitCode} – ${unit.unitName}" deleted successfully.`);
            fetchUnitSchedules();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete unit schedule.';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {

        fetchUnitSchedules();
        fetchLecturers();
    }, []);

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">Create Unit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Register a unit</DialogTitle>
                        <DialogDescription>* All fields are required</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="unitname">Unit Name</Label>
                                <Input
                                    id="unitname"
                                    name="unitName"
                                    type="text"
                                    value={unitName}
                                    onChange={(e) => setUnitName(e.target.value)}
                                    className={`mt-1.5 ${formDataError.unitName ? 'border-destructive' : ''}`}
                                    disabled={loading}
                                    required
                                    placeholder="Education"
                                />
                                {formDataError.unitName && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.unitName}</p>}
                            </div>

                            <div>
                                <Label htmlFor="unitcode">Unit Code</Label>
                                <Input
                                    id="unitcode"
                                    name="unitCode"
                                    type="text"
                                    value={unitCode}
                                    onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                                    className={`mt-1.5 ${formDataError.unitCode ? 'border-destructive' : ''}`}
                                    disabled={loading}
                                    required
                                    placeholder="cosc 111"
                                />
                                {formDataError.unitCode && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.unitCode}</p>}
                            </div>

                            <div>
                                <Label htmlFor="lecturer">Lecturer</Label>
                                <Select
                                    onValueChange={(value) => setSelectedLecturer(value)}
                                    id="lecturer"
                                    value={selectedLecturer}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
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
                                {formDataError.selectedLecturer && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.selectedLecturer}</p>}
                            </div>

                            <div>
                                <Label htmlFor="venue">Venue</Label>
                                <Input
                                    id="venue"
                                    name="venue"
                                    type="text"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    className={`mt-1.5 ${formDataError.venue ? 'border-destructive' : ''}`}
                                    disabled={loading}
                                    required
                                    placeholder="srpb01"
                                />
                                {formDataError.venue && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.venue}</p>}
                            </div>

                            <div>
                                <Label htmlFor="dayofweek">Day of week</Label>
                                <Select
                                    id="dayofweek"
                                    value={dayOfWeek}
                                    onValueChange={(value) => setDayOfWeek(value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
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
                                {formDataError.dayOfWeek && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.dayOfWeek}</p>}
                            </div>

                            <div>
                                <Label htmlFor="start-time">Start Time</Label>
                                <Select
                                    id="start-time"
                                    value={startTime}
                                    onValueChange={(value) => setStartTime(value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
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
                                {formDataError.startTime && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.startTime}</p>}
                            </div>

                            <div>
                                <Label htmlFor="end-time">End Time</Label>
                                <Select
                                    id="end-time"
                                    value={endTime}
                                    onValueChange={(value) => setEndTime(value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
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
                                {formDataError.endTime && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.endTime}</p>}
                            </div>

                            <div>
                                <Label htmlFor="cohort">Cohort</Label>
                                <Select
                                    id="cohort"
                                    value={cohort}
                                    onValueChange={(value) => setCohort(value)}
                                    required
                                    defaultValue={user.cohort._id}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full mt-1.5">
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
                                {formDataError.cohort && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.cohort}</p>}
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
                                        Create unit
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
                {loadingUnits ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading units…</span>
                    </div>
                ) : units.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <CalendarClockIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">No units yet. Create one above.</p>
                    </div>
                ) : (
                    units.map(unit => (
                        <div
                            key={unit._id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            {/* Left: Info */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 text-xs font-bold tracking-wide">
                                        {unit.unitCode}
                                    </span>
                                    <p className="font-semibold text-foreground truncate">{unit.unitName}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <ClockIcon className="h-3 w-3" />
                                        {unit.dayOfWeek} · {unit.startTime} – {unit.endTime}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <MapPinIcon className="h-3 w-3" />
                                        {unit.venue}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <UpdateUnit unit={unit} refreshUnits={fetchUnitSchedules} lecturers={lecturers.currentSemester}/>
                                <DeleteConfirmDialog
                                    title="Delete Unit Schedule"
                                    description={`Are you sure you want to delete "${unit.unitCode} – ${unit.unitName}"? This action cannot be undone.`}
                                    onConfirm={() => handleDelete(unit)}
                                    loading={deletingId === unit._id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}