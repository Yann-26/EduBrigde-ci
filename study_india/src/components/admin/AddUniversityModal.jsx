import React, { useState, useEffect } from 'react'
import { FiX, FiLoader, FiImage, FiFileText, FiGlobe, FiDollarSign, FiUploadCloud, FiCheckCircle } from 'react-icons/fi'


function AddUniversityModal({ university, onClose, onSave }) {
    const [loading, setLoading] = useState(false)

    // Initialize form data
    const getInitialFormData = () => {
        if (university) {
            // Use existing university data - preserve ALL fields
            return {
                name: university.name || '',
                location: university.location || '',
                established: university.established || new Date().getFullYear(),
                type: university.type || 'Private',
                accreditation: university.accreditation || 'UGC',
                ranking: university.ranking || '',
                description: university.description || '',
                image: university.image || '',
                logo: university.logo || '🏫',
                website: university.website || '',
                status: university.status || 'active',
                international_students: university.internationalStudents || university.international_students || 0,
                placement_rate: university.placementRate || university.placement_rate || '',
                brochure_pdf: university.brochure_pdf || null,
                fees_pdf: university.fees_pdf || null,
                courses: university.courses || [],
                facilities: university.facilities || [],
                highlights: university.highlights || [],
            }
        }
        // Default for new university
        return {
            name: '',
            location: '',
            established: new Date().getFullYear(),
            type: 'Private',
            accreditation: 'UGC',
            ranking: '',
            description: '',
            image: '',
            logo: '🏫',
            website: '',
            status: 'active',
            international_students: 0,
            placement_rate: '',
            brochure_pdf: null,
            fees_pdf: null,
            courses: [],
            facilities: [],
            highlights: [],
        }
    }

    const [formData, setFormData] = useState(getInitialFormData)

    // Reset form when university prop changes
    useEffect(() => {
        setFormData(getInitialFormData())
    }, [university])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const isEdit = !!university
            const hasBrochureFile = formData.brochure_pdf instanceof File
            const hasFeesFile = formData.fees_pdf instanceof File
            const needsFormData = isEdit && (hasBrochureFile || hasFeesFile)

            if (needsFormData) {
                const fd = new FormData()

                // IMPORTANT: Add the ID first
                if (university?.id) {
                    fd.append('id', university.id)
                }

                Object.keys(formData).forEach(key => {
                    const value = formData[key]
                    if (value === null || value === undefined) return

                    if (key === 'brochure_pdf' && value instanceof File) {
                        fd.append('brochure_pdf', value)
                    } else if (key === 'fees_pdf' && value instanceof File) {
                        fd.append('fees_pdf', value)
                    } else if (!(value instanceof File)) {
                        fd.append(key, value)
                    }
                })

                await onSave(fd, true)
            } else {
                // Send as JSON - include the ID
                const dataToSend = {
                    ...formData,
                    id: university?.id || formData.id // Ensure ID is included
                }

                // Remove file objects
                if (dataToSend.brochure_pdf instanceof File) delete dataToSend.brochure_pdf
                if (dataToSend.fees_pdf instanceof File) delete dataToSend.fees_pdf

                await onSave(dataToSend, false)
            }
        } catch (err) {
            console.error('Submit error:', err)
            alert('Failed to save university')
        } finally {
            setLoading(false)
        }
    }

    // Common emoji logos for universities
    const logoOptions = ['🏫', '🎓', '🏛️', '📚', '🔬', '💡', '🌟', '🎯', '🏆', '✨']

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">
                        {university ? 'Edit University' : 'Add University'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* University Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">University Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Kalinga Institute of Industrial Technology"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Bhubaneswar, Odisha"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Logo Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Emoji</label>
                        <div className="grid grid-cols-5 gap-2 mb-2">
                            {logoOptions.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, logo: emoji })}
                                    className={`text-2xl p-2 rounded-xl border-2 transition-all ${formData.logo === emoji
                                        ? 'border-indigo-500 bg-indigo-50 scale-110'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            name="logo"
                            value={formData.logo}
                            onChange={handleChange}
                            placeholder="Or type custom emoji/text"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiImage size={14} /> University Image URL
                        </label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {formData.image && (
                            <div className="mt-2 relative rounded-xl overflow-hidden h-32 bg-gray-100">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Use a direct image URL (unsplash, etc.) or leave empty for default
                        </p>
                    </div>

                    {/* Website URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FiGlobe size={14} /> Website URL
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://www.university.edu"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Established & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Established</label>
                            <input
                                type="number"
                                name="established"
                                value={formData.established}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                                <option value="Deemed">Deemed</option>
                            </select>
                        </div>
                    </div>

                    {/* Accreditation & Ranking */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
                            <input
                                type="text"
                                name="accreditation"
                                value={formData.accreditation}
                                onChange={handleChange}
                                placeholder="e.g. UGC, NAAC A+"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ranking</label>
                            <input
                                type="text"
                                name="ranking"
                                value={formData.ranking}
                                onChange={handleChange}
                                placeholder="e.g. Top 50 in India"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of the university..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    {/* Intl Students & Placement Rate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Intl. Students</label>
                            <input
                                type="number"
                                name="international_students"
                                value={formData.international_students}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Placement Rate</label>
                            <input
                                type="text"
                                name="placement_rate"
                                value={formData.placement_rate}
                                onChange={handleChange}
                                placeholder="e.g. 85%"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Brochure PDF Upload */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <FiFileText className="text-indigo-500" size={16} /> Brochure (PDF)
                            </label>
                            <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 ${formData.brochure_pdf ? 'border-green-400 bg-green-50/30' : 'border-slate-300 hover:border-indigo-400'}`}>
                                <input
                                    type="file"
                                    name="brochure_pdf"
                                    accept=".pdf"
                                    onChange={(e) => setFormData({ ...formData, brochure_pdf: e.target.files[0] })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />

                                <div className="text-center">
                                    {formData.brochure_pdf ? (
                                        <FiCheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                                    ) : (
                                        <FiUploadCloud size={24} className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                                    )}

                                    <p className="text-sm font-medium text-slate-600">
                                        {formData.brochure_pdf
                                            ? (typeof formData.brochure_pdf === 'string' ? 'Current Brochure Intact' : formData.brochure_pdf.name)
                                            : "Click or drag to upload"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">PDF files only (Max 5MB)</p>
                                </div>
                            </div>
                            {formData.brochure_pdf && typeof formData.brochure_pdf === 'string' && (
                                <p className="text-[11px] text-indigo-600 mt-2 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                                    File already exists on server
                                </p>
                            )}
                        </div>

                        {/* Fees Details PDF Upload */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <FiDollarSign className="text-emerald-500" size={16} /> Fees Details (PDF)
                            </label>
                            <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 ${formData.fees_pdf ? 'border-green-400 bg-green-50/30' : 'border-slate-300 hover:border-emerald-400'}`}>
                                <input
                                    type="file"
                                    name="fees_pdf"
                                    accept=".pdf"
                                    onChange={(e) => setFormData({ ...formData, fees_pdf: e.target.files[0] })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />

                                <div className="text-center">
                                    {formData.fees_pdf ? (
                                        <FiCheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                                    ) : (
                                        <FiUploadCloud size={24} className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                                    )}

                                    <p className="text-sm font-medium text-slate-600">
                                        {formData.fees_pdf
                                            ? (typeof formData.fees_pdf === 'string' ? 'Current Fees PDF Intact' : formData.fees_pdf.name)
                                            : "Click or drag to upload"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">PDF files only (Max 5MB)</p>
                                </div>
                            </div>
                            {formData.fees_pdf && typeof formData.fees_pdf === 'string' && (
                                <p className="text-[11px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    File already exists on server
                                </p>
                            )}
                        </div>
                    </div>

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
                            ) : university ? (
                                'Save Changes'
                            ) : (
                                'Add University'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUniversityModal