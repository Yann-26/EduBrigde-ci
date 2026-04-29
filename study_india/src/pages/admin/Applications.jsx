import React, { useState, useEffect } from 'react'
import {
    FiSearch, FiDownload, FiEye, FiCheckCircle, FiXCircle,
    FiClock, FiDollarSign, FiLoader, FiRefreshCw, FiChevronLeft
} from 'react-icons/fi'
import ApplicationDetail from './ApplicationDetail'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Applications({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedApps, setSelectedApps] = useState([])
    const [updatingId, setUpdatingId] = useState(null)

    // Detail view state - CRITICAL: both start as false/null
    const [selectedApplication, setSelectedApplication] = useState(null)
    const [viewingDetail, setViewingDetail] = useState(false)

    useEffect(() => {
        fetchApplications()
    }, [statusFilter])

    const fetchApplications = async () => {
        try {
            setLoading(true)
            setError('')
            const token = localStorage.getItem('token')

            const params = new URLSearchParams()
            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter)
            }
            if (searchTerm) {
                params.append('search', searchTerm)
            }
            params.append('limit', '50')

            const response = await fetch(`${API_URL}/applications?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setApplications(result.data || [])
            } else {
                setError(result.error || 'Failed to fetch applications')
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err)
            setError('Failed to load applications')
        } finally {
            setLoading(false)
        }
    }

    const updateApplicationStatus = async (appId, newStatus) => {
        try {
            setUpdatingId(appId)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/applications/${appId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            })
            const result = await response.json()

            if (result.success) {
                setApplications(applications.map(app =>
                    app.id === appId ? { ...app, status: newStatus } : app
                ))
                // Update selectedApplication if viewing detail
                if (selectedApplication && selectedApplication.id === appId) {
                    setSelectedApplication({ ...selectedApplication, status: newStatus })
                }
            } else {
                alert(result.error || 'Failed to update status')
            }
        } catch (err) {
            console.error('Failed to update status:', err)
            alert('Failed to update application status')
        } finally {
            setUpdatingId(null)
        }
    }

    const openApplicationDetail = async (appId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/applications/${appId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success && result.data) {
                setSelectedApplication(result.data)
                setViewingDetail(true)
            }
        } catch (err) {
            console.error('Failed to fetch application detail:', err)
            // Fallback: find from existing list
            const app = applications.find(a => a.id === appId)
            if (app) {
                setSelectedApplication(app)
                setViewingDetail(true)
            }
        }
    }

    const closeDetail = () => {
        setViewingDetail(false)
        setSelectedApplication(null)
    }

    const toggleSelectApp = (appId) => {
        setSelectedApps(prev =>
            prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
        )
    }

    const selectAll = () => {
        if (selectedApps.length === filteredApplications.length && filteredApplications.length > 0) {
            setSelectedApps([])
        } else {
            setSelectedApps(filteredApplications.map(app => app.id))
        }
    }

    const bulkUpdateStatus = async (newStatus) => {
        if (!confirm(`Update ${selectedApps.length} applications to ${newStatus}?`)) return

        try {
            const token = localStorage.getItem('token')
            for (const appId of selectedApps) {
                await fetch(`${API_URL}/applications/${appId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                })
            }
            setSelectedApps([])
            fetchApplications()
        } catch (err) {
            console.error('Bulk update failed:', err)
        }
    }

    const filteredApplications = applications.filter(app => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            (app.student_name || '').toLowerCase().includes(search) ||
            (app.student_email || '').toLowerCase().includes(search) ||
            (app.application_id || '').toLowerCase().includes(search)
        )
    })

    const getStatusColor = (status) => {
        const colors = {
            approved: 'bg-green-50 text-green-800 border-green-200',
            pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            under_review: 'bg-blue-50 text-blue-800 border-blue-200',
            rejected: 'bg-red-50 text-red-800 border-red-200'
        }
        return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200'
    }

    // ====== RENDER DETAIL VIEW ======
    // Only if viewingDetail is true AND selectedApplication exists
    if (viewingDetail && selectedApplication) {
        return (
            <div>
                <button
                    onClick={closeDetail}
                    className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <FiChevronLeft /> Back to Applications
                </button>
                <ApplicationDetail
                    application={selectedApplication}
                    onClose={closeDetail}
                    onUpdateStatus={updateApplicationStatus}
                />
            </div>
        )
    }

    // ====== RENDER LOADING ======
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading applications...</p>
                </div>
            </div>
        )
    }

    // ====== RENDER ERROR ======
    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchApplications} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 mx-auto">
                    <FiRefreshCw /> Retry
                </button>
            </div>
        )
    }

    // ====== RENDER TABLE ======
    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or application ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                        >
                            <option value="all">All Status ({applications.length})</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button onClick={fetchApplications} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm flex items-center gap-2">
                            <FiRefreshCw /> Refresh
                        </button>
                        <button className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm flex items-center gap-2">
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedApps.length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-indigo-800 font-medium">
                            {selectedApps.length} selected
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => bulkUpdateStatus('approved')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                                Approve All
                            </button>
                            <button onClick={() => bulkUpdateStatus('rejected')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                                Reject All
                            </button>
                            <button onClick={() => setSelectedApps([])} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-4 px-4">
                                    <input type="checkbox" checked={selectedApps.length === filteredApplications.length && filteredApplications.length > 0} onChange={selectAll} className="rounded border-gray-300 text-indigo-600" />
                                </th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Student</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">App ID</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">University</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Course</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Payment</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-12 text-gray-500">No applications found</td></tr>
                            ) : (
                                filteredApplications.map(app => (
                                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <input type="checkbox" checked={selectedApps.includes(app.id)} onChange={() => toggleSelectApp(app.id)} className="rounded border-gray-300 text-indigo-600" />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-semibold text-sm">{(app.student_name || 'U').charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{app.student_name}</p>
                                                    <p className="text-xs text-gray-500">{app.student_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4"><span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{app.application_id}</span></td>
                                        <td className="py-4 px-4 text-sm text-gray-700">{app.university?.name || 'N/A'}</td>
                                        <td className="py-4 px-4 text-sm text-gray-700">{app.course}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${app.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                <FiDollarSign size={12} />{app.payment_status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <select value={app.status} onChange={(e) => updateApplicationStatus(app.id, e.target.value)} disabled={updatingId === app.id} className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                                                <option value="pending">Pending</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => openApplicationDetail(app.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-1">
                                                <FiEye size={14} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Applications