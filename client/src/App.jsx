import React from "react";
import Home from "./components/home";
import Layout from '@/components/common/layout';
import { Toaster } from "sonner";
import { Route, Routes, Navigate} from 'react-router-dom'
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import ProfilePage from "./pages/profilePage";

export default function App () {
  return (
    <>
      <Toaster richColors position="top-right"/>
      <Layout>
          <Routes>
            <Route path="/" element={<Navigate to= "/login" replace/>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route />
          </Routes>
      </Layout>
    </>
  )
}