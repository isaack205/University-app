import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { authService } from "@/services/authApi";
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Save, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import {motion, AnimatePresence } from "framer-motion";

export default function UpdateDetails() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    // Handling nested user object structure
    const userData = user?.user || user;
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setFormError({});
    setLoading(true);

    let errors = {};
    let isValid = true;

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

    const phoneRegex = /^\+254(7\d{8}|1\d{8})$/;
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
      isValid = false;
    } else if (!phoneRegex.test(phoneNumber.trim())) {
      errors.phoneNumber = 'Use +2547XXXXXXXX format.';
      isValid = false;
    }

    setFormError(errors);

    if (!isValid) {
      setLoading(false);
      toast.error('Please fix the errors in the form.');
      return;
    }

    try {
      const updates = await authService.updateProfile({ name, email, phoneNumber });
      if (updates) {
        await refreshUser();
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error updating details';
      setGeneralError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md lg:max-w-full mx-auto"
    >
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6 lg:p-8 space-y-6"
      >
        {/* Header Section */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update your personal contact information
          </p>
        </div>

        <hr className="border-slate-100 dark:border-slate-700" />

        <AnimatePresence>
          {generalError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              {generalError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Full Name
            </Label>
            <div className="relative transition-all group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="John Doe"
                className={`pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 transition-all ${formError.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {formError.name && <p className="text-xs font-medium text-red-500 ml-1">{formError.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </Label>
            <div className="relative transition-all group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="example@email.com"
                className={`pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 transition-all ${formError.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {formError.email && <p className="text-xs font-medium text-red-500 ml-1">{formError.email}</p>}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Phone Number
            </Label>
            <div className="relative transition-all group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
              <Input 
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                placeholder="+254XXXXXXXXX"
                className={`pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 transition-all ${formError.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {formError.phoneNumber && <p className="text-xs font-medium text-red-500 ml-1">{formError.phoneNumber}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Saving Changes...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save size={18} />
              <span>Save Changes</span>
            </div>
          )}
        </Button>
      </form>
    </motion.div>
  );
}