import React, { useState, useEffect } from 'react'
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser, FiShield,
    FiMail, FiCalendar, FiUserCheck, FiUserX, FiLoader, FiRefreshCw
} from 'react-icons/fi'
import AddUserModal from '../../components/admin/AddUserModal'
import ConfirmModal from '../../components/admin/ConfirmModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [editingUser, setEditingUser] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success && result.data) {
                setUsers(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoading(false)
        }
    }

    const addUser = async (newUser) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newUser),
            })
            const result = await response.json()

            if (result.success) {
                setUsers([result.data, ...users])
                setShowAddModal(false)
            } else {
                alert(result.error || 'Failed to create user')
            }
        } catch (err) {
            console.error('Failed to create user:', err)
        }
    }

    const updateUser = async (updatedUser) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/${updatedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedUser),
            })
            const result = await response.json()

            if (result.success) {
                setUsers(users.map(u => u.id === updatedUser.id ? result.data : u))
                setEditingUser(null)
            } else {
                alert(result.error || 'Failed to update user')
            }
        } catch (err) {
            console.error('Failed to update user:', err)
        }
    }

    const deleteUser = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setUsers(users.filter(u => u.id !== selectedUser.id))
            } else {
                alert(result.error || 'Failed to delete user')
            }
        } catch (err) {
            console.error('Failed to delete user:', err)
        } finally {
            setShowDeleteModal(false)
            setSelectedUser(null)
        }
    }

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            })
            const result = await response.json()

            if (result.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
            }
        } catch (err) {
            console.error('Failed to toggle status:', err)
        }
    }

    const filteredUsers = users.filter(u => {
        const search = searchTerm.toLowerCase()
        const matchesSearch = !searchTerm ||
            (u.name || '').toLowerCase().includes(search) ||
            (u.email || '').toLowerCase().includes(search)
        const matchesRole = roleFilter === 'all' || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const activeUsers = users.filter(u => u.status === 'active').length
    const inactiveUsers = users.filter(u => u.status === 'inactive').length
    const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600 mt-1">Manage admin users and their permissions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2"
                >
                    <FiPlus /> Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: users.length, icon: <FiUser />, color: 'bg-blue-500' },
                    { label: 'Active Users', value: activeUsers, icon: <FiUserCheck />, color: 'bg-green-500' },
                    { label: 'Inactive', value: inactiveUsers, icon: <FiUserX />, color: 'bg-red-500' },
                    { label: 'Admins', value: adminUsers, icon: <FiShield />, color: 'bg-purple-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-4">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    <button onClick={fetchUsers} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2">
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">User</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Last Login</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Joined</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-semibold">
                                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                    user.role === 'editor' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.status)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {user.status}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowDeleteModal(true) }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSave={addUser}
                />
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <AddUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={updateUser}
                />
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && selectedUser && (
                <ConfirmModal
                    title="Delete User"
                    message={`Are you sure you want to delete user "${selectedUser.name}"? This action cannot be undone.`}
                    onConfirm={deleteUser}
                    onCancel={() => { setShowDeleteModal(false); setSelectedUser(null) }}
                />
            )}
        </div>
    )
}

export default Users