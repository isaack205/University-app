import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { SendIcon, LoaderIcon } from "lucide-react";
import { useForm, ValidationError } from '@formspree/react';

export default function Contact() {

    const [state, handleSubmit, resetForm] = useForm('xaqqqwlg');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [about, setAbout] = useState('');
    const [message, setMessage] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(()=> {
        if (state.succeeded) {
            setName('');
            setEmail('');
            setMessage('');

            setShowSuccessMessage(true)
            toast.success('Message sent successfully')

            const timer = setTimeout(() => {
                setShowSuccessMessage(false);

                resetForm();
            }, 6000);

            return () => clearTimeout(timer);

        }
    }, [state.succeeded, resetForm]);  

    return(
        <div className="">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>
              {showSuccessMessage ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-black">
                            <h2 className="text-3xl font-bold mb-4">Thanks for the message!</h2>
                            <p>W'll get back to you as soon as possible.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <Input 
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="John Doe"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={state.submitting}
                                    />
                                    <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <Input 
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        placeholder="johndoe@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={state.submitting}
                                    />
                                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <Input 
                                    id="about"
                                    name="about"
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="What is this about?"
                                    required
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    disabled={state.submitting}
                                />
                                <ValidationError prefix="About" field="about" errors={state.errors} className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message *
                                </label>
                                <Textarea 
                                    id="message"
                                    name="message"
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder="Tell us more about your issue or question ..."
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={state.submitting}
                                />
                                <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-sm" />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors" disabled={state.submitting}>
                                {state.submitting ? 
                                    (
                                        <div className="flex gap-2 items-center">
                                            <LoaderIcon className="animate-spin"/>Sending
                                        </div>
                                    ) 
                                        : 
                                    (
                                        <div className="flex gap-2 items-center">
                                            <SendIcon className=""/>
                                            Send Message
                                        </div>
                                    )}
                            </Button>
                        </form>
                    )}
            </div>
        </div>
    )
}