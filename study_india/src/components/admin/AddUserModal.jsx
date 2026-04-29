import React, { useState } from 'react'
import { FiX, FiLoader, FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi'

function AddUserModal({ user, onClose, onSave }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(user || {
        name: '',
        email: '',
        password: '',
        role: 'editor',
        status: 'active'
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate password for new users
        if (!user && (!formData.password || formData.password.length < 6)) {
            alert('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            await onSave(formData)
        } catch (err) {
            console.error('Save failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const roleOptions = [
        { value: 'super_admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
        { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-800' },
        { value: 'editor', label: 'Editor', color: 'bg-green-100 text-green-800' },
        { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                        {user ? 'Edit User' : 'Add New User'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="user@example.com"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Password (only for new users) */}
                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!user}
                                    placeholder="Min. 6 characters"
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="grid grid-cols-2 gap-2">
                            {roleOptions.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: role.value })}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${formData.role === role.value
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <FiShield className="inline mr-1" size={14} />
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status (only for editing) */}
                    {user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 'active' })}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${formData.status === 'active'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-white text-gray-600'
                                        }`}
                                >
                                    ✅ Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${formData.status === 'inactive'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 bg-white text-gray-600'
                                        }`}
                                >
                                    ❌ Inactive
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <><FiLoader className="animate-spin" /> Saving...</>
                            ) : user ? (
                                'Save Changes'
                            ) : (
                                'Add User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUserModal