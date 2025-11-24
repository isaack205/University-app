// Imports
import React, {useEffect, useState} from "react";
import { cohortService } from "@/services/cohortApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon, SendHorizonalIcon, SquarePenIcon } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UpdateCohort({ courses, cohort, refreshCohorts }) {

    const [course, setCourse] = useState('');
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setName('');
        setYear('');
        setCourse('')
    }

    useEffect(() => {
        
        if (cohort) {
            setName(cohort?.name || '');
            setYear(cohort?.year || '');
            setCourse(cohort?.course?._id || cohort?.course || '');
        }
        
    }, [cohort])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors('');
        setFormDataError('');

        let isValid = true;
        let errors = {};

        // Validation
        if (!name.trim()) {
            errors.name = 'Cohort name is required.';
            isValid = false;
        }

        if (!String(year).trim()) {
            errors.year = 'Cohort year is required.';
            isValid = false;
        }

        if (!course.trim()) {
            errors.course = 'Cohort course is required.';
            isValid = false;
        }

        setFormDataError(errors);

        if(!isValid) {
            setLoading(false);
            toast.error('Clear form errors');
            return
        }

        const payload = {
            _id:cohort?._id, name, year, course
        }

        try {
            await cohortService.updateCohort(payload._id, payload);
            toast.success('Course updated successfully');
            refreshCohorts();
            reset();
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            toast.error(errorMessage);
            setErrors(errorMessage);
            return false;
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
                <DialogContent className="bg-gray-300 dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black text-center ">Update Cohort</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <span className="flex flex-col gap-2 mt-3">
                            <Label htmlFor="cohortName" className="font-bold text-lg ">Cohort Name:</Label>
                            <Input
                                id="cohortName"
                                name="name"
                                type="text"
                                value={name}
                                className={`${formDataError.name ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                onChange={(e) => setName((e.target.value).toUpperCase())}
                                required
                                disabled={loading}
                                placeholder="EB1/24"
                            />
                        </span>
                        {formDataError.name && <p className="text-red-500 font-bold mt-1">{formDataError.name}</p>}

                        <span className="flex flex-col gap-2 mt-3">
                            <Label htmlFor="cohortYear" className="font-bold text-lg ">Cohort year:</Label>
                            <Input
                                id="cohortYear"
                                name="year"
                                type="number"
                                value={year}
                                className={`${formDataError.year ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                onChange={(e) => setYear(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="2024"
                                min='2000'
                                max='2050'
                            />
                        </span>
                        {formDataError.year && <p className="text-red-500 font-bold mt-1">{formDataError.year}</p>}

                        <span className="flex flex-col gap-2 mt-3">
                            <Label htmlFor="cohortCourse" className="font-bold text-lg ">Course:</Label>
                            <Select
                                id="cohortCourse"
                                name="course"
                                value={course}
                                required
                                disabled={loading}
                                onValueChange={(value) => setCourse(value)}
                            >
                                <SelectTrigger className="w-[180px] w-full">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course._id} value={course._id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </span>
                        {formDataError.course && <p className="text-red-500 font-bold mt-1">{formDataError.course}</p>}

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

                    <DialogFooter className="">
                        {errors && <p className="text-red-500 mt-1 font-bold">! {errors}</p> }
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}