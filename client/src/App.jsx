import React from "react";
import Home from "./pages/home";
import Layout from '@/components/common/layout';
import { Toaster } from "sonner";
import { Route, Routes, Navigate} from 'react-router-dom'
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import ProfilePage from "./pages/profilePage";
import NotificationPage from "./pages/notificationPage";
import SchedulePage from "./pages/schedulePage";
import ProtectedRoute from "./components/protectedRoute";
import AssignmentPage from "./pages/assignmentPage";
import ManageUnitSchedule from "./components/dashboard/classRepDashboard/manageUnitsSchedule";
import Dashboard from "./components/dashboard/classRepDashboard/dasboard";
import ManageAssignment from "./components/dashboard/classRepDashboard/manageAssignments";
import ManageEmergencies from "./components/dashboard/classRepDashboard/manageEmergencies";
import ForgotPasswordPage from "./pages/forgotPassword";
import ResetPasswordPage from "./pages/resetPassword";
import VerifyEmailPage from "./pages/verifyEmail";
import AdminDashboard from "./components/dashboard/adminDashboard/adminDashboard";
import CoursePage from "./components/dashboard/adminDashboard/coursePage";
import CohortPage from "./components/dashboard/adminDashboard/cohortPage";
import AdminFeedback from "./components/dashboard/adminDashboard/adminFeedback";
import AdminManageFiles from "./components/dashboard/adminDashboard/adminManageFiles";
import LandingPage from "./pages/landingPage";
import { PathTracker, StartupRedirect, GuestOnlyRoute } from "./components/common/routerTracker";
import SettingsPage from "./pages/settingsPage";
import ManageCat from "./components/dashboard/classRepDashboard/manageCAT";
import CATPage from "./pages/catPage";
import FilesPage, { GeneralFiles, CohortFiles } from "./pages/filePages";
import HelpPage from "./pages/helpPage";
import UsersEditPage from "./components/dashboard/adminDashboard/usersPage";
import ManageFiles from "./components/dashboard/classRepDashboard/manageFiles";
import LecturersPage from "./pages/lecturerPage";
import ManageLecturers from "./components/dashboard/classRepDashboard/manageLecturer";
import ClassRepOverview from "./components/dashboard/classRepDashboard/classRepOverview";
import AdminAuditPage from "./components/dashboard/adminDashboard/adminAuditPage";
import AdminBroadcastPage from "./components/dashboard/adminDashboard/adminBroadcastPage";
import NotFoundPage from "./pages/notFoundPage";
import { UpdateProvider } from "./contexts/updateContext";
import UpdateBanner from "./components/common/updateBanner";

export default function App () {
  return (
    <UpdateProvider>
      <Toaster richColors position="top-right"/>
      <PathTracker />
      <UpdateBanner />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path='/register' element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />

        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={['student', 'classRep', 'admin']} />}>
            <Route path="/home" element={<Home />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationPage /> }/>
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/assignment/assignments" element={<AssignmentPage /> } />
            <Route path="/CAT" element={<CATPage /> } />
            <Route path="/upload/general" element={<FilesPage />} />
            <Route path="/lecturers" element={<LecturersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student', 'classRep', 'admin']} />}>
            <Route path="/upload" element={<FilesPage />} />
            <Route path="/upload/uploads" element={<FilesPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['classRep', 'admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} >
              <Route index element={<ClassRepOverview />} />
              <Route path='schedule' element={<ManageUnitSchedule />} />
              <Route path="assignment" element={<ManageAssignment /> }/>
              <Route path="CAT" element={<ManageCat />} />
              <Route path="file" element={<ManageFiles />} />
              <Route path="lecturers" element={<ManageLecturers />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}  >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/course" element={<CoursePage />} />
            <Route path="/admin/cohort" element={<CohortPage />} />
            <Route path="/admin/users" element={<UsersEditPage />} />
            <Route path="/admin/files" element={<AdminManageFiles />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/admin/broadcast" element={<AdminBroadcastPage />} />
          </Route>

        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </UpdateProvider>
  )
}