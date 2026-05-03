import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiSave, FiArrowLeft, FiChevronRight, FiChevronLeft, FiCheck, FiUploadCloud, FiCheckCircle, FiX, FiSearch } from 'react-icons/fi'
import UniversityStepper from '../../components/admin/UniversityStepper'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function AddUniversity() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Course selection states
    const [allCourses, setAllCourses] = useState([])
    const [selectedCourseIds, setSelectedCourseIds] = useState([])
    const [courseSearch, setCourseSearch] = useState('')
    const [courseProgramFilter, setCourseProgramFilter] = useState('all')

    const [formData, setFormData] = useState({
        name: '', location: '', established: new Date().getFullYear(),
        type: 'Private', accreditation: 'UGC', ranking: '',
        description: '', image: '', logo: '🏫', website: '',
        status: 'active', international_students: 0, placement_rate: '',
        brochure_pdf: null, fees_pdf: null,
    })

    useEffect(() => {
        if (isEditing) fetchUniversity()
        fetchAllCourses()
    }, [id])

    const fetchUniversity = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/universities/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            const result = await response.json()
            if (result.success) {
                const uni = result.data
                setFormData({
                    name: uni.name || '', location: uni.location || '',
                    established: uni.established || new Date().getFullYear(),
                    type: uni.type || 'Private', accreditation: uni.accreditation || 'UGC',
                    ranking: uni.ranking || '', description: uni.description || '',
                    image: uni.image || '', logo: uni.logo || '🏫', website: uni.website || '',
                    status: uni.status || 'active', international_students: uni.internationalStudents || uni.international_students || 0,
                    placement_rate: uni.placementRate || uni.placement_rate || '',
                    brochure_pdf: uni.brochure_pdf || null, fees_pdf: uni.fees_pdf || null,
                })
                // Fetch selected courses
                fetchUniversityCourses(id)
            }
        } catch (err) { console.error(err) }
    }

    const fetchUniversityCourses = async (uniId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/universities/${uniId}/courses`, { headers: { Authorization: `Bearer ${token}` } })
            const result = await response.json()
            if (result.success) {
                setSelectedCourseIds((result.data || []).map(uc => uc.course_id))
            }
        } catch (err) { console.error(err) }
    }

    const fetchAllCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/courses`)
            const result = await response.json()
            if (result.success) {
                // Flatten all courses from categories
                const courses = []
                    ; (result.data || []).forEach(cat => {
                        (cat.courses || []).forEach(c => {
                            courses.push({ ...c, department: cat.department, program_level: cat.program_level })
                        })
                    })
                setAllCourses(courses)
            }
        } catch (err) { console.error(err) }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (field) => (e) => {
        const file = e.target.files[0]
        if (file) setFormData(prev => ({ ...prev, [field]: file }))
    }

    const toggleCourse = (courseId) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(c => c !== courseId) : [...prev, courseId]
        )
    }

    const selectAllCourses = () => {
        const filteredIds = filteredCourses.map(c => c.id)
        if (filteredIds.every(id => selectedCourseIds.includes(id))) {
            setSelectedCourseIds(selectedCourseIds.filter(id => !filteredIds.includes(id)))
        } else {
            setSelectedCourseIds([...new Set([...selectedCourseIds, ...filteredIds])])
        }
    }

    const filteredCourses = allCourses.filter(c => {
        const matchesSearch = !courseSearch || c.name.toLowerCase().includes(courseSearch.toLowerCase()) || (c.department || '').toLowerCase().includes(courseSearch.toLowerCase())
        const matchesProgram = courseProgramFilter === 'all' || c.program_level === courseProgramFilter
        return matchesSearch && matchesProgram
    })

    const goToStep = (step) => {
        setCurrentStep(step)
        if (!completedSteps.includes(step - 1) && step > 1) {
            setCompletedSteps(prev => [...new Set([...prev, step - 1])])
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')

            // Save university
            const uniData = { ...formData }
            delete uniData.brochure_pdf_file
            delete uniData.fees_pdf_file

            const url = isEditing ? `${API_URL}/universities/${id}` : `${API_URL}/universities`
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(uniData),
            })
            const result = await response.json()

            if (result.success) {
                const uniId = result.data.id || id

                // Save course selections
                await fetch(`${API_URL}/universities/${uniId}/courses`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courseIds: selectedCourseIds }),
                })

                setCompletedSteps([1, 2, 3, 4, 5])
                setTimeout(() => navigate('/admin'), 1000)
            } else {
                alert(result.error || 'Failed to save')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to save university')
        } finally {
            setSaving(false)
        }
    }

    const getImagePreview = () => {
        if (!formData.image) return null
        if (formData.image instanceof File) return URL.createObjectURL(formData.image)
        if (typeof formData.image === 'string' && formData.image.startsWith('http')) return formData.image
        if (typeof formData.image === 'string') return `https://nkaempzjiepcjkzqfquh.supabase.co/storage/v1/object/public/EduBridge/${formData.image}`
        return null
    }

    const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"

    const logoOptions = ['🏫', '🎓', '🏛️', '📚', '🔬', '💡', '🌟', '🎯', '🏆', '✨']

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium">
                        <FiArrowLeft /> Back to Dashboard
                    </Link>
                    <button onClick={handleSave} disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50">
                        {saving ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</> : <><FiSave /> {isEditing ? 'Update' : 'Create'} University</>}
                    </button>
                </div>

                {/* Stepper */}
                <UniversityStepper currentStep={currentStep} completedSteps={completedSteps} isEditing={isEditing} />

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">

                    {/* STEP 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University Name *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="e.g. Kalinga Institute of Industrial Technology" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className={inputClasses} placeholder="e.g. Bhubaneswar, Odisha" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                                    <input type="number" name="established" value={formData.established} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                                        <option value="Private">Private</option>
                                        <option value="Public">Public</option>
                                        <option value="Deemed">Deemed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation</label>
                                    <input type="text" name="accreditation" value={formData.accreditation} onChange={handleChange} className={inputClasses} placeholder="e.g. UGC, NAAC A+" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
                                    <input type="text" name="ranking" value={formData.ranking} onChange={handleChange} className={inputClasses} placeholder="e.g. Top 50 in India" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClasses} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClasses + " resize-none"} placeholder="Brief description..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Intl. Students</label>
                                    <input type="number" name="international_students" value={formData.international_students} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Placement Rate</label>
                                    <input type="text" name="placement_rate" value={formData.placement_rate} onChange={handleChange} className={inputClasses} placeholder="e.g. 85%" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Media */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Media & Branding</h3>

                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Emoji</label>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-2">
                                    {logoOptions.map(emoji => (
                                        <button key={emoji} type="button" onClick={() => setFormData(p => ({ ...p, logo: emoji }))}
                                            className={`text-2xl p-2 rounded-xl border-2 transition-all ${formData.logo === emoji ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>{emoji}</button>
                                    ))}
                                </div>
                                <input type="text" name="logo" value={formData.logo} onChange={handleChange} placeholder="Or custom text" className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">University Image</label>
                                {getImagePreview() && (
                                    <div className="mb-3 rounded-xl overflow-hidden h-48 bg-gray-100">
                                        <img src={getImagePreview()} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${formData.image ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}`}>
                                    <input type="file" accept="image/*" onChange={handleFileChange('image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {formData.image ? <FiCheckCircle size={24} className="mx-auto text-green-500 mb-2" /> : <FiUploadCloud size={24} className="mx-auto text-gray-400 mb-2" />}
                                    <p className="text-sm text-gray-600">{formData.image ? (formData.image instanceof File ? formData.image.name : 'Click to change') : 'Click to upload image'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Academics */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                                    <input type="number" name="established" value={formData.established} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation</label>
                                    <input type="text" name="accreditation" value={formData.accreditation} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
                                    <input type="text" name="ranking" value={formData.ranking} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Placement Rate</label>
                                    <input type="text" name="placement_rate" value={formData.placement_rate} onChange={handleChange} className={inputClasses} placeholder="e.g. 85%" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Intl. Students</label>
                                    <input type="number" name="international_students" value={formData.international_students} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Course Selection */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select Courses</h3>
                            <p className="text-gray-600 text-sm mb-4">Choose which courses this university offers. Students will see only these courses when applying.</p>

                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Search courses..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <select value={courseProgramFilter} onChange={e => setCourseProgramFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-gray-50 border rounded-xl text-sm">
                                    <option value="all">All Programs</option>
                                    <option value="graduate">Graduate</option>
                                    <option value="postgraduate">Postgraduate</option>
                                    <option value="diploma">Diploma</option>
                                    <option value="doctoral">Doctoral</option>
                                </select>
                                <button onClick={selectAllCourses} className="px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-200">
                                    {filteredCourses.every(c => selectedCourseIds.includes(c.id)) ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-2">{selectedCourseIds.length} course(s) selected</p>

                            <div className="max-h-96 overflow-y-auto border rounded-xl divide-y">
                                {filteredCourses.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No courses found</p>
                                ) : (
                                    filteredCourses.map(course => (
                                        <label key={course.id} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCourseIds.includes(course.id) ? 'bg-indigo-50' : ''}`}>
                                            <input type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => toggleCourse(course.id)}
                                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                                                <p className="text-xs text-gray-500">{course.department} • {course.duration} • {course.program_level}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Documents */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Documents</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Brochure (PDF)</label>
                                    <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${formData.brochure_pdf ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}`}>
                                        <input type="file" accept=".pdf" onChange={handleFileChange('brochure_pdf')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        {formData.brochure_pdf ? <FiCheckCircle size={24} className="mx-auto text-green-500 mb-2" /> : <FiUploadCloud size={24} className="mx-auto text-gray-400 mb-2" />}
                                        <p className="text-sm text-gray-600">{formData.brochure_pdf ? (typeof formData.brochure_pdf === 'string' ? 'Current Brochure' : formData.brochure_pdf.name) : 'Upload Brochure PDF'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Fees Details (PDF)</label>
                                    <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${formData.fees_pdf ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-emerald-400 bg-gray-50'}`}>
                                        <input type="file" accept=".pdf" onChange={handleFileChange('fees_pdf')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        {formData.fees_pdf ? <FiCheckCircle size={24} className="mx-auto text-green-500 mb-2" /> : <FiUploadCloud size={24} className="mx-auto text-gray-400 mb-2" />}
                                        <p className="text-sm text-gray-600">{formData.fees_pdf ? (typeof formData.fees_pdf === 'string' ? 'Current Fees PDF' : formData.fees_pdf.name) : 'Upload Fees PDF'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button onClick={() => goToStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2">
                        <FiChevronLeft /> Previous
                    </button>
                    {currentStep < 5 ? (
                        <button onClick={() => goToStep(currentStep + 1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2">
                            Next <FiChevronRight />
                        </button>
                    ) : (
                        <button onClick={handleSave} disabled={saving}
                            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-600/20">
                            {saving ? 'Saving...' : <><FiSave /> {isEditing ? 'Update University' : 'Create University'}</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddUniversity