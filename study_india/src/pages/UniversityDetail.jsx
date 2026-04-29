import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiMapPin, FiClock, FiDollarSign, FiCheckCircle, FiArrowLeft, FiDownload, FiLoader, FiGlobe } from 'react-icons/fi'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL

function UniversityDetail() {
    const { id } = useParams()
    const [university, setUniversity] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchUniversity()
    }, [id])

    const fetchUniversity = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/universities/${id}`)
            const result = await response.json()

            if (result.success && result.data) {
                setUniversity(result.data)
            } else {
                setError('University not found')
            }
        } catch (err) {
            console.error('Failed to fetch university:', err)
            setError('Failed to load university details')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading university details...</p>
                </div>
            </div>
        )
    }

    if (error || !university) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{error || 'University not found'}</h2>
                    <Link to="/universities" className="text-indigo-600 hover:underline">Return to Explorer</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[500px] flex items-end pb-16">
                <div className="absolute inset-0 z-0">
                    <img
                        src={university.image}
                        alt={university.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <Link to="/universities" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium border border-white/10">
                        <FiArrowLeft /> Back to Universities
                    </Link>
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        <div className="w-24 h-24 bg-white rounded-2xl p-3 flex items-center justify-center text-5xl shadow-2xl">
                            {university.logo || '🎓'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{university.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-indigo-100">
                                <span className="flex items-center gap-1.5"><FiMapPin className="text-indigo-400" /> {university.location}</span>
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">{university.type || 'Private'}</span>
                                <span className="bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-purple-400/30">{university.accreditation || 'UGC'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-6 mt-12 grid lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the University</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">{university.description}</p>
                    </section>

                    {/* University Website Section */}
                    {university.website && (
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Official Website</h2>
                                <a
                                    href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm flex items-center gap-2 transition-colors"
                                >
                                    <FiGlobe size={16} /> Visit Website ↗
                                </a>
                            </div>

                            {/* Website Preview Card */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 text-center border border-indigo-100">
                                <FiGlobe className="text-5xl text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Explore {university.name} Online</h3>
                                <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                                    Visit the official university website for detailed information about admissions, campus life, and more.
                                </p>
                                <a
                                    href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-lg shadow-indigo-600/20"
                                >
                                    <FiGlobe /> Open Website
                                </a>
                                <p className="text-xs text-gray-500 mt-3">{university.website}</p>
                            </div>
                        </section>
                    )}

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Campus Facilities</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {university.facilities && university.facilities.length > 0 ? (
                                university.facilities.map((facility, index) => (
                                    <div key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <FiCheckCircle className="text-indigo-500 text-xl" /> {facility}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No facilities listed</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/40 border border-gray-100">
                            <Link to={`/apply/${university.id}`} className="block w-full text-center bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 mb-4">
                                Apply to {university.name}
                            </Link>

                            {/* Download Brochure */}
                            {university.brochure_pdf && (
                                <a
                                    href={`https://nkaempzjiepcjkzqfquh.supabase.co/storage/v1/object/public/EduBridge/${university.brochure_pdf}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full text-center bg-indigo-50 text-indigo-700 py-3.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors mb-3"
                                >
                                    <FiDownload /> Download Brochure
                                </a>
                            )}

                            {/* Download Fees Details */}
                            {university.fees_pdf && (
                                <a
                                    href={`https://nkaempzjiepcjkzqfquh.supabase.co/storage/v1/object/public/EduBridge/${university.fees_pdf}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full text-center bg-green-50 text-green-700 py-3.5 rounded-xl font-bold hover:bg-green-100 transition-colors"
                                >
                                    <FiDownload /> Download Fees Details
                                </a>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Facts</h3>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Ranking', value: university.ranking || 'N/A' },
                                    { label: 'Established', value: university.established || 'N/A' },
                                    { label: 'Type', value: university.type || 'N/A' },
                                    { label: 'Intl. Students', value: `${university.internationalStudents || 0}+` },
                                    { label: 'Placement Rate', value: university.placementRate || 'N/A' }
                                ].map((fact, idx) => (
                                    <li key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-gray-500">{fact.label}</span>
                                        <strong className="text-gray-900">{fact.value}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {university.highlights && university.highlights.length > 0 && (
                            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-lg">
                                <h3 className="text-lg font-bold mb-6">Key Highlights</h3>
                                <ul className="space-y-3">
                                    {university.highlights.map((highlight, index) => (
                                        <li key={index} className="flex items-start gap-3 text-indigo-100 text-sm">
                                            <span className="mt-1 text-orange-400">★</span> {highlight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UniversityDetail