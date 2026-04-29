import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    FiFileText, FiClock, FiCheckCircle, FiXCircle, FiEye,
    FiLoader, FiRefreshCw, FiArrowLeft, FiChevronRight,
    FiDollarSign, FiBookOpen, FiCalendar, FiMapPin
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function MyApplications() {
    const { user, loading: authLoading } = useAuth()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedApp, setSelectedApp] = useState(null)

    useEffect(() => {
        if (user) {
            fetchMyApplications()
        }
    }, [user])

    const fetchMyApplications = async () => {
        if (!user?.email) return

        try {
            setLoading(true)
            setError('')
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/applications?search=${user.email}&limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setApplications(result.data || [])
            } else {
                setError('Failed to load applications')
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err)
            setError('Failed to load your applications')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            approved: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            under_review: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        }
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="text-green-500" size={20} />
            case 'pending': return <FiClock className="text-yellow-500" size={20} />
            case 'under_review': return <FiEye className="text-blue-500" size={20} />
            case 'rejected': return <FiXCircle className="text-red-500" size={20} />
            default: return <FiFileText className="text-gray-400" size={20} />
        }
    }

    const getStatusMessage = (status) => {
        switch (status) {
            case 'approved': return 'Congratulations! Your application has been approved.'
            case 'pending': return 'Your application is pending review.'
            case 'under_review': return 'Your application is being reviewed.'
            case 'rejected': return 'Your application was not accepted.'
            default: return 'Status unknown.'
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your applications...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
                    <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-6">Please login to view your applications.</p>
                    <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 inline-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/universities" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4">
                            <FiArrowLeft /> Back to Universities
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900">My Applications</h1>
                        <p className="text-gray-600 mt-2">Track all your university applications in one place</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchMyApplications} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2">
                            <FiRefreshCw /> Refresh
                        </button>
                        <Link to="/universities" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">
                            Apply to Another University
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
                        <p className="text-red-800">{error}</p>
                        <button onClick={fetchMyApplications} className="mt-2 text-red-600 font-medium hover:underline">Try Again</button>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: applications.length, color: 'bg-indigo-500' },
                        { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, color: 'bg-green-500' },
                        { label: 'Pending', value: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length, color: 'bg-yellow-500' },
                        { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'bg-red-500' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                            <div className={`w-3 h-3 ${stat.color} rounded-full mx-auto mb-2`}></div>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                        <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h2>
                        <p className="text-gray-600 mb-6">You haven't submitted any applications yet. Start your journey now!</p>
                        <Link to="/universities" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 inline-block">
                            Explore Universities
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map(app => (
                            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* App Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(app.status)}`}>
                                                {getStatusIcon(app.status)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {app.university?.name || 'University'}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                        {app.status?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <FiBookOpen size={14} /> {app.course}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FiCalendar size={14} /> {new Date(app.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FiDollarSign size={14} /> {app.amount || 'XOF75'} - {app.payment_status || 'pending'}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Application ID: <span className="font-mono">{app.application_id}</span></p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 font-medium text-sm flex items-center gap-1 shrink-0"
                                        >
                                            {selectedApp?.id === app.id ? 'Hide Details' : 'View Details'} <FiChevronRight className={selectedApp?.id === app.id ? 'rotate-90' : ''} />
                                        </button>
                                    </div>

                                    {/* Expanded Details */}
                                    {selectedApp?.id === app.id && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            {/* Status Message */}
                                            <div className={`p-4 rounded-xl mb-6 ${getStatusColor(app.status)}`}>
                                                <p className="font-medium">{getStatusMessage(app.status)}</p>
                                            </div>

                                            {/* Timeline */}
                                            {app.timeline && app.timeline.length > 0 && (
                                                <div className="mb-6">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Application Timeline</h4>
                                                    <div className="space-y-3">
                                                        {(typeof app.timeline === 'string' ? JSON.parse(app.timeline) : app.timeline).map((event, idx) => (
                                                            <div key={idx} className="flex gap-3">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5"></div>
                                                                    {idx < (typeof app.timeline === 'string' ? JSON.parse(app.timeline) : app.timeline).length - 1 && (
                                                                        <div className="w-0.5 h-full bg-gray-200"></div>
                                                                    )}
                                                                </div>
                                                                <div className="pb-3">
                                                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                                                        {event.action?.replace(/_/g, ' ')}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">{event.description}</p>
                                                                    <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documents */}
                                            {app.documents && app.documents.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {app.documents.map((doc, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                                <div className="flex items-center gap-2">
                                                                    <FiFileText className="text-gray-400" />
                                                                    <span className="text-sm text-gray-700">{doc.name}</span>
                                                                </div>
                                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {doc.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyApplications