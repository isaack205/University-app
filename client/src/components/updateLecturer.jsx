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
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { lecturerService } from "@/services/lecturerApi";
import { Textarea } from "./ui/textarea";

export default function UpdateLecturer({ lecturer, refreshLecturers }) {

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [cohort, setCohort] = useState('');
    const [loading, setLoading] = useState(false);
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);

    const { user } = useAuth();

    useEffect(() => {

        if (lecturer) {
            setName(lecturer?.name || '');
            setPhoneNumber(lecturer?.phoneNumber || '');
            setEmail(lecturer?.email || '');
            setCohort(lecturer?.cohort?._id || lecturer?.cohort || '');
        }

    }, [lecturer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setFormDataError(null);
        setErrors(null);

        let isValid = true;
        let errors = {};

        if (!name.trim()) {
            errors.name = 'Name is required.'
            isValid = false;
        }

        // if (!phoneNumber.trim()) {
        //     errors.phoneNumber = 'PhoneNumber is required.'
        //     isValid = false;
        // } else {
        //     const phoneRegex = /^\+254(7\d{8}|1\d{8})$/;
        //     if (!phoneRegex.test(phoneNumber.trim())) {
        //         errors.phoneNumber = 'Phone number must be in +2547XXXXXXXX or +2541XXXXXXXX format.'
        //         isValid = false;
        //     }
        // }

        // if (!email.trim()) {
        //     errors.email = 'Email is required.'
        //     isValid = false;
        // } else if (!/\S+@\S+\.\S+/.test(email)) {
        //     errors.email = 'Invalid email format.';
        //     isValid = false;
        // }

        if (!cohort.trim()) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        setFormDataError(errors);
        
        if (!isValid) {
            setLoading(false);
            return;
        }

        const payload = {
            _id: lecturer?._id, name, phoneNumber, email, cohort
        }

        try {
            await lecturerService.updateLecturer(payload._id, payload);
            refreshLecturers();
            toast.success('Lecturer details updated successfully!')
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
                        <DialogTitle className="text-2xl font-bold text-green-500 text-center ">Update Lecturer Info</DialogTitle>
                        <DialogDescription className="text-red-500">
                            * All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-red-600 text-right">{errors}</p>}

                    <form onSubmit={handleSubmit}>
                        <span>
                            <Label htmlFor="name" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Name</Label>
                            <Input 
                                id="name"
                                name="name"
                                value={name}
                                type="text"
                                onChange={(e) => setName(e.target.value)}
                                className={`border ${formDataError.name ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="Dr. John Doe"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.name && <p className="mt-1 font-bold text-red-600">{formDataError.name}</p>}

                        <span>
                            <Label htmlFor="phoneNumber" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Phone Number</Label>
                            <Input 
                                id="phoneNumber"
                                name="phoneNumber"
                                value={phoneNumber}
                                type="text"
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={`border ${formDataError.phoneNumber ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="+254123456789"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.phoneNumber && <p className="mt-1 font-bold text-red-600">{formDataError.phoneNumber}</p>}

                        <span>
                            <Label htmlFor="email" className="text-lg md:text-2xl lg:text-2xl text-blue-600">E-mail</Label>
                            <Input 
                                id="email"
                                name="email"
                                value={email}
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                className={`border ${formDataError.email ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="johndoe@example.com"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.email && <p className="mt-1 font-bold text-red-600">{formDataError.dueDemailate}</p>}

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