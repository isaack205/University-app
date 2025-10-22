// Imports
import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { authService } from '../services/authApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [ currentPassword, setCurrentPassword ] = useState('');
  const [ newPassword, setNewPassword ] = useState('');
  const [ confirmNewPassword, setConfirmNewPassword ] = useState('');
  const [formDataError, setFormDataError] = useState({});
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setConfirmNewPassword(''),
    setNewPassword(''),
    setCurrentPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormDataError(null);
    setErrors(null);

    let isValid = true;
    let error = {};

    if (!currentPassword.trim()) {
        error.currentPassword = 'Current password field cannot be empty';
        isValid = false;
    }

    if (!newPassword.trim()) {
        error.newPassword = 'New password field cannot be empty';
        isValid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
        error.newPassword = 'Insert atleast one uppercase letter';
        isValid = false;
    } else if (!/[a-z]/.test(newPassword)) {
        error.newPassword = 'Insert atleast one lowercase letter';
        isValid = false;
    } else if (!/[0-9]/.test(newPassword)) {
        error.newPassword = 'Insert atleast one number';
        isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        error.newPassword = 'Insert atleast one special character';
        isValid = false;
    } else if (newPassword < 8) {
        error.newPassword = 'New password must be atleast 8 characters';
        isValid = false;
    }

    if (!confirmNewPassword.trim()) {
        error.confirmNewPassword = 'Confirm New password field cannot be empty';
        isValid = false;
    }

    if (newPassword !== confirmNewPassword) {
        error.confirmNewPassword = 'Passwords do not match!';
        isValid = false;
    }

    setFormDataError(error);

    if(!isValid) {
        toast.error('Clear form errors.')
        setLoading(false);
        return;
    }

    try {
        await authService.changePassword({ currentPassword, newPassword });
        toast.success('Password changed successfully!');
        resetForm();
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to change password.'
        toast.error(errorMessage);
        setErrors(errorMessage)
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Change Password</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors && <p className='text-end text-red-500'>{errors}</p> }
                <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`mt-1 block w-full ${formDataError.currentPassword ? 'border-red-500' : 'border-black'}`}
                    disabled={loading}
                    required
                    />
                </div>
                {formDataError.currentPassword && <p className="text-red-500">{formDataError.currentPassword}</p> }

                <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`mt-1 block w-full ${formDataError.newPassword ? 'border-red-500' : 'border-black'}`}
                    disabled={loading}
                    required
                    />
                </div>
                {formDataError.newPassword && <p className="text-red-500">{formDataError.newPassword}</p> }

                <div>
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`mt-1 block w-full ${formDataError.confirmNewPassword ? 'border-red-500' : 'border-black'}`}
                    disabled={loading}

                    />
                </div>
                {formDataError.confirmNewPassword && <p className="text-red-500">{formDataError.confirmNewPassword}</p> }
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md" disabled={loading}>
                    {loading ? 'Saving new password...' : 'Change Password'}
                </Button>
            </form>
        </div>
    </div>
  );
}
