import React, {useEffect, useState} from "react";
import { useAuth } from "@/contexts/authContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { authService } from "@/services/authApi";
import { LoaderIcon } from "lucide-react";
import { SendHorizonalIcon } from "lucide-react";
import { toast } from "sonner";

export default function UpdateDetails() {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formError, setFormError] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, refreshUser } = useAuth();

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhoneNumber(user.phoneNumber || '');
        }
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError(null);
        setFormError(null);
        setLoading(true);

        let errors = {};
        let isValid = true;

        // Validation logic
        if (!name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        if (!email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Invalid email format.';
            isValid = false;
        }

        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number cannot be empty.'
            isValid = false;
        } else {
            const phoneRegex = /^\+254(7\d{8}|1\d{8})$/;
            if (!phoneRegex.test(phoneNumber.trim())) {
                errors.phoneNumber = 'Phone number must be in +2547XXXXXXXX or +2541XXXXXXXX format.'
                isValid = false;
            }
        }

        setFormError(errors);

        if (!isValid) {
            setLoading(false);
            toast.error('Please correct errors in the form!')
            return
        }

        const payload = {
            name, email, phoneNumber
        }

        try {
            const updates = await authService.updateProfile(payload);
            if (updates) {
                await refreshUser();
                toast.success('Profile updated successfully!')
            } else {
                toast.error('Error updating details.')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error updating details'
            setGeneralError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="flex flex-col items-center justify-center mt-10">
            <form onSubmit={handleSubmit} className="border shadow-xl p-4 rounded-xl flex flex-col max-w-md lg:max-w-lg w-full bg-green-100 dark:bg-slate-800">
                <div className="mb-1">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl text-center font-bold text-green-800">Update user details</h3>
                </div>
                <hr className="mb-2 border-green-300 dark:border-slate-500 rounded-xl border-2"/>
                {generalError && <p className="font-bold text-red-500 text-end text-lg">{generalError}</p> }
                <span className="flex flex-col gap-2 lg:gap-0 mb-5">
                    <Label htmlFor="name" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Enter name:</Label>
                    <Input 
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        className={`border ${formError.name ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        disabled={loading}
                    />
                </span>
                {formError.name && <p className="text-red-500 text-sm mt-1">{formError.name}</p> }
                <span className="flex flex-col gap-2 lg:gap-0 mb-5">
                    <Label htmlFor="Email" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Enter email:</Label>
                    <Input 
                        id="Email"
                        name="email"
                        type="email"
                        value={email}
                        className={`border ${formError.email ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        required
                        disabled={loading}
                    />
                </span>
                {formError.email && <p className="text-red-500 text-sm mt-1">{formError.email}</p> }
                <span className="flex flex-col gap-2 lg:gap-0 mb-5">
                    <Label htmlFor="phoneNumber" className="text-lg md:text-2xl lg:text-2xl text-blue-600">Enter Phone Number:</Label>
                    <Input 
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        value={phoneNumber}
                        className={`border ${formError.phoneNumber ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter valid phone number"
                        required
                        disabled={loading}
                    />
                </span>
                {formError.phoneNumber && <p className="text-red-500 text-sm mt-1">{formError.phoneNumber}</p> }
                <Button className="bg-white dark:bg-slate-800 text-black dark:text-white font-bold shadow-md shadow-green-500 hover:shadow-xl hover:bg-white border md:text-lg lg:text-xl hover:-translate-y-1 transform easeinout duration-500 mt-5" disabled={loading} type="submit">
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
        </div>
    )
}