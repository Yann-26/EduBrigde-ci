import React, { useState, useEffect } from 'react'
import {
    FiBell, FiSearch, FiSun, FiMoon, FiUser, FiChevronDown,
    FiSettings, FiLogOut, FiHelpCircle
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Header({ activeTab, onLogout }) {
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [adminUser, setAdminUser] = useState(null)

    useEffect(() => {
        fetchNotifications()
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}')
        setAdminUser(user)
    }, [])

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/notifications?limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            if (result.success) {
                setNotifications(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/notifications`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ markAll: true }),
            })
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        } catch (err) {
            console.error('Failed to mark notifications as read:', err)
        }
    }

    const getActiveTabTitle = () => {
        const titles = {
            dashboard: 'Dashboard',
            applications: 'Applications Management',
            documents: 'Document Verification',
            payments: 'Payment Management',
            universities: 'University Management',
            users: 'User Management',
            notifications: 'Notifications',
            reports: 'Reports & Analytics',
            settings: 'Settings'
        }
        return titles[activeTab] || 'Dashboard'
    }

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{getActiveTabTitle()}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiBell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            <button onClick={markAllAsRead} className="text-sm text-indigo-600 hover:text-indigo-800">
                                                Mark all as read
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-gray-500 text-sm">
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-indigo-50' : ''}`}>
                                                    <p className="text-sm text-gray-800">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-800">{adminUser?.name || 'Admin User'}</p>
                                <p className="text-xs text-gray-500">{adminUser?.role || 'Admin'}</p>
                            </div>
                            <FiChevronDown className="hidden md:block text-gray-400" size={16} />
                        </button>

                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                                    <div className="p-2">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold">{adminUser?.name}</p>
                                            <p className="text-xs text-gray-500">{adminUser?.email}</p>
                                        </div>
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                            <FiUser size={16} /> Profile
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                            <FiSettings size={16} /> Settings
                                        </button>
                                        <hr className="my-2" />
                                        <button
                                            onClick={onLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiLogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header