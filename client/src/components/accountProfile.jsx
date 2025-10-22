import React, { useEffect, useState} from "react";
import { useAuth } from "@/contexts/authContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { authService } from "@/services/authApi";
import { toast } from "sonner";
import { UserIcon, SendHorizonalIcon, LoaderIcon } from "lucide-react";
import { Input } from "./ui/input";

export default function AccountProfile() {

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
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Card className="shadow-xl border border-gray-300 backdrop-blur-lg bg-white/80 dark:bg-slate-800/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <UserIcon /> Account Settings
                        </CardTitle>
                    </CardHeader>
                    {generalError && <p className="font-bold text-red-500 text-end text-lg">{generalError}</p> }
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Input 
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    className={`border ${formError.name ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-black'}`}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    disabled={loading}
                                />
                                {formError.name && <p className="text-red-500 text-sm mt-1">{formError.name}</p> }
                            </div>

                            <div>
                                <Input 
                                    id="Email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    className={`border ${formError.email ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-black'}`}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    required
                                    disabled={loading}
                                />
                                {formError.email && <p className="text-red-500 text-sm mt-1">{formError.email}</p> }
                            </div>
                        </div>
                        <Input 
                            id="phoneNumber"
                            name="phoneNumber"
                            type="text"
                            value={phoneNumber}
                            className={`border ${formError.phoneNumber ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-black'}`}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter valid phone number"
                            required
                            disabled={loading}
                        />
                        {formError.phoneNumber && <p className="text-red-500 text-sm mt-1">{formError.phoneNumber}</p> }
                        
                        <div className="flex justify-end">
                            <Button type="Submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
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
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}