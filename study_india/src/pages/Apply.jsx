import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiUploadCloud, FiCheck, FiArrowLeft, FiLoader, FiLock, FiCreditCard, FiAlertCircle, FiChevronLeft, FiChevronRight, FiCheckCircle, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import Stepper from '../components/Stepper'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function Apply() {
    const { universityId } = useParams()
    const navigate = useNavigate()
    const { user, loading: authLoading, getToken } = useAuth()

    // Stepper state
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState([])

    const [university, setUniversity] = useState(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [hasApplied, setHasApplied] = useState(false)

    // Payment states
    const [paymentReference, setPaymentReference] = useState(null)
    const [paymentVerified, setPaymentVerified] = useState(false)
    const [checkingPayment, setCheckingPayment] = useState(false)
    const [paystackLoading, setPaystackLoading] = useState(false)

    // 
    const [courseCategories, setCourseCategories] = useState([])
    const [showCourseTable, setShowCourseTable] = useState(false)


    const [formData, setFormData] = useState({
        name: '', country: '', phone: '', email: '', course: '', university: universityId || '', educationLevel: ''
    })

    const [files, setFiles] = useState({
        passport: null, bepc: null, bac: null, birthCertificate: null, healthCertificate: null,
        collegeL1S1: null, collegeL1S2: null, collegeL2S1: null, collegeL2S2: null,
        collegeL3S1: null, collegeL3S2: null, other: null,
        highSchool2nd: null, highSchool1st: null, highSchoolTerminale: null,
        bachelorDegree: null, highSchoolTranscript: null, diplomaCertificate: null,
        motivationLetter: null, recommendationLetter: null, recommendationLetter1: null,
        recommendationLetter2: null, mastersDegree: null, mastersTranscript: null,
        researchProposal: null, cv: null, publications: null,
    })


    // Check URL for payment callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const reference = urlParams.get('reference')
        if (reference) {
            verifyPayment(reference)
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [])

    // Fetch courses when program level changes
    useEffect(() => {
        if (formData.educationLevel) {
            fetchCourseCategories()
        }
    }, [formData.educationLevel, universityId])

    const fetchCourseCategories = async () => {
        try {
            const response = await fetch(
                `${API_URL}/courses?program_level=${formData.educationLevel}&university_id=${universityId}`
            )
            const result = await response.json()
            if (result.success) {
                setCourseCategories(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err)
        }
    }

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
            if (result.success && result.data) setUniversity(result.data)
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
                const existing = result.data.find(
                    app => app.university_id === universityId || app.university?.id === universityId
                )
                if (existing) {
                    setHasApplied(true)
                    setError(`You have already applied. Application ID: ${existing.application_id || existing.applicationId}`)
                }
            }
        } catch (err) {
            console.error('Failed to check existing applications:', err)
        }
    }


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
        setFormData({ ...formData, course, educationLevel: isMasterApplication(course) ? 'master' : 'bachelor' })
    }

    // Validate Step 1
    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.course) {
            setError('Please fill all required fields')
            return false
        }
        return true
    }

    // Validate Step 2
    const validateStep2 = () => {
        const hasRequiredDocs = files.passport && files.birthCertificate && files.healthCertificate
        if (!hasRequiredDocs) {
            setError('Please upload all required documents (Passport, Birth Certificate, Health Certificate)')
            return false
        }
        return true
    }

    const goToStep = (step) => {
        if (step === 2 && !validateStep1()) return
        if (step === 3 && (!validateStep1() || !validateStep2())) return

        setError('')
        setCurrentStep(step)
        if (!completedSteps.includes(step - 1) && step > 1) {
            setCompletedSteps([...completedSteps, step - 1])
        }
    }

    const handlePayment = async () => {
        try {
            setPaystackLoading(true)
            const token = getToken()
            const email = formData.email || user?.email

            if (!email) {
                alert('Please enter your email address first')
                setPaystackLoading(false)
                return
            }

            // SAVE form data to localStorage before opening payment
            localStorage.setItem('apply_form_data', JSON.stringify(formData))
            localStorage.setItem('apply_university_id', universityId)

            // Also save file names (can't save File objects)
            const fileNames = {}
            Object.keys(files).forEach(key => {
                if (files[key]) fileNames[key] = files[key].name
            })
            localStorage.setItem('apply_file_names', JSON.stringify(fileNames))

            // Initialize payment
            const response = await fetch(`${API_URL}/payments/paystack/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    amount: 1,
                    callback_url: `${window.location.origin}/payment/callback`
                }),
            })

            const result = await response.json()

            if (result.success && result.data) {
                // OPEN IN NEW TAB
                const paymentWindow = window.open(result.data.authorization_url, '_blank')

                if (!paymentWindow) {
                    alert('Please allow popups for this site to complete payment.')
                }

                // Poll for payment completion from localStorage
                const checkPaymentInterval = setInterval(() => {
                    const verifiedRef = localStorage.getItem('payment_verified_ref')
                    const verifiedStatus = localStorage.getItem('payment_verified_status')

                    if (verifiedStatus === 'true' && verifiedRef) {
                        clearInterval(checkPaymentInterval)
                        setPaymentReference(verifiedRef)
                        setPaymentVerified(true)

                        // Restore form data
                        const savedData = localStorage.getItem('apply_form_data')
                        if (savedData) {
                            try {
                                const parsed = JSON.parse(savedData)
                                setFormData(prev => ({ ...prev, ...parsed }))
                            } catch (e) { }
                        }

                        // Clean up
                        localStorage.removeItem('payment_verified_ref')
                        localStorage.removeItem('payment_verified_status')
                    }
                }, 2000)

                // Stop checking after 5 minutes
                setTimeout(() => clearInterval(checkPaymentInterval), 300000)

            } else {
                alert(result.error || 'Payment initialization failed')
            }
        } catch (err) {
            console.error('Payment error:', err)
            alert('Failed to initialize payment')
        } finally {
            setPaystackLoading(false)
        }
    }

    const verifyPayment = async (reference) => {
        try {
            setCheckingPayment(true)
            const token = getToken()
            const response = await fetch(`${API_URL}/payments/paystack/verify/${reference}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            if (result.success && result.data?.status === 'success') {
                setPaymentReference(reference)
                setPaymentVerified(true)
                setError('')
            } else {
                setError('Payment verification failed. Please try again.')
            }
        } catch (err) {
            console.error('Verification error:', err)
            setError('Failed to verify payment')
        } finally {
            setCheckingPayment(false)
        }
    }

    // Restore form data after payment
    useEffect(() => {
        if (paymentVerified) {
            const savedData = localStorage.getItem('apply_form_data')
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData)
                    setFormData(prev => ({ ...prev, ...parsed }))
                    localStorage.removeItem('apply_form_data')
                } catch (e) { }
            }
        }
    }, [paymentVerified])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (hasApplied) { setError('You have already applied.'); return }
        if (!paymentVerified) { setError('⚠️ Please complete the payment first.'); return }

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
            formDataToSend.append('payment_reference', paymentReference)

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
            if (!response.ok) throw new Error(result.error || 'Failed')

            setSuccess(`Submitted! Application ID: ${result.data.applicationId}`)
            setCompletedSteps([1, 2, 3])
            setTimeout(() => navigate('/universities'), 3000)
        } catch (err) {
            setError(err.message)
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
                    <Link to={`/login?redirect=/apply/${universityId}`} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Go to Login</Link>
                </div>
            </div>
        )
    }

    const courses = university?.courses
        ? (typeof university.courses === 'string' ? JSON.parse(university.courses) : university.courses)
        : []

    // Document fields for rendering
    const documentFields = (level) => {
        if (level === 'required') {
            return [
                { name: 'passport', label: 'Passport Copy *', required: true },
                { name: 'birthCertificate', label: 'Birth Certificate *', required: true },
                { name: 'healthCertificate', label: 'Health Certificate *', required: true },
            ]
        }
        if (level === 'bachelor') {
            return [
                { name: 'bac', label: 'BAC Certificate *', required: true },
                { name: 'bepc', label: 'BEPC Certificate *', required: true },
            ]
        }
        return []
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <Link to="/universities" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-8">
                    <FiArrowLeft /> Back to Universities
                </Link>

                <div className="mb-6">
                    <h1 className="text-4xl font-black text-gray-900 mb-3">
                        Apply to <span className="text-indigo-600">{university?.name || 'University'}</span>
                    </h1>
                </div>

                {/* STEPPER */}
                <Stepper currentStep={currentStep} completedSteps={completedSteps} />

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                        <FiCheck className="text-green-500 text-2xl" />
                        <p className="text-green-800 font-medium">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* STEP 1: Personal Information */}
                {currentStep === 1 && (
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
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
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Program Level *</label>
                                <select name="educationLevel" required className={inputClasses} onChange={handleChange} value={formData.educationLevel}>
                                    <option value="">Select program level</option>
                                    <option value="graduate">Graduate Program (Bachelor's)</option>
                                    <option value="postgraduate">Postgraduate Program (Master's)</option>
                                    <option value="diploma">Diploma Program</option>
                                    <option value="doctoral">Doctoral Program (PhD)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Target Course *</label>
                                {courses.length > 0 ? (
                                    <select name="course" required className={inputClasses} onChange={handleCourseChange} value={formData.course}>
                                        <option value="">Select a course</option>
                                        {courses.map((course, idx) => (<option key={idx} value={course.name}>{course.name}</option>))}
                                    </select>
                                ) : (
                                    <input type="text" name="course" required placeholder="E.g. B.Tech Computer Science" className={inputClasses} onChange={handleChange} value={formData.course} />
                                )}
                            </div>
                        </div>
                        {/* Course Reference Table */}
                        {formData.educationLevel && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCourseTable(!showCourseTable)}
                                    className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                                >
                                    {showCourseTable ? 'Hide' : 'Show'} Course Reference Table <FiChevronDown className={`transition-transform ${showCourseTable ? 'rotate-180' : ''}`} />
                                </button>

                                {showCourseTable && (
                                    <div className="mt-4 bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                                        {courseCategories.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-4">No courses available for this program level</p>
                                        ) : (
                                            courseCategories.map((category) => (
                                                <div key={category.id} className="mb-4 last:mb-0">
                                                    <h5 className="text-sm font-bold text-indigo-700 mb-2">📚 {category.department}</h5>
                                                    <div className="space-y-1">
                                                        {(category.courses || []).map((course) => (
                                                            <div key={course.id} className="flex justify-between text-xs text-gray-600 bg-white p-2 rounded-lg">
                                                                <span>{course.name}</span>
                                                                <span className="text-gray-400">{course.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end mt-8">
                            <button onClick={() => goToStep(2)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                                Next: Documents <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Documents */}
                {currentStep === 2 && (
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block mb-6">PDF, JPG, PNG (Max 5MB)</span>

                        {/* Required Documents - ALL programs */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents (All Programs)</h3>
                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            {[
                                { name: 'passport', label: 'Passport Copy *' },
                                { name: 'birthCertificate', label: 'Birth Certificate *' },
                                { name: 'healthCertificate', label: 'Health Certificate *' },
                                { name: 'bac', label: 'BAC Certificate / Transcript *' },
                                { name: 'bepc', label: 'BEPC Certificate *' },
                            ].map((field) => (
                                <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                    <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {files[field.name] ? (
                                        <div className="text-green-600"><FiCheck className="text-xl mx-auto mb-1" /><span className="font-bold text-sm">File Ready</span><span className="text-xs block truncate max-w-[150px]">{files[field.name].name}</span></div>
                                    ) : (
                                        <div className="text-gray-500"><FiUploadCloud className="text-3xl mx-auto mb-1" /><span className="font-semibold text-sm">{field.label}</span></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Graduate (Bachelor's) Documents */}
                        {formData.educationLevel === 'graduate' && (
                            <>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">🎓 Graduate Program Documents</h3>
                                <p className="text-sm text-gray-600 mb-4">High school transcripts from Seconde to Terminale</p>
                                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                    {[
                                        { name: 'highSchool2nd', label: 'Seconde (2nd) Marksheet *' },
                                        { name: 'highSchool1st', label: 'Première (1st) Marksheet *' },
                                        { name: 'highSchoolTerminale', label: 'Terminale Marksheet *' },
                                    ].map((field) => (
                                        <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                            <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {files[field.name] ? (
                                                <div className="text-green-600"><FiCheck className="text-xl mx-auto mb-1" /><span className="font-bold text-sm">File Ready</span></div>
                                            ) : (
                                                <div className="text-gray-500"><FiUploadCloud className="text-3xl mx-auto mb-1" /><span className="font-semibold text-sm">{field.label}</span></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Postgraduate (Master's) Documents */}
                        {formData.educationLevel === 'postgraduate' && (
                            <>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">📚 Postgraduate Program Documents</h3>
                                <p className="text-sm text-gray-600 mb-4">Bachelor's degree transcripts (Licence 1 to 3)</p>
                                {['L1', 'L2', 'L3'].map((level, i) => (
                                    <div key={level} className="mb-4">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">Licence {i + 1} ({level}) - 2 Semesters</h4>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {[`college${level}S1`, `college${level}S2`].map(name => (
                                                <div key={name} className={`relative border-2 border-dashed rounded-xl p-4 text-center ${files[name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                                    <input type="file" name={name} accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    {files[name] ? <div className="text-green-600 text-sm"><FiCheck className="mx-auto" />Ready</div> : <div className="text-gray-500 text-sm"><FiUploadCloud className="mx-auto" />{name.replace('college', '')} *</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {/* Bachelor's degree certificate */}
                                <div className="grid sm:grid-cols-2 gap-6 mt-4">
                                    <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files.bachelorDegree ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                        <input type="file" name="bachelorDegree" accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        {files.bachelorDegree ? (
                                            <div className="text-green-600"><FiCheck className="text-xl mx-auto mb-1" /><span className="font-bold text-sm">File Ready</span></div>
                                        ) : (
                                            <div className="text-gray-500"><FiUploadCloud className="text-3xl mx-auto mb-1" /><span className="font-semibold text-sm">Bachelor's Degree Certificate *</span></div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Diploma Program Documents */}
                        {formData.educationLevel === 'diploma' && (
                            <>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">📋 Diploma Program Documents</h3>
                                <p className="text-sm text-gray-600 mb-4">High school completion and any relevant certificates</p>
                                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                    {[
                                        { name: 'highSchoolTranscript', label: 'High School Transcript *' },
                                        { name: 'diplomaCertificate', label: 'Diploma Certificate (if any)' },
                                        { name: 'motivationLetter', label: 'Motivation Letter *' },
                                        { name: 'recommendationLetter', label: 'Recommendation Letter' },
                                    ].map((field) => (
                                        <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                            <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required={field.required} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {files[field.name] ? (
                                                <div className="text-green-600"><FiCheck className="text-xl mx-auto mb-1" /><span className="font-bold text-sm">File Ready</span></div>
                                            ) : (
                                                <div className="text-gray-500"><FiUploadCloud className="text-3xl mx-auto mb-1" /><span className="font-semibold text-sm">{field.label}</span></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Doctoral (PhD) Documents */}
                        {formData.educationLevel === 'doctoral' && (
                            <>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">🔬 Doctoral Program Documents</h3>
                                <p className="text-sm text-gray-600 mb-4">Master's degree and research proposal required</p>
                                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                    {[
                                        { name: 'mastersDegree', label: "Master's Degree Certificate *" },
                                        { name: 'mastersTranscript', label: "Master's Transcript *" },
                                        { name: 'researchProposal', label: 'Research Proposal *' },
                                        { name: 'cv', label: 'Curriculum Vitae (CV) *' },
                                        { name: 'publications', label: 'Publications (if any)' },
                                        { name: 'recommendationLetter1', label: 'Recommendation Letter 1 *' },
                                        { name: 'recommendationLetter2', label: 'Recommendation Letter 2 *' },
                                    ].map((field) => (
                                        <div key={field.name} className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files[field.name] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                            <input type="file" name={field.name} accept=".pdf,.jpg,.jpeg,.png" required={field.required} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {files[field.name] ? (
                                                <div className="text-green-600"><FiCheck className="text-xl mx-auto mb-1" /><span className="font-bold text-sm">File Ready</span></div>
                                            ) : (
                                                <div className="text-gray-500"><FiUploadCloud className="text-3xl mx-auto mb-1" /><span className="font-semibold text-sm">{field.label}</span></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Additional Documents (Optional - all programs) */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Additional Documents (Optional)</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${files.other ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                                <input type="file" name="other" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {files.other ? (
                                    <div className="text-green-600"><FiCheck className="text-xl mx-auto mb-1" /><span className="font-bold text-sm">Additional docs</span></div>
                                ) : (
                                    <div className="text-gray-500"><FiUploadCloud className="text-3xl mx-auto mb-1" /><span className="font-semibold text-sm">Other Documents</span><span className="text-xs">Recommendation letters, certificates, etc.</span></div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => goToStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 flex items-center gap-2">
                                <FiChevronLeft /> Back
                            </button>
                            <button onClick={() => goToStep(3)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                                Next: Payment <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Payment & Submit */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 md:p-10 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Application Fee</h2>
                                <p className="text-emerald-100 mb-4">Secure payment via Paystack</p>
                                <div className="text-3xl font-black bg-white/20 inline-block px-4 py-2 rounded-xl backdrop-blur-sm">XOF 500</div>
                            </div>
                            <button onClick={handlePayment} disabled={paystackLoading || paymentVerified}
                                className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all ${paymentVerified ? 'bg-green-400 text-white cursor-not-allowed' : 'bg-white text-emerald-600 hover:shadow-lg hover:scale-105'
                                    }`}>
                                {paymentVerified ? <><FiCheckCircle /> Paid</> : paystackLoading ? <><FiLoader className="animate-spin" /> Processing...</> : <><FiCreditCard /> Pay with Paystack</>}
                            </button>
                        </div>

                        {paymentVerified ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                                <FiCheckCircle className="text-green-500 text-xl" />
                                <div><p className="text-green-800 font-medium">✅ Payment Confirmed</p><p className="text-green-600 text-sm">Ref: {paymentReference}</p></div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                <p className="text-amber-800 text-sm flex items-center gap-2"><FiAlertCircle /> Complete payment to enable submission.</p>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button onClick={() => goToStep(2)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 flex items-center gap-2">
                                <FiChevronLeft /> Back
                            </button>
                            <button onClick={handleSubmit} disabled={submitting || !paymentVerified}
                                className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all ${!paymentVerified ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:-translate-y-1'
                                    }`}>
                                {submitting ? <><FiLoader className="animate-spin" /> Submitting...</> : '🎓 Submit Application'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Apply