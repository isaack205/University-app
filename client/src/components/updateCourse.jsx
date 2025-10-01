// Imports
import React, {useState, useEffect} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon, SendHorizonalIcon, SquarePenIcon } from "lucide-react";
import { courseService } from "@/services/courseApi";
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

export default function UpdateCourse({ course, refreshCourses}) {

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setName('');
        setCode('');
        setDescription('')
    }

    useEffect(() => {
        
        if (course) {
            setName(course?.name || '');
            setCode(course?.code || '');
            setDescription(course?.description || '');
        }
    }, [course])

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

        const payload = {
            _id:course?._id, name, code, description
        }

        try {
            await courseService.updateCourse(payload._id, payload);
            toast.success('Course updated successfully');
            refreshCourses();
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
            <Dialog>
                <DialogTrigger className="">
                    <SquarePenIcon className="text-green-500 cursor-pointer hover:-translate-y-1 transition-all duration-500 "/>
                </DialogTrigger>
                <DialogContent className="bg-gray-300">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black text-center ">Update Course</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <span className="flex flex-col gap-2">
                            <Label htmlFor="courseName" className="font-bold text-lg">Course Name:</Label>
                            <Input
                                id="courseName"
                                name="name"
                                type="text"
                                value={name}
                                className={`${formDataError.name ? 'border-red-700 shadow-md shadow-red-400' : 'border-green-500 shadow-xl '}`}
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
                                className={`${formDataError.name ? 'border-red-700 shadow-md shadow-red-400' : 'border-green-500 shadow-xl '}`}
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
                                className={`${formDataError.name ? 'border-red-700 shadow-md shadow-red-400' : 'border-green-500 shadow-xl '}`}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading} 
                                placeholder="Course description (Optional)"
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