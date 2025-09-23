import React from "react";
import Home from "./components/dashboard/home";
import Layout from '@/components/common/layout';
import { Toaster } from "sonner";
import { Route, Routes, Navigate} from 'react-router-dom'
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import ProfilePage from "./pages/profilePage";
import NotificationPage from "./pages/notificationPage";
import SchedulePage from "./components/dashboard/schedulePage";
import ProtectedRoute from "./components/common/protectedRoute";
import AssignmentPage from "./pages/assignmentPage";
import ManageUnitSchedule from "./components/dashboard/classRepDashboard/manageUnitsSchedule";
import Dashboard from "./components/dashboard/classRepDashboard/dasboard";
import ManageAssignment from "./components/dashboard/classRepDashboard/manageAssignments";
import ManageEmergencies from "./components/dashboard/classRepDashboard/manageEmergencies";

export default function App () {
  return (
    <>
      <Toaster richColors position="top-right"/>
      <Layout>
          <Routes>
            <Route path="/" element={<Navigate to= "/login" replace/>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />

            <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'classRep']} />}>
              <Route path="/home" element={<Home />} />
              <Route path='/profile' element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationPage /> }/>
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/assignment/assignments" element={<AssignmentPage /> } />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['classRep']} />}>
              <Route path="/dashboard" element={<Dashboard />} >
                <Route path='schedule' element={<ManageUnitSchedule />} />
                <Route path="assignment" element={<ManageAssignment /> }/>
                <Route path="emergency" element={<ManageEmergencies />} />
              </Route>
            </Route>

          </Routes>
      </Layout>
    </>
  )
}