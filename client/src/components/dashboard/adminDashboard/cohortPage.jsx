// Imports
import React, {useEffect, useState} from "react";
import { toast } from "sonner";
import { courseService } from "@/services/courseApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoaderIcon, SendHorizonalIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import UpdateCohort from "@/components/updateCohort";
import { cohortService } from "@/services/cohortApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CohortPage() {

    const [course, setCourse] = useState('');
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [cohortsLoading, setCohortsLoading] = useState(false);

    const reset = () => {
        setName('');
        setYear('');
        setCourse('');
    }

    const fetchCohorts = async () => {
        setCohortsLoading(true);
        setErrors('');

        try {
            const data = await cohortService.getAllCohorts();
            setCohorts(data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        } finally {
            setCohortsLoading(false)
        }
    }

    const fetchCourses = async () => {

        try {
            const data = await courseService.getAllCourses();
            setCourses(data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        }
    }

    useEffect(() => {

        refreshCohorts: fetchCohorts();
        fetchCourses();
    }, []);

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

        if (!year.trim()) {
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

        try {
            await cohortService.createCohort({ name, year, course});
            toast.success('Course registered successfully');
            fetchCohorts();
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

    return (
        <div>
            <div>
                <h3 className="text-2xl text-center mb-10 underline font-bold">Cohort Management Page</h3>
                <form onSubmit={handleSubmit} className="p-5 border border-gray-300 dark:bg-slate-800 dark:border-slate-500 rounded-xl shadow-xl bg-green-100">
                    {errors && <p className="text-red-500 mt-1 font-bold text-end">! {errors}</p> }
                    <p>Fill in below:</p>
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
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.name} - 
                                        ({course.code}) 
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </span>
                    {formDataError.course && <p className="text-red-500 font-bold mt-1">{formDataError.course}</p>}

                    <Button className="mt-10 w-full bg-white dark:bg-slate-300 text-black font-bold text-lg hover:bg-gray-200 hover:translate-y-1 transition-all duration-500" disabled={loading} type="submit">
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <p>Registering </p>
                                <LoaderIcon className="animate-spin"/>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <p>Register cohort</p>
                                <SendHorizonalIcon />
                            </div>
                        )}
                    </Button>
                </form>
            </div>

            <div className="mt-10 border rounded-xl p-3 shadow-xl bg-white dark:bg-slate-800">
               <Table>
                    <TableCaption>A list of cohorts registered.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Name</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    {cohortsLoading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">Loading cohorts</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : cohorts.length > 0 ? (
                        <TableBody>
                            {cohorts.map(cohort => (
                                <TableRow key={cohort._id}>
                                    <TableCell className="font-medium">{cohort.name}</TableCell>
                                    <TableCell>{cohort.year}</TableCell>
                                    <TableCell>{cohort.course.name}</TableCell>
                                    <TableCell className="text-right">
                                        <UpdateCohort courses={courses} cohort={cohort} refreshCohorts={fetchCohorts}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    ) : (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <p className="text-red-500 font-bold text-md lg:text-xl">No cohorts found!</p>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    )}
                </Table> 
            </div>
        </div>
    )
}