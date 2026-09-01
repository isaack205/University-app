"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SunIcon, BellIcon, LockIcon, DownloadIcon, HelpCircleIcon, UserIcon, Trash2Icon } from "lucide-react";
import ChangePasswordPage from "@/components/changePassword";
import { SettingsIcon } from "lucide-react";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/authContext";
import AccountProfile from "@/components/accountProfile";
import { useTheme } from "@/contexts/themeContext";
import { toast } from "sonner";
import { authService } from "@/services/authApi";
import { notificationService } from "@/services/notificationService";
import { pushManager } from "@/utils/pushManager";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  
  const [emailReminders, setEmailReminders] = useState(user?.preferences?.emailNotifications ?? true);
  const [smsReminders, setSmsReminders] = useState(user?.preferences?.smsNotifications ?? false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);
  const { isDark, setIsDark} = useTheme();
  const navigate = useNavigate();

  const handleExportData = () => {
    // Generate a clean JSON file of the user's data
    const exportData = {
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phoneNumber: user.phoneNumber,
        role: user.role,
        course: user.course?.name,
        cohort: user.cohort?.name,
        preferences: user.preferences
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `campushub_data_${user?.name?.replace(/ /g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Data exported successfully!");
  };

  const handleNavigation = () => {
    if (user.role === 'admin') {
        navigate('/admin/dashboard')
    } else if (user.role === 'classRep' || user.role === 'student') {
        navigate('/home')
    } else {
        navigate('/')
    }
  }

  // Simple delete account handler
  const handleDeleteAccount = async () => {
    try {
      await authService.deleteProfile();
      toast.success("Account deleted successfully. We're sad to see you go!");
      setDeleteConfirmText("");
      setShowDeleteConfirm(false);
      logout();
      navigate('/register');
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
      console.error(error);
    }
  };

  const handleToggleNotifications = async (checked) => {

    setNotificationsEnabled(checked);

    try {
      // Call backend to toggle notifications
      await notificationService.toggleNotifications(checked);

      if (checked) {
        try {
          await pushManager.subscribeUser();
          toast.success("🔔 Notifications successfully enabled!"); 
        } catch (pushError) {
          // If push subscription fails (due to VAPID or SW error)
          console.error("Browser Push Subscription Failed:", pushError);
          
          // The user still prefers notifications, we just can't deliver to this device yet.
          toast.warning("Notifications enabled in settings, but failed to activate on this device. Please clear browser cache/check permissions.");
        }
      } else {
        await pushManager.unsubscribeUser();
        toast.info("🔔 Notifications disabled. You won't receive alerts.");
      }

    } catch (error) {
      setNotificationsEnabled(!checked); // Revert UI if failed
      toast.error("Failed to update notification settings.");
      console.error(error);
    }
  };

  const handleToggleEmailReminders = async (checked) => {
    setEmailReminders(checked);
    try {
      const res = await authService.updateProfile({ 
        preferences: { 
          ...user.preferences, 
          emailNotifications: checked 
        } 
      });
      setUser(res.user);
      toast.success(checked ? "Email reminders enabled!" : "Email reminders disabled.");
    } catch (error) {
      setEmailReminders(!checked);
      toast.error("Failed to update email preferences.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNavigation}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account preferences and settings</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <AccountProfile />
        </div>

        {/* Notification Settings */}
        <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-slate-200">
              <BellIcon className="w-5 h-5 text-blue-500" /> Notifications
            </CardTitle>
            <CardDescription>Choose how you want to be alerted about CATs and assignments.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</p>
                  <p className="text-sm text-slate-500">Receive alerts directly on your device screen.</p>
                </div>
                <Switch className="cursor-pointer" checked={notificationsEnabled} onCheckedChange={handleToggleNotifications} />
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Email Reminders</p>
                  <p className="text-sm text-slate-500">Get important updates delivered to your inbox.</p>
                </div>
                <Switch className="cursor-pointer" checked={emailReminders} onCheckedChange={handleToggleEmailReminders} />
              </div>
              <div className="flex items-center justify-between p-6 opacity-60">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">SMS Reminders</p>
                  <p className="text-sm text-slate-500">Currently unavailable in your region.</p>
                </div>
                <Switch className="cursor-pointer" checked={smsReminders} disabled onCheckedChange={setSmsReminders} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-slate-200">
              <SunIcon className="w-5 h-5 text-amber-500" /> Appearance
            </CardTitle>
            <CardDescription>Customize how CampusHub looks on this device.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Dark Mode</p>
                <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
              </div>
              <Switch className="cursor-pointer" checked={isDark} onCheckedChange={setIsDark} />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-slate-200">
              <LockIcon className="w-5 h-5 text-indigo-500" /> Security
            </CardTitle>
            <CardDescription>Manage your password and account status.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant={showChangePassword ? "secondary" : "outline"}
                className="w-full sm:w-auto cursor-pointer flex gap-2" 
                onClick={() => {
                  setShowChangePassword(!showChangePassword); 
                  setShowDeleteConfirm(false);
                }}
              >
                <LockIcon className="w-4 h-4"/> Change Password
              </Button>

              <Button
                variant={showDeleteConfirm ? "secondary" : "destructive"}
                className="w-full sm:w-auto cursor-pointer flex gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                onClick={() => {
                  setShowDeleteConfirm(!showDeleteConfirm);
                  setShowChangePassword(false);
                }}
              >
                <Trash2Icon className="w-4 h-4"/> Delete Account
              </Button>
            </div>

            {/* Expandable Panels */}
            {showChangePassword && (
              <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <ChangePasswordPage />
              </div>
            )}

            {showDeleteConfirm && (
              <div className="p-6 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-900/10">
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Are you absolutely sure?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  To confirm, type <strong className="text-red-600 dark:text-red-500 select-none">Delete Account</strong> below.
                </p>
                <div className="max-w-md space-y-3">
                  <Input
                    placeholder='Type "Delete Account"'
                    value={deleteConfirmText}
                    className="border-red-200 focus-visible:ring-red-500"
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "Delete Account"}
                      className="cursor-pointer"
                    >
                      Permanently Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data & Support */}
        <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-slate-200">
              <DownloadIcon className="w-5 h-5 text-emerald-500" /> Data & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Export Account Data</p>
              <p className="text-sm text-slate-500 mb-4 md:mb-0">Download a copy of your personal data as a JSON file.</p>
            </div>
            <Button onClick={handleExportData} variant="outline" className="w-full md:w-auto shrink-0 cursor-pointer flex gap-2">
              <DownloadIcon className="w-4 h-4" /> Export Data
            </Button>
          </CardContent>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <HelpCircleIcon className="w-4 h-4" />
            <span>Need help? Visit our <a href="/help" className="text-blue-600 hover:underline font-medium">Help Center</a></span>
          </div>
        </Card>

      </div>
    </div>
  );
}
