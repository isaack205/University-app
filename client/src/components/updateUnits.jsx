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

export default function UpdateUnit({ unit, refreshUnits }) { // Unit as props

    const [unitName, setUnitName] = useState(unit?.unitName || '');
    const [unitCode, setUnitCode] = useState(unit?.unitCode || '');
    const [lecturer, setLecturer] = useState(unit?.lecturer || '');
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

        if (!lecturer.trim()) {
            errors.lecturer = 'Lecturer name is required.'
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
            _id: unit?._id, unitName, unitCode, lecturer, venue, dayOfWeek, startTime, endTime, cohort
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
                <DialogTrigger className="">
                    <SquarePenIcon className="text-green-500 cursor-pointer hover:-translate-y-1 transition-all duration-500 "/>
                </DialogTrigger>
                <DialogContent className="bg-gray-300">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Update unit</DialogTitle>
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
                            <Input
                                id="lecturer"
                                name="lecturer"
                                type="text"
                                value={lecturer}
                                onChange={(e) => setLecturer(e.target.value)}
                                className={`border ${formDataError.lecturer ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                disabled={loading}
                                required
                                placeholder="John doe"
                            />
                        </span>
                        {formDataError.lecturer && <p className="mt-1 font-bold text-red-600">{formDataError.lecturer}</p>}

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
                                onValueChange={(value) => setCohort(value)}
                                required
                                disabled={loading}
                                defaultValue={user.cohort._id}
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
                                    Saving
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Save changes
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
        </div>
    )
}