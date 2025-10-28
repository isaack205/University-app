"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SunIcon, BellIcon, LockIcon, DownloadIcon, HelpCircleIcon } from "lucide-react";
import ChangePasswordPage from "@/components/changePassword";
import { SettingsIcon } from "lucide-react";
import { MoveLeftIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/authContext";
import AccountProfile from "@/components/accountProfile";
import { useTheme } from "@/contexts/themeContext";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";
import { pushManager } from "@/utils/pushManager";

export default function SettingsPage() {
  const [emailReminders, setEmailReminders] = useState(false);
  const [smsReminders, setSmsReminders] = useState(true);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);
  const { isDark, setIsDark} = useTheme();
  const navigate = useNavigate();

  const handleExportData = () => {
    // TODO: Implement backend export
    alert("Your data export has started 📦");
  };

  const handleNavigation = () => {
    if (user.role === 'admin') {
        navigate('/admin/dashboard')
    } else if (user.role === 'classRep' || 'student') {
        navigate('/home')
    }
  }

  // Simple delete account handler (replace with real API call)
  const handleDeleteAccount = async () => {
    alert("Account deletion requested. Replace this with API call.");

    setDeleteConfirmText("");
    setShowDeleteConfirm(false);
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


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 mb-10">
        <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer" type="button" onClick={handleNavigation}>
            <MoveLeftIcon />
            Home
        </Button>
      <h1 className="text-3xl font-bold text-blue-600 mb-4 flex items-center gap-3"><SettingsIcon/> Settings</h1>

      {/* Account Settings */}
      <div>
        <AccountProfile />
      </div>

      {/* Notification Settings */}
      <Card className="shadow-xl border border-gray-300 backdrop-blur-lg bg-white/80 dark:bg-slate-800/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BellIcon /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Enable push Notifications</span>
            <Switch checked={notificationsEnabled}  onCheckedChange={handleToggleNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <span>Email Reminders</span>
            <Switch checked={emailReminders} disabled onCheckedChange={setEmailReminders} />
          </div>
          <div className="flex items-center justify-between">
            <span>SMS Reminders</span>
            <Switch checked={smsReminders} disabled onCheckedChange={setSmsReminders} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="shadow-xl border border-gray-300 backdrop-blur-lg bg-white/80 dark:bg-slate-800/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <SunIcon /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <Switch checked={isDark} onCheckedChange={setIsDark} />
          </div>
          <p className="text-sm text-muted-foreground">
            Switch between light and dark themes. Changes apply instantly.
          </p>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-xl border border-gray-300 backdrop-blur-lg bg-white/80 dark:bg-slate-800/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <LockIcon /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggleable Change Password panel */}
          <div className="space-y-2 ">
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full md:w-auto" onClick={() => {setShowChangePassword((s) => !s); 
                                                                                    setShowDeleteConfirm(false);
                                                                            }}
              >
                Change Password
              </Button>

              <Button
                variant="destructive"
                className="w-full md:w-auto"
                onClick={() => {
                  setShowDeleteConfirm((s) => !s);
                  setShowChangePassword(false);
                }}
              >
                Delete Account
              </Button>
            </div>

            {showChangePassword && (
              <div className="mt-4 p-4 border rounded-md bg-white/60 dark:bg-slate-800 backdrop-blur-sm">
                <ChangePasswordPage />
              </div>
            )}

            {showDeleteConfirm && (
              <div className="mt-4 p-4 border rounded-md bg-white/60 dark:bg-slate-800 backdrop-blur-sm">
                <p className="mb-2">
                  To confirm account deletion, type <strong className="text-red-600">Delete Account</strong> in the input below, then press Confirm.
                </p>
                <Input
                  placeholder='Type "Delete Account" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
                <div className="flex gap-2 justify-end mt-3">
                  <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    // disabled={deleteConfirmText !== "Delete Account"}
                    disabled
                  >
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data & Support */}
      <Card className="shadow-xl border border-gray-300 backdrop-blur-lg bg-white/80 dark:bg-slate-800/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DownloadIcon /> Data & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportData} disabled variant="outline" className="w-full md:w-auto">
            Export My Data
          </Button>
          <Separator />
          <div className="flex items-center gap-2 text-gray-500">
            <HelpCircleIcon />
            <span  >
              Need help? Visit our <a href="/help"  className="text-blue-600 underline">Help Center</a>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
