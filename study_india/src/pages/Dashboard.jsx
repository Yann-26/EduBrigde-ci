import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    FiClock, FiCheckCircle, FiAlertCircle, FiFileText, FiUser,
    FiLoader, FiBell, FiExternalLink, FiTrendingUp, FiCalendar,
    FiLock, FiSettings, FiMail, FiPhone, FiMapPin, FiCreditCard,
    FiSave, FiEye, FiEyeOff, FiLogOut, FiRefreshCw, FiChevronRight,
    FiBookOpen, FiXCircle, FiDollarSign, FiArrowLeft
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // Tab state
    const [activeTab, setActiveTab] = useState('overview')

    // Applications
    const [applications, setApplications] = useState([])
    const [selectedApp, setSelectedApp] = useState(null)

    // Visa
    const [visaApp, setVisaApp] = useState(null)

    // Notifications
    const [notifications, setNotifications] = useState([])

    // Profile
    const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
    const [profileMessage, setProfileMessage] = useState('')

    // Password
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
    const [showPassword, setShowPassword] = useState({ current: false, newPass: false, confirm: false })
    const [passwordMessage, setPasswordMessage] = useState('')
    const [changingPassword, setChangingPassword] = useState(false)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user) {
            fetchAllData()
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            })
        }
    }, [user])

    const fetchAllData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const [appsRes, visaRes, notifRes] = await Promise.all([
                fetch(`${API_URL}/applications?search=${user.email}&limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/visa`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/notifications?limit=10`, { headers: { Authorization: `Bearer ${token}` } }),
            ])

            const appsData = await appsRes.json()
            const visaData = await visaRes.json()
            const notifData = await notifRes.json()

            if (appsData.success) setApplications(appsData.data || [])
            if (visaData.success) setVisaApp(visaData.data)
            if (notifData.success) setNotifications(notifData.data || [])
        } catch (err) {
            console.error('Failed to fetch dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profile),
            })
            const result = await response.json()
            setProfileMessage(result.success ? 'Profile updated!' : result.error || 'Failed')
            setTimeout(() => setProfileMessage(''), 3000)
        } catch (err) {
            setProfileMessage('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (passwords.newPass !== passwords.confirm) {
            setPasswordMessage('Passwords do not match')
            return
        }
        if (passwords.newPass.length < 6) {
            setPasswordMessage('Password must be at least 6 characters')
            return
        }
        setChangingPassword(true)
        setPasswordMessage('')
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.newPass
                }),
            })
            const result = await response.json()
            if (result.success) {
                setPasswordMessage('✅ Password changed successfully!')
                setPasswords({ current: '', newPass: '', confirm: '' })
            } else {
                setPasswordMessage(result.error || 'Failed to change password')
            }
            setTimeout(() => setPasswordMessage(''), 4000)
        } catch (err) {
            setPasswordMessage('Failed to change password')
        } finally {
            setChangingPassword(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = { approved: 'text-green-600 bg-green-50', pending: 'text-yellow-600 bg-yellow-50', under_review: 'text-blue-600 bg-blue-50', rejected: 'text-red-600 bg-red-50' }
        return colors[status] || 'text-gray-600 bg-gray-50'
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="text-green-500" />
            case 'pending': return <FiClock className="text-yellow-500" />
            case 'under_review': return <FiEye className="text-blue-500" />
            case 'rejected': return <FiXCircle className="text-red-500" />
            default: return <FiFileText className="text-gray-400" />
        }
    }

    const visaSteps = visaApp?.steps || []
    const approvedVisaSteps = visaSteps.filter(s => s.status === 'approved').length
    const visaProgress = visaSteps.length > 0 ? Math.round((approvedVisaSteps / visaSteps.length) * 100) : 0

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiTrendingUp /> },
        { id: 'applications', label: 'Applications', icon: <FiFileText />, count: applications.length },
        { id: 'visa', label: 'Visa Progress', icon: <FiCreditCard /> },
        { id: 'profile', label: 'Profile', icon: <FiUser /> },
        { id: 'security', label: 'Security', icon: <FiLock /> },
    ]

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-4xl text-indigo-600" /></div>
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center"><Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Login to view dashboard</Link></div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-gray-400 hover:text-gray-600"><FiArrowLeft size={20} /></Link>
                        <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchAllData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg" title="Refresh">
                            <FiRefreshCw size={18} />
                        </button>
                        <Link to="/universities" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                            Apply Now
                        </Link>
                        <button onClick={() => { logout(); navigate('/') }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg" title="Logout">
                            <FiLogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* User Info Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-indigo-100 text-sm flex items-center gap-2"><FiMail size={14} /> {user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}>
                            {tab.icon} {tab.label}
                            {tab.count > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* TAB: Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Applications', value: applications.length, icon: <FiFileText />, color: 'bg-blue-500' },
                                { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: <FiCheckCircle />, color: 'bg-green-500' },
                                { label: 'Pending', value: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length, icon: <FiClock />, color: 'bg-yellow-500' },
                                { label: 'Visa Progress', value: `${visaProgress}%`, icon: <FiTrendingUp />, color: 'bg-purple-500' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                    <p className="text-sm text-gray-600">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Applications */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                                <button onClick={() => setActiveTab('applications')} className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                            </div>
                            {applications.slice(0, 3).map(app => (
                                <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(app.status)}
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{app.university?.name || 'University'}</p>
                                            <p className="text-xs text-gray-500">{app.course}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                        {app.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                            {applications.length === 0 && <p className="text-center py-6 text-gray-500">No applications yet</p>}
                        </div>

                        {/* Visa Progress Mini */}
                        {visaApp && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Visa Progress</h3>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${visaProgress}%` }}></div>
                                </div>
                                <p className="text-sm text-gray-600">{approvedVisaSteps}/{visaSteps.length} steps completed</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Applications */}
                {activeTab === 'applications' && (
                    <div className="space-y-4">
                        {applications.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h2>
                                <Link to="/universities" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 inline-block mt-4">Browse Universities</Link>
                            </div>
                        ) : (
                            applications.map(app => (
                                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(app.status)}`}>{getStatusIcon(app.status)}</div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{app.university?.name || 'University'}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>{app.status?.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                                                        <span><FiBookOpen size={14} className="inline" /> {app.course}</span>
                                                        <span><FiCalendar size={14} className="inline" /> {new Date(app.created_at).toLocaleDateString()}</span>
                                                        <span><FiDollarSign size={14} className="inline" /> {app.payment_status || 'pending'}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">ID: <span className="font-mono">{app.application_id}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {app.payment_status === 'paid' && (
                                                    <Link to={`/receipt/${app.transaction_id || app.payment_reference}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200">
                                                        📄 Receipt
                                                    </Link>
                                                )}
                                                <button onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm hover:bg-indigo-100">
                                                    {selectedApp?.id === app.id ? 'Hide' : 'Details'}
                                                </button>
                                            </div>
                                        </div>
                                        {selectedApp?.id === app.id && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className={`p-4 rounded-xl mb-4 ${getStatusColor(app.status)}`}>
                                                    <p className="font-medium">{app.status === 'approved' ? '🎉 Approved!' : app.status === 'rejected' ? 'Not accepted' : 'In progress'}</p>
                                                </div>
                                                {app.timeline?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-gray-900 text-sm">Timeline</h4>
                                                        {(typeof app.timeline === 'string' ? JSON.parse(app.timeline) : app.timeline).map((e, i) => (
                                                            <div key={i} className="flex gap-2 text-xs text-gray-600">
                                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></div>
                                                                <div>
                                                                    <p className="font-medium capitalize">{e.action?.replace(/_/g, ' ')}</p>
                                                                    <p className="text-gray-400">{new Date(e.timestamp).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* TAB: Visa Progress */}
                {activeTab === 'visa' && (
                    <div>
                        {!visaApp ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <FiCreditCard className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">No Visa Application</h2>
                                <Link to="/visa-tracker" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 inline-block mt-4">Start Visa Application</Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium">{approvedVisaSteps}/{visaSteps.length} Steps</span>
                                    <span className="text-sm font-bold text-indigo-600">{visaProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                                    <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${visaProgress}%` }}></div>
                                </div>
                                <div className="space-y-2">
                                    {visaSteps.map(step => (
                                        <div key={step.id} className="flex items-center gap-3 text-sm p-2 rounded-lg">
                                            {step.status === 'approved' ? <FiCheckCircle className="text-green-500" /> :
                                                step.status === 'submitted' ? <FiClock className="text-blue-500" /> :
                                                    step.status === 'rejected' ? <FiAlertCircle className="text-red-500" /> :
                                                        <FiClock className="text-gray-300" />}
                                            <span className={step.status === 'approved' ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                                {step.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/visa-tracker" className="mt-4 inline-flex items-center gap-1 text-indigo-600 text-sm font-medium hover:underline">
                                    Go to Visa Tracker <FiExternalLink size={12} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Profile */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FiUser /> Profile Settings</h2>
                        {profileMessage && (
                            <div className={`mb-6 p-4 rounded-xl text-sm ${profileMessage.includes('updated') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{profileMessage}</div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={profile.email} disabled
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <button onClick={handleProfileUpdate} disabled={saving}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50">
                                {saving ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB: Security */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FiLock /> Change Password</h2>
                        {passwordMessage && (
                            <div className={`mb-6 p-4 rounded-xl text-sm ${passwordMessage.includes('changed') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{passwordMessage}</div>
                        )}
                        <div className="space-y-4">
                            {['current', 'newPass', 'confirm'].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field === 'current' ? 'Current Password' : field === 'newPass' ? 'New Password' : 'Confirm New Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword[field] ? 'text' : 'password'}
                                            value={passwords[field]}
                                            onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-12"
                                            placeholder={field === 'current' ? 'Enter current password' : field === 'newPass' ? 'Min. 6 characters' : 'Confirm new password'}
                                        />
                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, [field]: !showPassword[field] })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPassword[field] ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handlePasswordChange} disabled={changingPassword}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50">
                                {changingPassword ? <><FiLoader className="animate-spin" /> Changing...</> : <><FiLock /> Change Password</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard