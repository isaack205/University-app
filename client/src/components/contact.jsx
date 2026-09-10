import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { SendIcon, LoaderIcon, CheckCircleIcon } from "lucide-react";
import { feedbackService } from "@/services/feedbackApi";
import { useAuth } from "@/contexts/authContext";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Contact() {
    const { user } = useAuth();
    
    // State
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [type, setType] = useState('other');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validation
        let formErrors = {};
        let isValid = true;

        if (!user) {
            if (!guestName.trim()) { formErrors.guestName = "Name is required"; isValid = false; }
            if (!guestEmail.trim()) { formErrors.guestEmail = "Email is required"; isValid = false; }
        }
        if (!message.trim()) { formErrors.message = "Message is required"; isValid = false; }

        setErrors(formErrors);

        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            await feedbackService.submitFeedback({
                guestName: user ? undefined : guestName,
                guestEmail: user ? undefined : guestEmail,
                type,
                message
            });
            
            setShowSuccessMessage(true);
            toast.success('Message sent successfully!');

            // Reset form
            setGuestName('');
            setGuestEmail('');
            setType('other');
            setMessage('');

            // Hide success message after 6 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 6000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>
              {showSuccessMessage ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-800 animate-in fade-in zoom-in duration-500">
                        <CheckCircleIcon className="w-16 h-16 text-emerald-500 mb-4" />
                        <h2 className="text-3xl font-bold mb-3">Thanks for reaching out!</h2>
                        <p className="text-slate-500">We've received your feedback and will review it shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!user && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <Input 
                                        type="text"
                                        className={`w-full ${errors.guestName ? 'border-red-500' : ''}`}
                                        placeholder="John Doe"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        disabled={loading}
                                    />
                                    {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <Input 
                                        type="email"
                                        className={`w-full ${errors.guestEmail ? 'border-red-500' : ''}`}
                                        placeholder="johndoe@example.com"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                    {errors.guestEmail && <p className="text-red-500 text-xs mt-1">{errors.guestEmail}</p>}
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Topic *
                            </label>
                            <Select value={type} onValueChange={setType} disabled={loading}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="What is this about?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="issue">Report an Issue / Bug</SelectItem>
                                        <SelectItem value="suggestion">Feature Suggestion</SelectItem>
                                        <SelectItem value="other">Other / General Question</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Message *
                            </label>
                            <Textarea 
                                className={`w-full min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                                placeholder="Tell us more about your issue, suggestion, or question..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                            />
                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                        </div>
                        
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-lg transition-colors" disabled={loading}>
                            {loading ? (
                                <div className="flex gap-2 items-center">
                                    <LoaderIcon className="animate-spin w-5 h-5"/> Sending...
                                </div>
                            ) : (
                                <div className="flex gap-2 items-center text-lg">
                                    <SendIcon className="w-5 h-5"/> Send Message
                                </div>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}