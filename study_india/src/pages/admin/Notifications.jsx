import React, { useState, useEffect } from 'react'
import {
    FiBell, FiCheck, FiTrash2, FiClock, FiAlertCircle,
    FiCheckCircle, FiInfo, FiSettings, FiLoader, FiRefreshCw
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Notifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/notifications?limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success && result.data) {
                setNotifications(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/notifications`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notificationIds: [id] }),
            })

            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ))
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }

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
            console.error('Failed to mark all as read:', err)
        }
    }

    const deleteNotification = async (id) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/notifications`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notificationIds: [id] }),
            })

            setNotifications(notifications.filter(n => n.id !== id))
        } catch (err) {
            console.error('Failed to delete notification:', err)
        }
    }

    const clearAll = async () => {
        if (!confirm('Clear all notifications?')) return

        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/notifications`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ clearAll: true }),
            })

            setNotifications([])
        } catch (err) {
            console.error('Failed to clear notifications:', err)
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read
        if (filter === 'read') return n.is_read
        return true
    })

    const unreadCount = notifications.filter(n => !n.is_read).length
    const readCount = notifications.filter(n => n.is_read).length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading notifications...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                    <p className="text-gray-600 mt-1">Stay updated with system notifications</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchNotifications} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm flex items-center gap-2">
                        <FiRefreshCw /> Refresh
                    </button>
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 font-medium text-sm"
                        disabled={unreadCount === 0}
                    >
                        Mark All Read
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium text-sm"
                        disabled={notifications.length === 0}
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                    {[
                        { label: 'All', value: 'all', count: notifications.length },
                        { label: 'Unread', value: 'unread', count: unreadCount },
                        { label: 'Read', value: 'read', count: readCount },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.value
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {filter === 'unread' ? 'No unread notifications' :
                                filter === 'read' ? 'No read notifications' :
                                    'No notifications'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-indigo-50/50' : ''
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === 'error' || notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                    notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {notification.type === 'error' || notification.type === 'alert' ? <FiAlertCircle /> :
                                        notification.type === 'success' ? <FiCheckCircle /> :
                                            <FiInfo />}
                                </div>
                                <div className="flex-1">
                                    {notification.title && (
                                        <p className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</p>
                                    )}
                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <FiClock size={12} />
                                            {new Date(notification.created_at).toLocaleString()}
                                        </span>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                            >
                                                <FiCheck size={12} />
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiSettings /> Notification Settings
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'New Application Notifications', description: 'Get notified when a new application is submitted' },
                        { label: 'Payment Confirmations', description: 'Receive alerts for successful payments' },
                        { label: 'Document Upload Alerts', description: 'Get notified when students upload documents' },
                        { label: 'System Updates', description: 'Stay informed about system maintenance and updates' },
                    ].map((setting, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">{setting.label}</p>
                                <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Notifications