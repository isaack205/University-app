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
import { lecturerService } from "@/services/lecturerApi";

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
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Edit lecturer">
                        <SquarePenIcon className="text-green-600"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update Lecturer Info</DialogTitle>
                        <DialogDescription>
                            * All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-destructive text-right">{errors}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={name}
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    className={`mt-1.5 ${formDataError.name ? 'border-destructive' : ''}`}
                                    placeholder="Dr. John Doe"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.name && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={phoneNumber}
                                    type="text"
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className={`mt-1.5 ${formDataError.phoneNumber ? 'border-destructive' : ''}`}
                                    placeholder="+254123456789"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.phoneNumber && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.phoneNumber}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={email}
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`mt-1.5 ${formDataError.email ? 'border-destructive' : ''}`}
                                    placeholder="johndoe@example.com"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.email && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="cohort">Cohort</Label>
                                <Select
                                    onValueChange={value => setCohort(value)}
                                    disabled={loading}
                                    value={cohort}
                                    id="cohort"
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select your cohort:" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                            {user?.cohort.name}
                                        </SelectItem>
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
                                        Save Changes
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