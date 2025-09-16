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
              <Route path="/dashboard" element={<Home />} />
              <Route path='/profile' element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationPage /> }/>
              <Route path="/schedule" element={<SchedulePage />} />
            </Route>
          </Routes>
      </Layout>
    </>
  )
}