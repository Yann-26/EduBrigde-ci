import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiBookOpen, FiMapPin,
    FiUsers, FiGlobe, FiLoader, FiRefreshCw
} from 'react-icons/fi'
import ConfirmModal from '../../components/admin/ConfirmModal'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function Universities() {
    const [universities, setUniversities] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUniversity, setSelectedUniversity] = useState(null)
    const [editingUniversity, setEditingUniversity] = useState(null)

    useEffect(() => {
        fetchUniversities()
    }, [])

    const fetchUniversities = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/universities`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            if (result.success) {
                setUniversities(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch universities:', err)
        } finally {
            setLoading(false)
        }
    }

    const addUniversity = async (data, isFormData = false) => {
        try {
            const token = localStorage.getItem('token')

            const url = `${API_URL}/universities`
            let options

            if (isFormData) {
                // FormData for file uploads
                options = {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: data, // FormData directly
                }
            } else {
                // JSON for simple text fields
                const bodyData = {
                    name: data.name,
                    location: data.location,
                    description: data.description,
                    established: parseInt(data.established) || new Date().getFullYear(),
                    type: data.type || 'Private',
                    accreditation: data.accreditation || 'UGC',
                    ranking: data.ranking || '',
                    image: data.image || null,
                    logo: data.logo || '🏫',
                    website: data.website || null,
                    status: data.status || 'active',
                    international_students: parseInt(data.international_students) || 0,
                    placement_rate: data.placement_rate || '',
                }

                options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(bodyData),
                }
            }

            console.log('Adding university, isFormData:', isFormData)

            const response = await fetch(url, options)
            const text = await response.text()
            console.log('Response:', text)

            let result
            try {
                result = JSON.parse(text)
            } catch (e) {
                console.error('Failed to parse:', text)
                throw new Error('Server returned invalid response')
            }

            if (result.success) {
                setUniversities([...universities, result.data])
                setShowAddModal(false)
                alert('University added successfully!')
            } else {
                alert(result.error || 'Failed to add university')
            }
        } catch (err) {
            console.error('Failed to add university:', err)
            alert('Failed to add university: ' + err.message)
        }
    }

    const updateUniversity = async (data, isFormData = false) => {
        try {
            const token = localStorage.getItem('token')

            // Get the university ID
            let universityId = null

            if (isFormData) {
                universityId = data.get('id') || editingUniversity?.id
            } else {
                universityId = data.id || editingUniversity?.id
            }

            console.log('🔄 Updating university:', universityId)
            console.log('📋 Editing university object:', editingUniversity)
            console.log('📦 Data received:', data)

            if (!universityId) {
                console.error('❌ No university ID found!')
                alert('Error: University ID not found. Please try again.')
                return
            }

            const url = `${API_URL}/universities/${universityId}`
            const options = {
                method: 'PUT',
                headers: {
                    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                    Authorization: `Bearer ${token}`,
                },
                body: isFormData ? data : JSON.stringify(data),
            }

            const response = await fetch(url, options)
            const result = await response.json()

            console.log('📡 Update response:', result)

            if (result.success) {
                setUniversities(universities.map(u =>
                    u.id === universityId ? { ...u, ...result.data } : u
                ))
                setEditingUniversity(null)
                alert('University updated successfully!')
                fetchUniversities()
            } else {
                alert(result.error || 'Failed to update university')
            }
        } catch (err) {
            console.error('❌ Failed to update university:', err)
            alert('Failed to update university')
        }
    }

    const deleteUniversity = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/universities/${selectedUniversity.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            if (result.success) {
                setUniversities(universities.filter(u => u.id !== selectedUniversity.id))
            }
        } catch (err) {
            console.error('Failed to delete university:', err)
        } finally {
            setShowDeleteModal(false)
            setSelectedUniversity(null)
        }
    }

    const filteredUniversities = universities.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading universities...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Universities</h2>
                    <p className="text-gray-600 mt-1">Manage partner universities and their programs</p>
                </div>
                <Link to="/admin/universities/add" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2">
                    <FiPlus /> Add University
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Universities', value: universities.length, icon: <FiBookOpen />, color: 'bg-blue-500' },
                    { label: 'Active', value: universities.filter(u => u.status === 'active').length, icon: <FiBookOpen />, color: 'bg-green-500' },
                    { label: 'Private', value: universities.filter(u => u.type === 'Private').length, icon: <FiUsers />, color: 'bg-purple-500' },
                    { label: 'Locations', value: [...new Set(universities.map(u => u.location))].length, icon: <FiGlobe />, color: 'bg-orange-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-4">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search and Refresh */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search universities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button
                    onClick={fetchUniversities}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2"
                >
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            {/* Universities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUniversities.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                        No universities found
                    </div>
                ) : (
                    filteredUniversities.map(university => (
                        <div key={university.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                                    {university.logo || '🏫'}
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/admin/universities/${university.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                        <FiEdit2 size={16} />
                                    </Link>
                                    <button onClick={() => { setSelectedUniversity(university); setShowDeleteModal(true) }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{university.name}</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiMapPin size={14} />
                                    <span>{university.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiBookOpen size={14} />
                                    <span>{university.accreditation || 'UGC'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiUsers size={14} />
                                    <span>{university.international_students || 0}+ International Students</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${university.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {university.status}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                        {university.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Universities