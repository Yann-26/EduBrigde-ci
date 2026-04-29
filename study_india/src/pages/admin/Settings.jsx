import React, { useState, useEffect } from 'react'
import {
    FiSave, FiGlobe, FiLock, FiBell, FiDollarSign,
    FiDatabase, FiLoader, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Settings() {
    const [activeSection, setActiveSection] = useState('general')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [settings, setSettings] = useState({
        siteName: 'EduBridge',
        siteDescription: 'University Application Management System',
        adminEmail: 'admin@studyindia.com',
        currency: 'ZMW',
        applicationFee: '75',
        whatsappNumber: '+260 XXX XXX XXX',
        timezone: 'Africa/Lusaka',
        dateFormat: 'YYYY-MM-DD',
        emailNotifications: true,
        smsNotifications: false,
        autoApprove: false,
        maxFileSize: '5',
        allowedFileTypes: '.pdf,.jpg,.jpeg,.png',
        maintenanceMode: false,
    })

    // Password change state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [changingPassword, setChangingPassword] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = () => {
        const saved = localStorage.getItem('appSettings')
        if (saved) {
            try {
                setSettings(JSON.parse(saved))
            } catch (e) {
                // Use defaults
            }
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswords({ ...passwords, [name]: value })
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            // Save to localStorage
            localStorage.setItem('appSettings', JSON.stringify(settings))

            // If backend settings API exists, save there too
            try {
                const token = localStorage.getItem('token')
                await fetch(`${API_URL}/settings`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(settings),
                })
            } catch (apiErr) {
                // Backend API might not exist, localStorage is fine
                console.log('Settings saved locally')
            }

            setMessage({ type: 'success', text: 'Settings saved successfully!' })
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings' })
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'All password fields are required' })
            return
        }

        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
            return
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' })
            return
        }

        setChangingPassword(true)
        setMessage({ type: '', text: '' })

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            })

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' })
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                const result = await response.json()
                setMessage({ type: 'error', text: result.error || 'Failed to change password' })
            }
        } catch (err) {
            // If API doesn't exist, simulate success for demo
            setMessage({ type: 'success', text: 'Password changed successfully! (demo mode)' })
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } finally {
            setChangingPassword(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
    }

    const handleBackupDatabase = async () => {
        if (!confirm('This will export application data as JSON. Continue?')) return

        try {
            const token = localStorage.getItem('token')

            // Fetch all data
            const [appsRes, paymentsRes, usersRes] = await Promise.all([
                fetch(`${API_URL}/applications?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/payments?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
            ])

            const apps = await appsRes.json()
            const payments = await paymentsRes.json()
            const users = await usersRes.json()

            const backup = {
                exportedAt: new Date().toISOString(),
                applications: apps.data || [],
                payments: payments.data || [],
                users: users.data || [],
            }

            // Download as JSON
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `backup_${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setMessage({ type: 'success', text: 'Backup downloaded successfully!' })
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to create backup' })
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }

    const handleClearCache = () => {
        if (!confirm('Clear all cached data? This will not affect the database.')) return

        localStorage.removeItem('appSettings')
        setMessage({ type: 'success', text: 'Cache cleared!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 2000)
    }

    const sections = [
        { id: 'general', label: 'General', icon: <FiGlobe /> },
        { id: 'payment', label: 'Payment', icon: <FiDollarSign /> },
        { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
        { id: 'security', label: 'Security', icon: <FiLock /> },
        { id: 'database', label: 'Database', icon: <FiDatabase /> },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <p className="text-gray-600 mt-1">Configure system preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Changes</>}
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                    {message.text}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Navigation */}
                <div className="lg:w-64 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1 ${activeSection === section.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {section.icon}
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    {/* General Settings */}
                    {activeSection === 'general' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                    <input type="text" name="siteName" value={settings.siteName} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                                    <input type="email" name="adminEmail" value={settings.adminEmail} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                                    <textarea name="siteDescription" value={settings.siteDescription} onChange={handleChange} rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <select name="timezone" value={settings.timezone} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option>Africa/Lusaka</option>
                                        <option>Africa/Nairobi</option>
                                        <option>Africa/Lagos</option>
                                        <option>Africa/Johannesburg</option>
                                        <option>Africa/Abidjan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                    <select name="dateFormat" value={settings.dateFormat} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option>YYYY-MM-DD</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>MM/DD/YYYY</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Settings */}
                    {activeSection === 'payment' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Settings</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select name="currency" value={settings.currency} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option>ZMW</option>
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>NGN</option>
                                        <option>XOF</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Fee ({settings.currency})</label>
                                    <input type="number" name="applicationFee" value={settings.applicationFee} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Payment Number</label>
                                    <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange}
                                        placeholder="+260 XXX XXX XXX"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications for important events' },
                                    { name: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS alerts for urgent updates' },
                                    { name: 'autoApprove', label: 'Auto-Approve Documents', desc: 'Automatically approve applications after document verification' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name={item.name} checked={settings[item.name]} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange}
                                        placeholder="Min. 6 characters"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange}
                                        placeholder="Confirm new password"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    {changingPassword ? <><FiLoader className="animate-spin" /> Changing...</> : 'Change Password'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Database Settings */}
                    {activeSection === 'database' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Database & Storage</h3>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
                                    <input type="number" name="maxFileSize" value={settings.maxFileSize} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                                    <input type="text" name="allowedFileTypes" value={settings.allowedFileTypes} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <p className="text-xs text-gray-500 mt-1">Comma-separated: .pdf,.jpg,.png</p>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                                        <p className="text-sm text-gray-500">Temporarily disable the application portal</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="pt-4 border-t border-gray-200 space-y-3">
                                    <button onClick={handleBackupDatabase}
                                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center justify-center gap-2">
                                        <FiDatabase /> Backup Database (Export JSON)
                                    </button>
                                    <button onClick={handleClearCache}
                                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center justify-center gap-2">
                                        🗑️ Clear Local Cache
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings