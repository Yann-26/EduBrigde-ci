import React from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiStar, FiUsers, FiAward } from 'react-icons/fi'
import { motion } from 'framer-motion'

function UniversityCard({ university }) {
    // Safely parse courses
    let courses = []
    try {
        if (typeof university.courses === 'string') {
            courses = JSON.parse(university.courses)
        } else if (Array.isArray(university.courses)) {
            courses = university.courses
        }
    } catch (e) {
        courses = []
    }
    const getImageUrl = (imagePath) => {
        // Convert to string
        const path = String(imagePath)

        if (path.startsWith('http')) return path

        return `https://nkaempzjiepcjkzqfquh.supabase.co/storage/v1/object/public/EduBridge/${path}`
    }

    // Fallback image
    const imageUrl = getImageUrl(university.image)
    const logoEmoji = university.logo || '🎓'
    const type = university.type || 'Private'
    const ranking = university.ranking || 'N/A'
    const accreditation = university.accreditation || 'UGC'
    const internationalStudents = university.international_students || university.internationalStudents || 0

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
        >
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10" />
                <img
                    src={imageUrl}
                    alt={university.name || 'University'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                // onError={(e) => {
                //     e.target.onerror = null
                //     e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600'
                // }}
                />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                    {type}
                </div>
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-lg flex items-center justify-center text-2xl">
                        {logoEmoji}
                    </div>
                    <h3 className="text-xl font-bold text-white line-clamp-1">
                        {university.name || 'University'}
                    </h3>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-3 font-medium">
                    <FiMapPin className="text-indigo-500 shrink-0" />
                    <span className="line-clamp-1">{university.location || 'Location'}</span>
                </p>
                <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">
                    {university.description || 'No description available.'}
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 mb-6 py-4 border-y border-gray-100">
                    <div className="text-center">
                        <FiStar className="text-yellow-400 mx-auto mb-1 text-lg" />
                        <span className="text-xs font-bold text-gray-700">{ranking}</span>
                    </div>
                    <div className="text-center">
                        <FiAward className="text-purple-400 mx-auto mb-1 text-lg" />
                        <span className="text-xs font-bold text-gray-700 line-clamp-1">{accreditation}</span>
                    </div>
                </div>

                {/* Courses Preview */}
                {courses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {courses.slice(0, 2).map((course, idx) => (
                            <span key={idx} className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1.5 rounded-full font-medium">
                                {course.name || course}
                            </span>
                        ))}
                        {courses.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium">
                                +{courses.length - 2} more
                            </span>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Link
                        to={`/university/${university.id}`}
                        className="text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        Details
                    </Link>
                    <Link
                        to={`/apply/${university.id}`}
                        className="text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

export default UniversityCard