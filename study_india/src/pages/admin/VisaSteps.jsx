import React, { useState, useEffect } from 'react'
import {
    FiPlus, FiEdit2, FiTrash2, FiSave, FiX,
    FiLoader, FiRefreshCw, FiCheckCircle, FiAlertCircle,
    FiChevronDown, FiChevronUp, FiFileText
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function VisaSteps() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editForm, setEditForm] = useState(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    const emptyForm = {
        step_number: templates.length + 1,
        title: '',
        description: '',
        icon: '📋',
        required_documents: [''],
        details: [''],
        is_active: true,
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/visa/templates`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            console.log('Templates:', result)
            if (result.success) {
                setTemplates(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err)
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (template) => {
        setEditingId(template.id)
        setEditForm({
            step_number: template.step_number,
            title: template.title,
            description: template.description || '',
            icon: template.icon || '📋',
            required_documents: template.required_documents?.length > 0 ? template.required_documents : [''],
            details: template.details?.length > 0 ? template.details : [''],
        })
    }

    const startAdd = () => {
        setShowAddForm(true)
        setEditForm({ ...emptyForm, step_number: templates.length + 1 })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setShowAddForm(false)
        setEditForm(null)
    }

    const saveEdit = async (id = null) => {
        try {
            setSaving(true)
            const token = localStorage.getItem('token')

            const url = id
                ? `${API_URL}/visa/templates/${id}`
                : `${API_URL}/visa/templates`

            const method = id ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            })
            const result = await response.json()

            if (result.success) {
                if (id) {
                    setTemplates(templates.map(t => t.id === id ? result.data : t))
                } else {
                    setTemplates([...templates, result.data])
                }
                cancelEdit()
                setMessage(id ? 'Step updated!' : 'Step created!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                alert(result.error || 'Failed to save')
            }
        } catch (err) {
            console.error('Failed to save:', err)
        } finally {
            setSaving(false)
        }
    }

    const deleteTemplate = async (id) => {
        if (!confirm('Deactivate this visa step?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/visa/templates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setTemplates(templates.filter(t => t.id !== id))
                setMessage('Step deactivated')
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const addArrayItem = (field) => {
        setEditForm({
            ...editForm,
            [field]: [...(editForm[field] || []), ''],
        })
    }

    const updateArrayItem = (field, index, value) => {
        const arr = [...editForm[field]]
        arr[index] = value
        setEditForm({ ...editForm, [field]: arr })
    }

    const removeArrayItem = (field, index) => {
        const arr = editForm[field].filter((_, i) => i !== index)
        setEditForm({ ...editForm, [field]: arr.length > 0 ? arr : [''] })
    }

    const renderForm = (isNew = false) => (
        <div className="bg-white rounded-2xl border-2 border-indigo-400 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">
                {isNew ? 'Add New Visa Step' : 'Edit Visa Step'}
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Step Number</label>
                    <input type="number" value={editForm.step_number}
                        onChange={(e) => setEditForm({ ...editForm, step_number: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon (emoji)</label>
                    <input type="text" value={editForm.icon}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input type="text" value={editForm.title} required
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
            </div>

            {/* Required Documents */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Required Documents</label>
                {(editForm.required_documents || []).map((doc, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={doc}
                            onChange={(e) => updateArrayItem('required_documents', i, e.target.value)}
                            placeholder="e.g. Passport copy"
                            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                        <button onClick={() => removeArrayItem('required_documents', i)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <FiX size={14} />
                        </button>
                    </div>
                ))}
                <button onClick={() => addArrayItem('required_documents')}
                    className="text-sm text-indigo-600 hover:underline">+ Add Document</button>
            </div>

            {/* Details/Instructions */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Instructions</label>
                {(editForm.details || []).map((detail, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={detail}
                            onChange={(e) => updateArrayItem('details', i, e.target.value)}
                            placeholder="e.g. Visit the official website"
                            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                        <button onClick={() => removeArrayItem('details', i)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <FiX size={14} />
                        </button>
                    </div>
                ))}
                <button onClick={() => addArrayItem('details')}
                    className="text-sm text-indigo-600 hover:underline">+ Add Instruction</button>
            </div>

            <div className="flex gap-2 pt-2">
                <button onClick={() => saveEdit(isNew ? null : editingId)} disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1">
                    {saving ? <FiLoader className="animate-spin" /> : <FiSave size={14} />}
                    {isNew ? 'Create Step' : 'Save Changes'}
                </button>
                <button onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FiLoader className="animate-spin text-4xl text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Visa Steps Management</h2>
                    <p className="text-gray-600 mt-1">Manage visa application process steps and required documents</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchTemplates}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2 text-sm">
                        <FiRefreshCw /> Refresh
                    </button>
                    <button onClick={startAdd}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm">
                        <FiPlus /> Add Step
                    </button>
                </div>
            </div>

            {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 flex items-center gap-2">
                    <FiCheckCircle /> {message}
                </div>
            )}

            {/* Add New Form */}
            {showAddForm && renderForm(true)}

            {/* Existing Steps */}
            <div className="space-y-4">
                {templates.map((template) => (
                    <div key={template.id}>
                        {editingId === template.id ? (
                            renderForm(false)
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                                            {template.icon || '📋'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                    Step {template.step_number}
                                                </span>
                                                {template.is_active && (
                                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FiCheckCircle size={10} /> Active
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{template.description}</p>

                                            {template.required_documents?.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                                        <FiFileText size={12} /> Required Documents:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {template.required_documents.map((doc, i) => (
                                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                                {doc}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {template.details?.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Instructions:</p>
                                                    <ul className="space-y-0.5">
                                                        {template.details.map((detail, i) => (
                                                            <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                                                                <span className="text-indigo-400">•</span> {detail}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => startEdit(template)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteTemplate(template.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">No visa steps defined yet. Click "Add Step" to create one.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisaSteps