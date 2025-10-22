// Imports
import React, {useEffect, useState} from "react";
import { toast } from "sonner";
import { courseService } from "@/services/courseApi";
import { useAuth } from "@/contexts/authContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import UpdateCourse from "@/components/updateCourse";

export default function CoursePage() {

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);

    const reset = () => {
        setName('');
        setCode('');
        setDescription('')
    }

    const fetchCourses = async () => {
        setCoursesLoading(true);
        setErrors('');

        try {
            const data = await courseService.getAllCourses();
            setCourses(data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        } finally {
            setCoursesLoading(false)
        }
    }

    useEffect(() => {

        refreshCourses: fetchCourses();
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
            errors.name = 'Course name is required.';
            isValid = false;
        }

        if (!code.trim()) {
            errors.code = 'Course code is required.';
            isValid = false;
        }

        setFormDataError(errors);

        if(!isValid) {
            setLoading(false);
            toast.error('Clear form errors');
            return
        }

        try {
            await courseService.createCourse({ name, code, description});
            toast.success('Course registered successfully');
            fetchCourses();
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
                <h3 className="text-2xl text-center mb-10 underline font-bold">Course Management Page</h3>
                <form onSubmit={handleSubmit} className="p-5 border border-gray-300 dark:border-slate-500 rounded-xl shadow-xl bg-green-100 dark:bg-slate-800">
                    {errors && <p className="text-red-500 mt-1 font-bold text-end">! {errors}</p> }
                    <p>Fill in below:</p>
                    <span className="flex flex-col gap-2 mt-3">
                        <Label htmlFor="courseName" className="font-bold text-lg ">Course Name:</Label>
                        <Input
                            id="courseName"
                            name="name"
                            type="text"
                            value={name}
                            className={`${formDataError.name ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Computer Science"
                        />
                    </span>
                    {formDataError.name && <p className="text-red-500 font-bold mt-1">{formDataError.name}</p>}

                    <span className="flex flex-col gap-2 mt-3">
                        <Label htmlFor="courseCode" className="font-bold text-lg ">Course code:</Label>
                        <Input
                            id="courseCode"
                            name="code"
                            type="text"
                            value={code}
                            className={`${formDataError.code ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                            onChange={(e) => setCode((e.target.value).toUpperCase())}
                            required
                            disabled={loading}
                            placeholder="EB1"
                        />
                    </span>
                    {formDataError.code && <p className="text-red-500 font-bold mt-1">{formDataError.code}</p>}

                    <span className="flex flex-col gap-2 mt-3">
                        <Label htmlFor="courseDescription" className="font-bold text-lg ">Description:</Label>
                        <Textarea
                            id="courseDescription"
                            name="description"
                            type="text"
                            value={description}
                            className='border-black shadow-xl'
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading} 
                            placeholder="Course description (Optional)"
                        />
                    </span>

                    <Button className="mt-10 w-full bg-white dark:bg-slate-300 text-black font-bold text-lg hover:bg-gray-200 hover:translate-y-1 transition-all duration-500" disabled={loading} type="submit">
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <p>Registering </p>
                                <LoaderIcon className="animate-spin"/>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <p>Register course</p>
                                <SendHorizonalIcon />
                            </div>
                        )}
                    </Button>
                </form>
            </div>
            <div className="mt-10 border rounded-xl p-3 shadow-xl bg-white dark:bg-slate-800">
                <Table>
                    <TableCaption>A list of courses registered.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Name</TableHead>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    {coursesLoading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
                                        <p className="text-green-500 font-bold text-md lg:text-xl">Loading courses</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : courses.length > 0 ? (
                        <TableBody>
                            {courses.map(course => (
                                <TableRow key={course._id}>
                                    <TableCell className="font-medium">{course.name}</TableCell>
                                    <TableCell>{course.code}</TableCell>
                                    <TableCell>{course.description || 'n/a'}</TableCell>
                                    <TableCell className="text-right">
                                        <UpdateCourse course={course} refreshCourses={fetchCourses}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    ) : (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <p className="text-red-500 font-bold text-md lg:text-xl">No courses found!</p>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    )}
                </Table>
            </div>
        </div>
    )
}
