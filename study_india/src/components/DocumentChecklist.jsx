import React, { useState } from 'react'
import { FiCheckCircle, FiCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

function DocumentChecklist() {
    const [checkedItems, setCheckedItems] = useState({})

    const documents = [
        "Valid Passport (minimum 6 months validity)",
        "University Admission Letter",
        "Completed Visa Application Form",
        "Passport-size Photographs (4 copies)",
        "Academic Transcripts & Certificates",
        "Proof of Financial Support",
        "Medical Fitness Certificate",
        "English Proficiency Certificate (if applicable)",
        "Character Certificate",
        "Birth Certificate"
    ]

    const toggleCheck = (index) => {
        setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }))
    }

    const completedCount = Object.values(checkedItems).filter(Boolean).length
    const progressPercentage = (completedCount / documents.length) * 100

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Document Checklist</h3>
                <div className="relative h-3 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ type: "spring", stiffness: 60 }}
                    />
                </div>
                <div className="mt-3 flex justify-between items-center text-indigo-100 text-sm font-medium">
                    <span>Progress</span>
                    <span>{completedCount} of {documents.length} prepared</span>
                </div>
            </div>

            <ul className="p-6 space-y-3">
                {documents.map((doc, index) => (
                    <motion.li
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors duration-200 ${checkedItems[index] ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                            } border`}
                        onClick={() => toggleCheck(index)}
                    >
                        <motion.div
                            initial={false}
                            animate={{ scale: checkedItems[index] ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {checkedItems[index] ? (
                                <FiCheckCircle className="text-2xl text-indigo-600" />
                            ) : (
                                <FiCircle className="text-2xl text-gray-400" />
                            )}
                        </motion.div>
                        <span className={`text-gray-700 font-medium ${checkedItems[index] ? 'line-through text-gray-400' : ''}`}>
                            {doc}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </div>
    )
}

export default DocumentChecklist