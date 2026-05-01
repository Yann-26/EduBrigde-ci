import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiUploadCloud, FiCheck, FiArrowLeft, FiMessageCircle, FiLoader, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function Apply() {
    const { universityId } = useParams()
    const navigate = useNavigate()
    const { user, loading: authLoading, getToken } = useAuth()

    const [university, setUniversity] = useState(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [hasApplied, setHasApplied] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(`/login?redirect=/apply/${universityId}`)
            return
        }
        if (user) {
            fetchUniversity()
            checkExistingApplication()
        }
    }, [user, authLoading, universityId])

    const fetchUniversity = async () => {
        try {
            const response = await fetch(`${API_URL}/universities/${universityId}`)
            const result = await response.json()
            if (result.success && result.data) {
                setUniversity(result.data)
            }
        } catch (err) {
            console.error('Failed to fetch university:', err)
        } finally {
            setPageLoading(false)
        }
    }

    const checkExistingApplication = async () => {
        try {
            const token = getToken()
            const response = await fetch(`${API_URL}/applications?search=${user.email}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success && result.data) {
                // Check if user already applied to this university
                const existing = result.data.find(
                    app => app.university_id === universityId || app.university?.id === universityId
                )
                if (existing) {
                    setHasApplied(true)
                    setError(`You have already applied to ${university?.name || 'this university'}. Application ID: ${existing.application_id || existing.applicationId}`)
                }
            }
        } catch (err) {
            console.error('Failed to check existing applications:', err)
        }
    }

    const [formData, setFormData] = useState({
        name: '',
        country: '',
        phone: '',
        email: '',
        course: '',
        university: universityId || '',
        educationLevel: ''
    })

    const [files, setFiles] = useState({
        passport: null,
        bepc: null,
        bac: null,
        birthCertificate: null,
        healthCertificate: null,
        collegeL1S1: null,
        collegeL1S2: null,
        collegeL2S1: null,
        collegeL2S2: null,
        collegeL3S1: null,
        collegeL3S2: null,
        other: null
    })


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] })
    }

    const inputClasses = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium text-gray-700 outline-none"

    const isMasterApplication = (course) => {
        return course.toLowerCase().includes('master') || course.toLowerCase().includes('m.sc') || course.toLowerCase().includes('mba')
    }

    const handleCourseChange = (e) => {
        const course = e.target.value
        setFormData({
            ...formData,
            course: course,
            educationLevel: isMasterApplication(course) ? 'master' : 'bachelor'
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (hasApplied) {
            setError('You have already applied to this university.')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const token = getToken()
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name || user.name)
            formDataToSend.append('email', formData.email || user.email)
            formDataToSend.append('phone', formData.phone)
            formDataToSend.append('country', formData.country)
            formDataToSend.append('university', formData.university)
            formDataToSend.append('course', formData.course)

            // Add all documents
            Object.keys(files).forEach(docName => {
                if (files[docName]) {
                    formDataToSend.append('documents', files[docName])
                    formDataToSend.append('documentNames', docName)
                }
            })

            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataToSend,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit application')
            }

            setSuccess(`Application submitted successfully! Your Application ID: ${result.data.applicationId}`)
            setTimeout(() => navigate('/universities'), 3000)

        } catch (err) {
            setError(err.message || 'Failed to submit application')
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <FiLoader className="animate-spin text-4xl text-indigo-600" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
                    <FiLock className="text-4xl text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-4">Please login to submit your application.</p>
                    <Link to={`/login?redirect=/apply/${universityId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    const courses = university?.courses
        ? (typeof university.courses === 'string' ? JSON.parse(university.courses) : university.courses)
        : []

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <Link to="/universities" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-8">
                    <FiArrowLeft /> Back to Universities
                </Link>

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 mb-3">
                        Apply to <span className="text-indigo-600">{university?.name || 'University'}</span>
                    </h1>
                    <p className="text-gray-600 text-lg">Secure your future. Fill in your details below.</p>
                </div>

                {success && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                        <FiCheck className="text-green-500 text-2xl" />
                        <p className="text-green-800 font-medium">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Personal Information */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Personal Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                <input type="text" name="name" required placeholder="John Doe" className={inputClasses} onChange={handleChange} value={formData.name} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                                <input type="email" name="email" required placeholder="john@example.com" className={inputClasses} onChange={handleChange} value={formData.email} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone / WhatsApp *</label>
                                <input type="tel" name="phone" required placeholder="+XXX XXX XXX XXX" className={inputClasses} onChange={handleChange} value={formData.phone} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Country *</label>
                                <select name="country" required className={inputClasses} onChange={handleChange} value={formData.country}>
                                    <option value="">Select your country</option>
                                    <option value="Ivory Coast">Ivory Coast</option>
                                    <option value="Nigeria">Nigeria</option>
                                    <option value="Ghana">Ghana</option>
                                    <option value="Kenya">Kenya</option>
                                    <option value="South Africa">South Africa</option>
                                    <option value="Zambia">Zambia</option>
                                    <option value="Ethiopia">Ethiopia</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Target Course *</label>
                                {courses.length > 0 ? (
                                    <select name="course" required className={inputClasses} onChange={handleCourseChange} value={formData.course}>
                                        <option value="">Select a course</option>
                                        {courses.map((course, idx) => (
                                            <option key={idx} value={course.name}>{course.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text" name="course" required placeholder="E.g. B.Tech Computer Science" className={inputClasses} onChange={handleChange} value={formData.course} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Documents Upload */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">PDF, JPG, PNG (Max 5MB)</span>
                        </div>

                        {/* Required Documents */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3>
                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            {[
                                { name: 'passport', label: 'Passport Copy *', required: true },
                                { name: 'birthCertificate', label: 'Birth Certificate *', required: true },
                                { name: 'healthCertificate', label: 'Health Certificate *', required: true },
                            ].map((field) => (
                                <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                    <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required={field.required} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {files[field.name] ? (
                                        <div className="text-green-600 flex flex-col items-center">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2"><FiCheck className="text-xl" /></div>
                                            <span className="font-bold text-sm">File Ready</span>
                                            <span className="text-xs text-green-500 mt-1">{files[field.name].name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 flex flex-col items-center">
                                            <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                                            <span className="font-semibold text-sm text-gray-700">{field.label}</span>
                                            <span className="text-xs mt-1">Click or drag to upload</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Bachelor Documents */}
                        {formData.educationLevel !== 'master' && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">High School Documents (Second to Terminale)</h3>
                                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                    {[
                                        { name: 'bac', label: 'BAC Certificate / Transcript *', required: true },
                                        { name: 'bepc', label: 'BEPC Certificate *', required: true },
                                    ].map((field) => (
                                        <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                            <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required={field.required} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {files[field.name] ? (
                                                <div className="text-green-600 flex flex-col items-center">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2"><FiCheck className="text-xl" /></div>
                                                    <span className="font-bold text-sm">File Ready</span>
                                                    <span className="text-xs text-green-500 mt-1">{files[field.name].name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 flex flex-col items-center">
                                                    <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                                                    <span className="font-semibold text-sm text-gray-700">{field.label}</span>
                                                    <span className="text-xs mt-1">Click or drag to upload</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Master Documents */}
                        {formData.educationLevel === 'master' && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">College Documents (Licence 1 to Licence 3 - 6 Marksheets)</h3>

                                {['L1', 'L2', 'L3'].map((level, i) => (
                                    <div key={level}>
                                        <h4 className="text-md font-medium text-indigo-600 mb-3">Licence {i + 1} ({level})</h4>
                                        <div className="grid sm:grid-cols-2 gap-6 mb-6">
                                            {[
                                                { name: `college${level}S1`, label: `${level} - Semester 1 Marksheet *`, required: true },
                                                { name: `college${level}S2`, label: `${level} - Semester 2 Marksheet *`, required: true },
                                            ].map((field) => (
                                                <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                                    <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required={field.required} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    {files[field.name] ? (
                                                        <div className="text-green-600 flex flex-col items-center">
                                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2"><FiCheck className="text-xl" /></div>
                                                            <span className="font-bold text-sm">File Ready</span>
                                                            <span className="text-xs text-green-500 mt-1">{files[field.name].name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500 flex flex-col items-center">
                                                            <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                                                            <span className="font-semibold text-sm text-gray-700">{field.label}</span>
                                                            <span className="text-xs mt-1">Click or drag to upload</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <h4 className="text-md font-medium text-indigo-600 mb-3">Additional Required Document</h4>
                                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                    <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files.bac ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                        <input type="file" name="bac" accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        {files.bac ? (
                                            <div className="text-green-600 flex flex-col items-center">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2"><FiCheck className="text-xl" /></div>
                                                <span className="font-bold text-sm">File Ready</span>
                                                <span className="text-xs text-green-500 mt-1">{files.bac.name}</span>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 flex flex-col items-center">
                                                <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                                                <span className="font-semibold text-sm text-gray-700">BAC Certificate *</span>
                                                <span className="text-xs mt-1">Click or drag to upload</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Additional Documents */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Documents (Optional)</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files.other ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                <input type="file" name="other" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {files.other ? (
                                    <div className="text-green-600 flex flex-col items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2"><FiCheck className="text-xl" /></div>
                                        <span className="font-bold text-sm">Additional docs uploaded</span>
                                        <span className="text-xs text-green-500 mt-1">{files.other.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 flex flex-col items-center">
                                        <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                                        <span className="font-semibold text-sm text-gray-700">Other Documents</span>
                                        <span className="text-xs mt-1">Recommendation letters, certificates, etc.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Application Fee */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 md:p-10 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Application Fee</h2>
                            <p className="text-emerald-100 mb-4">Complete your application by paying the processing fee.</p>
                            <div className="text-3xl font-black bg-white/20 inline-block px-4 py-2 rounded-xl backdrop-blur-sm">XOF75</div>
                        </div>
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="bg-white text-emerald-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-3 w-full md:w-auto justify-center">
                            <FiMessageCircle className="text-2xl" /> Pay via WhatsApp
                        </a>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white text-xl font-bold py-5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {submitting ? (<><FiLoader className="animate-spin" /> Submitting...</>) : ('🎓 Submit Application')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Apply