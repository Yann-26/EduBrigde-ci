import React, { useState, useEffect } from 'react'
import { FiSearch, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { universitiesAPI } from '../services/api'
import UniversityCard from '../components/UniversityCard'

function Universities() {
    const [universities, setUniversities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')

    useEffect(() => {
        fetchUniversities()
    }, [])

    const fetchUniversities = async () => {
        try {
            setLoading(true)
            const response = await universitiesAPI.getAll()
            console.log('API Response:', response) // Debug log

            // Handle different response formats
            const data = response.data || response.universities || response

            if (Array.isArray(data)) {
                setUniversities(data)
            } else {
                console.error('Unexpected data format:', data)
                setError('Invalid data format received')
            }
        } catch (error) {
            console.error('Failed to fetch universities:', error)
            setError(error.message || 'Failed to load universities')
        } finally {
            setLoading(false)
        }
    }

    const filteredUniversities = universities.filter(uni => {
        const matchesSearch = uni.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            uni.location?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' || uni.type?.toLowerCase() === filterType
        return matchesSearch && matchesType
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading universities...</p>
                </div>
            </div>
        )
    }

    if (error && universities.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchUniversities}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Explore <span className="text-indigo-600">Universities</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-10">
                        Find the perfect university for your academic journey in India
                    </p>

                    {/* Search and Filter Container */}
                    <div className="bg-white p-2 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-gray-700 font-medium placeholder-gray-400 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex p-2 gap-2 bg-gray-50 rounded-2xl md:w-auto w-full overflow-x-auto">
                            {['all', 'private', 'public', 'deemed'].map(type => (
                                <button
                                    key={type}
                                    className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${filterType === type
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                        : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                    onClick={() => setFilterType(type)}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredUniversities.map(university => (
                            <motion.div
                                key={university.id || university._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <UniversityCard university={university} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredUniversities.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white rounded-3xl border border-gray-100 mt-8"
                    >
                        <span className="text-6xl block mb-4">🔍</span>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No universities found</h3>
                        <p className="text-gray-500">
                            {universities.length === 0
                                ? 'No universities available. Please check your connection.'
                                : 'Try adjusting your search or filter criteria'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Universities