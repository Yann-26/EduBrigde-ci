import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import VisaGuide from './pages/VisaGuide'
import VisaTracker from './pages/VisaTracker'
import Apply from './pages/Apply'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminPanel from './pages/admin/AdminPanel'
import AdminLogin from './pages/admin/AdminLogin'
import MyApplications from './pages/MyApplications'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/university/:id" element={<UniversityDetail />} />
          <Route path="/visa-guide" element={<VisaGuide />} />
          <Route path="/visa-tracker" element={<VisaTracker />} />
          <Route path="/apply/:universityId" element={<Apply />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/applications" element={<MyApplications />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App