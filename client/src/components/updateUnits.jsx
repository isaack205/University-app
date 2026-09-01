// Imports
import React, { useEffect, useState } from "react";
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
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SendHorizonalIcon, LoaderIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authContext";
import { SquarePenIcon } from "lucide-react";
import { lecturerService } from "@/services/lecturerApi";

export default function UpdateUnit({ unit, refreshUnits, lecturers }) { // Unit as props

    const [unitName, setUnitName] = useState(unit?.unitName || '');
    const [unitCode, setUnitCode] = useState(unit?.unitCode || '');
    const [selectedLecturer, setSelectedLecturer] = useState(unit?.lecturer?._id);
    const [venue, setVenue] = useState(unit?.venue || '');
    const [dayOfWeek, setDayOfWeek] = useState(unit?.dayOfWeek || '');
    const [startTime, setStartTime] = useState(unit?.startTime || '');
    const [endTime, setEndTime] = useState(unit?.endTime || '');
    const [formDataError, setFormDataError] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user }= useAuth();
    const [cohort, setCohort] = useState(user?.cohort || '');

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

        if (!cohort) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        setFormDataError(errors)

        if (!isValid) {
            setLoading(false);
            return;
        }

        const payload = {
            _id: unit?._id, unitName, unitCode, lecturer: selectedLecturer, venue, dayOfWeek, startTime, endTime, cohort
        }

        try {
            await unitScheduleService.updateSchedule(payload._id, payload);
            toast.success(`Unit updated successfully`);
            refreshUnits();
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

    return(
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Edit unit">
                        <SquarePenIcon className="text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update unit</DialogTitle>
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
                                        {lecturers.map(lecturer => (
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
                                    onValueChange={(value) => setCohort(value)}
                                    required
                                    disabled={loading}
                                    defaultValue={user.cohort._id}
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
                                        Saving
                                        <LoaderIcon className="animate-spin"/>
                                    </>
                                    ) : (
                                    <>
                                        Save changes
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