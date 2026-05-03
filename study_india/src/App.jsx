import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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
import Dashboard from './pages/Dashboard'
import PaymentCallback from './pages/PaymentCallback'
import AddUniversity from './pages/admin/AddUniversity'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Admin routes - no Navbar, no Footer
  if (isAdminRoute) {
    return (
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/universities/add" element={<AddUniversity />} />
            <Route path="/admin/universities/:id/edit" element={<AddUniversity />} />
            <Route path="/admin/*" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    )
  }

  // Public routes - with Navbar and Footer
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
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App