// admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/admin/SideBar'
import Header from '../../components/admin/Header'
import DashBoard from './DashBoard'
import Applications from './Applications'
import DocumentVerification from './DocumentVerification'
import Payments from './Payments'
import Reports from './Reports'
import Settings from './Settings'
import Universities from './Universities'
import VisaSteps from './VisaSteps'
import Users from './Users'
import Notifications from './Notifications'
import { useNavigate } from 'react-router-dom'
import VisaApplications from './VisaApplications'


function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const navigate = useNavigate()  // Now it's defined
    const [notifications, setNotifications] = useState([
        { id: 1, message: "New application received from Konan Yao", time: "2 min ago", read: false },
        { id: 2, message: "Payment received - Application #1023", time: "15 min ago", read: false },
        { id: 3, message: "Document verification pending for Marie Kouassi", time: "1 hour ago", read: true },
        { id: 4, message: "System update completed", time: "2 hours ago", read: true },
    ])

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        const adminUser = localStorage.getItem('adminUser')

        if (!token || !adminUser) {
            navigate('/admin/login')
            return
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success && (result.user.role === 'admin' || result.user.role === 'super_admin')) {
                setIsAuthenticated(true)
            } else {
                localStorage.removeItem('token')
                localStorage.removeItem('adminUser')
                navigate('/admin/login')
            }
        } catch (err) {
            navigate('/admin/login')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('adminUser')
        navigate('/admin/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-4xl mb-4">⚙️</div>
                    <p>Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashBoard />
            case 'applications':
                return <Applications
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            case 'documents':
                return <DocumentVerification
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            case 'payments':
                return <Payments
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            case 'reports':
                return <Reports />
            case 'settings':
                return <Settings />
            case 'universities':
                return <Universities />
            case 'users':
                return <Users />
            case 'notifications':
                return <Notifications /> 
            case 'visa-steps':
                return <VisaSteps />
            case 'visa-applications':
                return <VisaApplications />
            default:
                return <Dashboard />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
            />
            <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                <Header
                    activeTab={activeTab}
                    onLogout={handleLogout}
                />
                <main className="p-4 md:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default AdminPanel