import React, { useState, useEffect } from 'react'
import {
    FiSearch, FiFileText, FiCheckCircle, FiXCircle,
    FiDownload, FiAlertCircle, FiClock, FiLoader, FiRefreshCw,
    FiEye, FiX
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function DocumentVerification({ searchTerm, setSearchTerm }) {
    const [pendingDocs, setPendingDocs] = useState([])
    const [verifiedDocs, setVerifiedDocs] = useState([])
    const [rejectedDocs, setRejectedDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState('all')

    // Document viewer state
    const [viewingDoc, setViewingDoc] = useState(null)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/applications?limit=100`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            console.log('API Response:', result)

            if (result.success && result.data) {
                const pending = []
                const verified = []
                const rejected = []

                for (const app of result.data) {
                    if (app.documents && Array.isArray(app.documents)) {
                        for (const doc of app.documents) {
                            const docWithApp = {
                                ...doc,
                                applicationId: app.id,
                                application_id: app.application_id,
                                studentName: app.student_name,
                                studentEmail: app.student_email,
                                // Construct file URL
                                fileUrl: doc.file_path
                                    ? `${API_URL.replace('/api', '')}/uploads/${doc.file_path}`
                                    : null,
                            }

                            if (doc.status === 'pending') {
                                pending.push(docWithApp)
                            } else if (doc.status === 'verified') {
                                verified.push(docWithApp)
                            } else if (doc.status === 'rejected') {
                                rejected.push(docWithApp)
                            }
                        }
                    }
                }

                setPendingDocs(pending)
                setVerifiedDocs(verified.slice(0, 20))
                setRejectedDocs(rejected)
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err)
        } finally {
            setLoading(false)
        }
    }

    const verifyDocument = async (applicationId, docId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/applications/${applicationId}/documents`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ documentId: docId, status: 'verified' }),
            })
            const result = await response.json()

            if (result.success) {
                const doc = pendingDocs.find(d => d.id === docId)
                if (doc) {
                    setPendingDocs(pendingDocs.filter(d => d.id !== docId))
                    setVerifiedDocs([{
                        ...doc,
                        status: 'verified',
                        verifiedBy: 'You',
                        verifiedDate: new Date().toISOString().split('T')[0]
                    }, ...verifiedDocs])
                }
            } else {
                alert(result.error || 'Failed to verify document')
            }
        } catch (err) {
            console.error('Failed to verify document:', err)
        }
    }

    const rejectDocument = async (applicationId, docId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/applications/${applicationId}/documents`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ documentId: docId, status: 'rejected' }),
            })
            const result = await response.json()

            if (result.success) {
                const doc = pendingDocs.find(d => d.id === docId)
                if (doc) {
                    setPendingDocs(pendingDocs.filter(d => d.id !== docId))
                    setRejectedDocs([{ ...doc, status: 'rejected' }, ...rejectedDocs])
                }
            }
        } catch (err) {
            console.error('Failed to reject document:', err)
        }
    }

    const openDocumentViewer = (doc) => {
        setViewingDoc(doc)
    }

    const closeDocumentViewer = () => {
        setViewingDoc(null)
    }

    const isImageFile = (filePath) => {
        if (!filePath) return false
        const ext = filePath.split('.').pop()?.toLowerCase()
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
    }

    const isPDFFile = (filePath) => {
        if (!filePath) return false
        const ext = filePath.split('.').pop()?.toLowerCase()
        return ext === 'pdf'
    }

    const getFileUrl = (doc) => {
        if (!doc.file_path) return null

        // If file_path is a full Supabase storage path
        const supabaseUrl = 'https://nkaempzjiepcjkzqfquh.supabase.co'
        return `${supabaseUrl}/storage/v1/object/public/EduBridge/${doc.file_path}`
    }

    const filterDocs = (docs) => {
        if (!searchTerm) return docs
        const search = searchTerm.toLowerCase()
        return docs.filter(doc =>
            (doc.studentName || '').toLowerCase().includes(search) ||
            (doc.name || doc.docName || '').toLowerCase().includes(search)
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading documents...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <FiClock className="text-yellow-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{pendingDocs.length}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FiCheckCircle className="text-green-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{verifiedDocs.length}</p>
                            <p className="text-sm text-gray-600">Verified</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <FiXCircle className="text-red-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{rejectedDocs.length}</p>
                            <p className="text-sm text-gray-600">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or document..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="passport">Passport</option>
                        <option value="certificate">Certificate</option>
                        <option value="marksheet">Marksheet</option>
                        <option value="identification">Identification</option>
                    </select>
                    <button onClick={fetchDocuments} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2">
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {/* Pending Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiAlertCircle className="text-yellow-600" />
                        Pending Verification ({filterDocs(pendingDocs).length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {filterDocs(pendingDocs).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No pending documents</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">App ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Document</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">File</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterDocs(pendingDocs).map(doc => (
                                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-gray-900">{doc.studentName}</td>
                                        <td className="py-4 px-4 text-sm text-gray-500 font-mono">{doc.application_id}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <FiFileText className="text-gray-400" />
                                                <span>{doc.name || doc.docName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => openDocumentViewer(doc)}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-medium flex items-center gap-1"
                                            >
                                                <FiEye size={14} /> View
                                            </button>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => verifyDocument(doc.applicationId, doc.id)}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Verify"
                                                >
                                                    <FiCheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => rejectDocument(doc.applicationId, doc.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Reject"
                                                >
                                                    <FiXCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Verified Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiCheckCircle className="text-green-600" />
                        Recently Verified
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {filterDocs(verifiedDocs).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No verified documents yet</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Document</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Verified At</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterDocs(verifiedDocs).map(doc => (
                                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-gray-900">{doc.studentName}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <FiFileText className="text-gray-400" />
                                                <span>{doc.name || doc.docName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {doc.verifiedDate || doc.verified_at ?
                                                new Date(doc.verifiedDate || doc.verified_at).toLocaleDateString()
                                                : 'Recently'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => openDocumentViewer(doc)}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-medium flex items-center gap-1"
                                            >
                                                <FiEye size={14} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Document Viewer Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{viewingDoc.name || viewingDoc.docName}</h3>
                                <p className="text-sm text-gray-500">
                                    {viewingDoc.studentName} • App: {viewingDoc.application_id}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={getFileUrl(viewingDoc)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <FiDownload size={20} />
                                </a>
                                <button
                                    onClick={closeDocumentViewer}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
                            {isImageFile(viewingDoc.file_path) ? (
                                <img
                                    src={getFileUrl(viewingDoc)}
                                    alt={viewingDoc.name}
                                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="14">Image not available</text></svg>'
                                    }}
                                />
                            ) : isPDFFile(viewingDoc.file_path) ? (
                                <iframe
                                    src={getFileUrl(viewingDoc)}
                                    className="w-full h-[75vh] rounded-lg shadow-lg"
                                    title={viewingDoc.name}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                                    <a
                                        href={getFileUrl(viewingDoc)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium inline-flex items-center gap-2"
                                    >
                                        <FiDownload /> Download File
                                    </a>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Path: {viewingDoc.file_path}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Document Info Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Type: <strong>{viewingDoc.type}</strong></span>
                                <span>Status: <strong className={viewingDoc.status === 'verified' ? 'text-green-600' : viewingDoc.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}>{viewingDoc.status}</strong></span>
                                <span>Original: <strong>{viewingDoc.original_name || 'N/A'}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DocumentVerification