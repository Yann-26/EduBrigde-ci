import React, { useState, useEffect } from 'react'
import {
    FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock,
    FiLoader, FiRefreshCw, FiChevronDown, FiChevronUp,
    FiUser, FiMail, FiCalendar, FiLock, FiUnlock,
    FiFileText, FiDownload, FiMessageSquare
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function VisaApplications() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedApp, setSelectedApp] = useState(null)
    const [expandedSteps, setExpandedSteps] = useState({})
    const [reviewingStep, setReviewingStep] = useState(null)
    const [reviewNotes, setReviewNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchApplications()
    }, [statusFilter])

    const fetchApplications = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/visa/admin/applications?status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setApplications(result.data || [])
            } else {
                // Fallback: fetch from regular endpoint if admin endpoint doesn't exist
                const fallbackRes = await fetch(`${API_URL}/visa`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const fallbackResult = await fallbackRes.json()
                if (fallbackResult.success) {
                    setApplications(fallbackResult.data ? [fallbackResult.data] : [])
                }
            }
        } catch (err) {
            console.error('Failed to fetch visa applications:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchApplicationDetail = async (appId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/visa/admin/applications/${appId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setSelectedApp(result.data)
            }
        } catch (err) {
            console.error('Failed to fetch application detail:', err)
        }
    }

    const approveStep = async (stepId) => {
        try {
            setReviewingStep(stepId)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/visa/steps/${stepId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: 'approve',
                    notes: reviewNotes || undefined,
                }),
            })
            const result = await response.json()

            if (result.success) {
                setMessage(`Step approved successfully!`)
                setReviewNotes('')
                if (selectedApp) {
                    await fetchApplicationDetail(selectedApp.id)
                }
                await fetchApplications()
                setTimeout(() => setMessage(''), 3000)
            } else {
                alert(result.error || 'Failed to approve step')
            }
        } catch (err) {
            console.error('Failed to approve step:', err)
        } finally {
            setReviewingStep(null)
        }
    }

    const rejectStep = async (stepId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason')
            return
        }

        try {
            setReviewingStep(stepId)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/visa/steps/${stepId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: 'reject',
                    reason: rejectionReason,
                }),
            })
            const result = await response.json()

            if (result.success) {
                setMessage(`Step rejected. Student will be notified.`)
                setRejectionReason('')
                setShowRejectForm(null)
                if (selectedApp) {
                    await fetchApplicationDetail(selectedApp.id)
                }
                await fetchApplications()
                setTimeout(() => setMessage(''), 3000)
            } else {
                alert(result.error || 'Failed to reject step')
            }
        } catch (err) {
            console.error('Failed to reject step:', err)
        } finally {
            setReviewingStep(null)
        }
    }

    const toggleStepExpand = (stepId) => {
        setExpandedSteps(prev => ({
            ...prev,
            [stepId]: !prev[stepId]
        }))
    }

    const getStatusBadge = (status) => {
        const badges = {
            approved: 'bg-green-100 text-green-800 border-green-200',
            submitted: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            unlocked: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            locked: 'bg-gray-100 text-gray-600 border-gray-200',
        }
        return badges[status] || 'bg-gray-100 text-gray-600'
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="text-green-500" />
            case 'submitted': return <FiClock className="text-blue-500" />
            case 'rejected': return <FiXCircle className="text-red-500" />
            case 'unlocked': return <FiUnlock className="text-indigo-500" />
            case 'locked': return <FiLock className="text-gray-400" />
            default: return <FiClock className="text-gray-400" />
        }
    }

    const filteredApps = applications.filter(app => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        const user = app.user || app.user_id
        return (
            (typeof user === 'object' ? user?.name || user?.email : '')?.toLowerCase().includes(search) ||
            (app.user_email || '').toLowerCase().includes(search)
        )
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FiLoader className="animate-spin text-4xl text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Visa Applications</h2>
                    <p className="text-gray-600 mt-1">Review and manage student visa step submissions</p>
                </div>
                <button onClick={fetchApplications}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2 text-sm">
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 flex items-center gap-2">
                    <FiCheckCircle /> {message}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    >
                        <option value="all">All ({applications.length})</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApps.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                        <p className="text-gray-500">No visa applications found</p>
                    </div>
                ) : (
                    filteredApps.map(app => {
                        const steps = app.steps || []
                        const approvedCount = steps.filter(s => s.status === 'approved').length
                        const progress = steps.length > 0 ? Math.round((approvedCount / steps.length) * 100) : 0

                        return (
                            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* App Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                        if (selectedApp?.id === app.id) {
                                            setSelectedApp(null)
                                        } else {
                                            fetchApplicationDetail(app.id)
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <FiUser className="text-indigo-600 text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {app.user?.name || app.student_name || 'Student'}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <FiMail size={12} />
                                                    {app.user?.email || app.student_email || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <FiCalendar size={12} />
                                                    Started: {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {approvedCount}/{steps.length} Steps
                                                    </span>
                                                </div>
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {app.status?.replace('_', ' ')}
                                            </span>
                                            <FiChevronDown className={`text-gray-400 transition-transform ${selectedApp?.id === app.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Steps */}
                                {selectedApp?.id === app.id && (
                                    <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                                        <h4 className="font-semibold text-gray-900 mb-4">Visa Steps</h4>
                                        <div className="space-y-3">
                                            {(selectedApp.steps || steps).map((step) => {
                                                const isExpanded = expandedSteps[step.id]
                                                const isSubmitted = step.status === 'submitted'
                                                const isApproved = step.status === 'approved'
                                                const isRejected = step.status === 'rejected'

                                                return (
                                                    <div key={step.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                        {/* Step Header */}
                                                        <div
                                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                                            onClick={() => toggleStepExpand(step.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusBadge(step.status)}`}>
                                                                    {getStatusIcon(step.status)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">
                                                                        Step {step.step_number}: {step.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Status: <span className="font-medium capitalize">{step.status.replace('_', ' ')}</span>
                                                                        {step.user_submitted_at && ` • Submitted: ${new Date(step.user_submitted_at).toLocaleDateString()}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <FiChevronDown className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </div>

                                                        {/* Step Details */}
                                                        {isExpanded && (
                                                            <div className="border-t border-gray-100 p-4 space-y-4">
                                                                {/* Documents */}
                                                                {step.documents && step.documents.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Uploaded Documents:</p>
                                                                        <div className="space-y-2">
                                                                            {step.documents.map((doc, i) => (
                                                                                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <FiFileText className="text-gray-400" size={14} />
                                                                                        <span className="text-sm text-gray-700">{doc.original_name || doc.name}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                                            }`}>
                                                                                            {doc.status}
                                                                                        </span>
                                                                                        {doc.file_path && (
                                                                                            <a
                                                                                                href={`https://nkaempzjiepcjkzqfquh.supabase.co/storage/v1/object/public/EduBridge/${doc.file_path}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                                                            >
                                                                                                <FiDownload size={14} />
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Admin Review Actions (only for submitted steps) */}
                                                                {isSubmitted && (
                                                                    <div className="border-t border-gray-100 pt-4">
                                                                        <p className="text-sm font-medium text-gray-700 mb-3">Review this step:</p>

                                                                        {/* Notes */}
                                                                        <div className="mb-3">
                                                                            <label className="block text-xs font-medium text-gray-500 mb-1">Admin Notes (optional)</label>
                                                                            <textarea
                                                                                value={reviewNotes}
                                                                                onChange={(e) => setReviewNotes(e.target.value)}
                                                                                placeholder="Add notes for the student..."
                                                                                rows={2}
                                                                                className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm resize-none"
                                                                            />
                                                                        </div>

                                                                        {/* Action Buttons */}
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => approveStep(step.id)}
                                                                                disabled={reviewingStep === step.id}
                                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                                                                            >
                                                                                {reviewingStep === step.id ? (
                                                                                    <><FiLoader className="animate-spin" size={14} /> Processing...</>
                                                                                ) : (
                                                                                    <><FiCheckCircle size={14} /> Approve</>
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setShowRejectForm(showRejectForm === step.id ? null : step.id)}
                                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                                                                            >
                                                                                <FiXCircle size={14} /> Reject
                                                                            </button>
                                                                        </div>

                                                                        {/* Rejection Form */}
                                                                        {showRejectForm === step.id && (
                                                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                                                <label className="block text-xs font-medium text-red-700 mb-1">
                                                                                    Rejection Reason *
                                                                                </label>
                                                                                <textarea
                                                                                    value={rejectionReason}
                                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                                    placeholder="Explain why this step is rejected and what the student needs to fix..."
                                                                                    rows={3}
                                                                                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm resize-none mb-2"
                                                                                />
                                                                                <button
                                                                                    onClick={() => rejectStep(step.id)}
                                                                                    disabled={reviewingStep === step.id || !rejectionReason.trim()}
                                                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                                                                                >
                                                                                    {reviewingStep === step.id ? 'Rejecting...' : 'Confirm Rejection'}
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Already Reviewed */}
                                                                {isApproved && (
                                                                    <div className="border-t border-gray-100 pt-3">
                                                                        <p className="text-sm text-green-600 flex items-center gap-2">
                                                                            <FiCheckCircle /> Approved
                                                                            {step.admin_reviewed_at && ` on ${new Date(step.admin_reviewed_at).toLocaleDateString()}`}
                                                                        </p>
                                                                        {step.admin_notes && (
                                                                            <p className="text-xs text-gray-600 mt-1 bg-blue-50 p-2 rounded">
                                                                                📝 {step.admin_notes}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {isRejected && (
                                                                    <div className="border-t border-gray-100 pt-3">
                                                                        <p className="text-sm text-red-600 flex items-center gap-2">
                                                                            <FiXCircle /> Rejected
                                                                        </p>
                                                                        {step.rejection_reason && (
                                                                            <p className="text-xs text-red-700 mt-1 bg-red-50 p-2 rounded">
                                                                                ❌ {step.rejection_reason}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default VisaApplications