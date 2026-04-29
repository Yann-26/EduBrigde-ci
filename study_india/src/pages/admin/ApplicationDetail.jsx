import React, { useState, useEffect } from 'react'
import {
    FiUser, FiPhone, FiMail, FiMapPin, FiBookOpen, FiCalendar,
    FiDollarSign, FiFileText, FiCheckCircle, FiXCircle, FiClock,
    FiDownload, FiLoader, FiChevronLeft
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function ApplicationDetail({ application, onClose, onUpdateStatus }) {
    const [activeSection, setActiveSection] = useState('info')
    const [documents, setDocuments] = useState([])
    const [loadingDocs, setLoadingDocs] = useState(false)

    if (!application) return null

    // Extract data safely
    const studentName = application.student_name || application.student?.name || 'Unknown'
    const studentEmail = application.student_email || application.student?.email || ''
    const studentPhone = application.student_phone || application.student?.phone || ''
    const studentCountry = application.student_country || application.student?.country || ''
    const course = application.course || ''
    const amount = application.amount || 'XOF75'
    const paymentStatus = application.payment_status || application.paymentStatus || 'pending'
    const appStatus = application.status || 'pending'
    const appId = application.application_id || application.id || ''
    const createdAt = application.created_at || application.appliedDate || ''
    const timeline = application.timeline || []
    const universityName = application.university?.name || application.university || ''

    useEffect(() => {
        fetchDocuments()
    }, [application.id])

    const fetchDocuments = async () => {
        try {
            setLoadingDocs(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/applications/${application.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            if (result.success && result.data?.documents) {
                setDocuments(result.data.documents)
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err)
        } finally {
            setLoadingDocs(false)
        }
    }

    const updateDocumentStatus = async (docId, newStatus) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`${API_URL}/applications/${application.id}/documents`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ documentId: docId, status: newStatus }),
            })
            setDocuments(documents.map(doc =>
                doc.id === docId ? { ...doc, status: newStatus } : doc
            ))
        } catch (err) {
            console.error('Failed to update document:', err)
        }
    }

    const getInitials = (name) => {
        return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const timelineEvents = typeof timeline === 'string' ? JSON.parse(timeline) : timeline

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-xl">
                            {getInitials(studentName)}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{studentName}</h2>
                        <p className="text-indigo-100">Application #{appId} • {new Date(createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
                <div className="flex gap-6">
                    {['info', 'documents', 'timeline'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSection(tab)}
                            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeSection === tab
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeSection === 'info' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiUser className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-900">{studentName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiMail className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{studentEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiPhone className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{studentPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiMapPin className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Country</p>
                                        <p className="font-medium text-gray-900">{studentCountry}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiBookOpen className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">University</p>
                                        <p className="font-medium text-gray-900">{universityName}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Course</p>
                                    <p className="font-medium text-gray-900">{course}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiCalendar className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Applied Date</p>
                                        <p className="font-medium text-gray-900">{new Date(createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiDollarSign className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Application Fee</p>
                                        <p className={`font-medium ${paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                            {amount} - {paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Actions */}
                        <div className="md:col-span-2 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onUpdateStatus(application.id, 'under_review')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${appStatus === 'under_review' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                >
                                    <FiClock className="inline mr-2" /> Under Review
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(application.id, 'approved')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${appStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    <FiCheckCircle className="inline mr-2" /> Approve
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(application.id, 'rejected')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${appStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                >
                                    <FiXCircle className="inline mr-2" /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'documents' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification</h3>
                        {loadingDocs ? (
                            <div className="text-center py-8"><FiLoader className="animate-spin text-2xl text-indigo-600 mx-auto" /></div>
                        ) : documents.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No documents uploaded</p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <FiFileText className="text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900">{doc.name}</p>
                                                <p className="text-xs text-gray-500">{doc.original_name || doc.file_path}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateDocumentStatus(doc.id, 'verified')}
                                                className={`p-2 rounded-lg ${doc.status === 'verified' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50 text-gray-400'}`}>
                                                <FiCheckCircle size={18} />
                                            </button>
                                            <button onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                                                className={`p-2 rounded-lg ${doc.status === 'rejected' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-gray-400'}`}>
                                                <FiXCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'timeline' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
                        {timelineEvents.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No timeline events</p>
                        ) : (
                            <div className="space-y-4">
                                {timelineEvents.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                                            {idx < timelineEvents.length - 1 && <div className="w-0.5 h-full bg-gray-200"></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                                            <p className="font-medium text-gray-900 capitalize">
                                                {(item.action || '').replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ApplicationDetail