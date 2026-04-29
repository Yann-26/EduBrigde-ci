import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    FiCheckCircle, FiClock, FiLock, FiUpload, FiLoader,
    FiRefreshCw, FiXCircle, FiArrowRight, FiFileText, FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function VisaTracker() {
    const { user, loading: authLoading } = useAuth()
    const [visaApp, setVisaApp] = useState(null)
    const [stepTemplates, setStepTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [submittingStep, setSubmittingStep] = useState(null)
    const [uploadFiles, setUploadFiles] = useState({})
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            fetchVisaApplication()
            fetchStepTemplates()
        }
    }, [user])

    const fetchStepTemplates = async () => {
        try {
            const response = await fetch(`${API_URL}/visa/templates`)
            const result = await response.json()
            if (result.success) {
                setStepTemplates(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err)
        }
    }

    const fetchVisaApplication = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/visa`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setVisaApp(result.data)
            }
        } catch (err) {
            console.error('Failed to fetch visa:', err)
        } finally {
            setLoading(false)
        }
    }

    const startVisaApplication = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/visa`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                await fetchVisaApplication()
                setMessage('Visa application started! Complete each step in order.')
                setTimeout(() => setMessage(''), 5000)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to start visa application')
        } finally {
            setLoading(false)
        }
    }

    const submitStep = async (stepId) => {
        try {
            setSubmittingStep(stepId)
            setError('')
            const token = localStorage.getItem('token')

            const formData = new FormData()
            const files = uploadFiles[stepId] || []
            files.forEach(file => {
                formData.append('documents', file)
                formData.append('documentNames', file.name)
            })

            const response = await fetch(`${API_URL}/visa/steps/${stepId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            })
            const result = await response.json()

            if (result.success) {
                setMessage('Step submitted for admin review!')
                setUploadFiles({ ...uploadFiles, [stepId]: [] })
                await fetchVisaApplication()
                setTimeout(() => setMessage(''), 5000)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError('Failed to submit step')
        } finally {
            setSubmittingStep(null)
        }
    }

    const handleFileSelect = (stepId, files) => {
        setUploadFiles({ ...uploadFiles, [stepId]: Array.from(files) })
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="text-green-500" size={24} />
            case 'submitted': return <FiClock className="text-blue-500" size={24} />
            case 'rejected': return <FiXCircle className="text-red-500" size={24} />
            case 'unlocked': return <FiArrowRight className="text-indigo-500" size={24} />
            case 'locked': return <FiLock className="text-gray-300" size={24} />
            default: return <FiLock className="text-gray-300" size={24} />
        }
    }

    const getStepBorderColor = (status) => {
        switch (status) {
            case 'approved': return 'border-green-400 bg-green-50'
            case 'submitted': return 'border-blue-400 bg-blue-50'
            case 'rejected': return 'border-red-400 bg-red-50'
            case 'unlocked': return 'border-indigo-400 bg-white'
            case 'locked': return 'border-gray-200 bg-gray-50'
            default: return 'border-gray-200 bg-gray-50'
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading visa information...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md mx-auto">
                    <span className="text-6xl mb-4 block">🛂</span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-6">Please login to track your visa application.</p>
                    <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 inline-block">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    // No visa application started
    if (!visaApp || !visaApp.steps || visaApp.steps.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <span className="text-6xl mb-6 block">🛂</span>
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Student Visa Tracker</h1>
                    <p className="text-gray-600 mb-4">
                        Track your Indian student visa application step by step.
                        Upload documents for each step and our team will review them.
                    </p>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-3">How it works:</h3>
                        <ol className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">1.</span>
                                Start your visa application below
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">2.</span>
                                Complete each step by uploading required documents
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">3.</span>
                                Our team reviews each step and approves or requests changes
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">4.</span>
                                Track your progress in real-time
                            </li>
                        </ol>
                    </div>
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">{error}</div>
                    )}
                    <button
                        onClick={startVisaApplication}
                        disabled={loading}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-lg disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                        {loading ? <><FiLoader className="animate-spin" /> Starting...</> : '🚀 Start My Visa Application'}
                    </button>
                </div>
            </div>
        )
    }

    const steps = visaApp.steps || []
    const approvedCount = steps.filter(s => s.status === 'approved').length
    const progressPercent = steps.length > 0 ? Math.round((approvedCount / steps.length) * 100) : 0

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Visa Application Tracker</h1>
                        <p className="text-gray-600 mt-1">Complete each step to get your Indian student visa</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchVisaApplication}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                            <FiRefreshCw /> Refresh
                        </button>
                        <Link
                            to="/visa-guide"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm"
                        >
                            <FiFileText /> Visa Guide
                        </Link>
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 flex items-center gap-2">
                        <FiCheckCircle /> {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 flex items-center gap-2">
                        <FiAlertCircle /> {error}
                    </div>
                )}

                {/* Status Badge */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${visaApp.status === 'completed' ? 'bg-green-100 text-green-800' :
                                visaApp.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {visaApp.status === 'completed' ? <FiCheckCircle /> : <FiClock />}
                                {visaApp.status?.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">
                            Started: {new Date(visaApp.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-green-500 h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                            {approvedCount}/{steps.length} Steps
                        </span>
                    </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const template = stepTemplates.find(t => t.step_number === step.step_number)
                        const isActive = step.status === 'unlocked' || step.status === 'rejected'
                        const isSubmitted = step.status === 'submitted'
                        const isApproved = step.status === 'approved'
                        const isLocked = step.status === 'locked'

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={`bg-white rounded-2xl border-2 p-6 transition-colors ${getStepBorderColor(step.status)}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status Icon */}
                                    <div className="mt-1 shrink-0">
                                        {getStatusIcon(step.status)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-indigo-600 text-xs font-black uppercase bg-indigo-50 px-2 py-0.5 rounded-full">
                                                Step {step.step_number}
                                            </span>
                                            {step.status === 'rejected' && (
                                                <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full">
                                                    Needs Revision
                                                </span>
                                            )}
                                            {step.status === 'approved' && (
                                                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                                    Completed ✓
                                                </span>
                                            )}
                                            {isLocked && (
                                                <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                    Locked
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900">
                                            {step.title}
                                            {template?.icon && <span className="ml-2">{template.icon}</span>}
                                        </h3>

                                        <p className="text-gray-600 text-sm mt-1">
                                            {template?.description || 'Complete this step to proceed'}
                                        </p>

                                        {/* Required Documents from Template */}
                                        {template?.required_documents && template.required_documents.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Required Documents:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {template.required_documents.map((doc, i) => (
                                                        <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full">
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Details from Template */}
                                        {template?.details && template.details.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Instructions:
                                                </p>
                                                <ul className="space-y-1">
                                                    {template.details.map((detail, i) => (
                                                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                                            <span className="text-indigo-400 mt-0.5">•</span>
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* User's Uploaded Documents */}
                                        {step.documents && step.documents.length > 0 && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                                    Your Uploaded Files:
                                                </p>
                                                <div className="space-y-1.5">
                                                    {step.documents.map((doc, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <FiFileText className="text-gray-400" size={14} />
                                                                <span className="text-gray-700 truncate max-w-[200px]">
                                                                    {doc.original_name || doc.name || 'Document'}
                                                                </span>
                                                            </div>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
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

                                        {/* Admin Notes */}
                                        {step.admin_notes && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                                <p className="text-xs font-semibold text-blue-900 mb-1">📝 Admin Note:</p>
                                                <p className="text-sm text-blue-800">{step.admin_notes}</p>
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {step.status === 'rejected' && step.rejection_reason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                                                <p className="text-xs font-semibold text-red-900 mb-1">❌ Revision Needed:</p>
                                                <p className="text-sm text-red-800">{step.rejection_reason}</p>
                                            </div>
                                        )}

                                        {/* Action: Upload & Submit */}
                                        {isActive && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm font-medium text-gray-700 mb-3">
                                                    {step.status === 'rejected'
                                                        ? '📤 Please re-submit with the requested changes:'
                                                        : '📤 Upload required documents and submit for review:'}
                                                </p>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileSelect(step.id, e.target.files)}
                                                            className="hidden"
                                                        />
                                                        <span className="px-4 py-2.5 bg-white border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors inline-flex items-center gap-2 cursor-pointer">
                                                            <FiUpload size={14} />
                                                            {uploadFiles[step.id]?.length
                                                                ? `${uploadFiles[step.id].length} file(s) selected`
                                                                : 'Choose Files'}
                                                        </span>
                                                    </label>
                                                    <button
                                                        onClick={() => submitStep(step.id)}
                                                        disabled={submittingStep === step.id || (!uploadFiles[step.id]?.length)}
                                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        {submittingStep === step.id ? (
                                                            <><FiLoader className="animate-spin" size={14} /> Submitting...</>
                                                        ) : (
                                                            'Submit for Review'
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Accepted formats: PDF, JPG, PNG (Max 5MB each)
                                                </p>
                                            </div>
                                        )}

                                        {/* Status: Submitted */}
                                        {isSubmitted && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <FiClock className="animate-pulse" />
                                                    <span className="text-sm font-medium">
                                                        Submitted on {new Date(step.user_submitted_at).toLocaleDateString()} - Waiting for admin review
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status: Approved */}
                                        {isApproved && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <FiCheckCircle />
                                                    <span className="text-sm">
                                                        Approved on {new Date(step.admin_reviewed_at).toLocaleDateString()}
                                                        {step.reviewer?.name && ` by ${step.reviewer.name}`}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status: Locked */}
                                        {isLocked && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <FiLock size={14} />
                                                    <span className="text-sm">Complete the previous step to unlock this one</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default VisaTracker