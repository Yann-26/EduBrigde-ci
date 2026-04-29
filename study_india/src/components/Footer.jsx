import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiX } from 'react-icons/fi'

function Footer() {
    const currentYear = new Date().getFullYear()
    const [showPrivacy, setShowPrivacy] = useState(false)
    const [showTerms, setShowTerms] = useState(false)

    return (
        <>
            <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                        {/* Brand & Social Section */}
                        <div className="lg:col-span-2">
                            <h3 className="text-2xl font-black tracking-tight text-white mb-4">
                                Edu<span className="text-indigo-500">Bridge</span> Portal
                            </h3>
                            <p className="text-gray-400 leading-relaxed max-w-sm mb-6">
                                Your premier gateway to quality education in India. We simplify the journey for international students from application to arrival.
                            </p>
                            <div className="flex gap-4">
                                {[
                                    { Icon: FiFacebook, label: 'Facebook' },
                                    { Icon: FiTwitter, label: 'Twitter' },
                                    { Icon: FiInstagram, label: 'Instagram' }
                                ].map(({ Icon, label }, idx) => (
                                    <a
                                        key={idx}
                                        href="#"
                                        aria-label={label}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] text-gray-400"
                                    >
                                        <Icon />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links Section */}
                        <div>
                            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Universities', path: '/universities' },
                                    { label: 'Visa Guide', path: '/visa-guide' },
                                    { label: 'Visa Tracker', path: '/visa-tracker' },
                                    { label: 'My Applications', path: '/applications' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            to={item.path}
                                            className="text-gray-400 hover:text-indigo-400 hover:pl-2 transition-all duration-300 block"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Section */}
                        <div>
                            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <FiMapPin className="text-indigo-500 mt-1" />
                                    <span className="text-sm">Abidjan, Cocody<br />Ivory Coast</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FiPhone className="text-indigo-500" />
                                    <span className="text-sm">+225 0797368893</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <FiMail className="text-indigo-500" />
                                    <span className="text-sm">edubridge@gmail.com</span>
                                </li>
                            </ul>

                            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex items-center gap-4">
                                <div className="text-3xl animate-bounce">📞</div>
                                <div>
                                    <strong className="text-white text-sm block">Need Urgent Help?</strong>
                                    <a
                                        href="https://wa.me/2250797368893"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 transition-colors"
                                    >
                                        WhatsApp Us
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright & Legal Section */}
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">&copy; {currentYear} EduBridge Portal. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy Policy</button>
                            <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms of Service</button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Privacy Policy Modal */}
            {showPrivacy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                            <button onClick={() => setShowPrivacy(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-gray-700">
                            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                            <h3 className="text-lg font-bold text-gray-900">1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, including:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Personal identification information (Name, email address, phone number, country)</li>
                                <li>Educational documents (passport copies, academic certificates, transcripts)</li>
                                <li>Application data (university preferences, course selections)</li>
                                <li>Payment information (processed securely through our payment partners)</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900">2. How We Use Your Information</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Process your university applications</li>
                                <li>Communicate with you about your application status</li>
                                <li>Provide visa guidance and support</li>
                                <li>Improve our services and user experience</li>
                                <li>Comply with legal obligations</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900">3. Data Storage & Security</h3>
                            <p className="text-sm">Your data is stored securely on Supabase cloud infrastructure with encryption at rest and in transit. We implement industry-standard security measures to protect your personal information.</p>

                            <h3 className="text-lg font-bold text-gray-900">4. Document Handling</h3>
                            <p className="text-sm">Uploaded documents (passports, certificates, transcripts) are stored securely in encrypted cloud storage. Only authorized administrative personnel have access to verify these documents for application processing.</p>

                            <h3 className="text-lg font-bold text-gray-900">5. Data Retention</h3>
                            <p className="text-sm">We retain your personal data for as long as your account is active or as needed to provide you services. You can request deletion of your data by contacting our support team.</p>

                            <h3 className="text-lg font-bold text-gray-900">6. Third-Party Sharing</h3>
                            <p className="text-sm">We share your application documents and information only with the universities you apply to. We do not sell, trade, or rent your personal identification information to third parties.</p>

                            <h3 className="text-lg font-bold text-gray-900">7. Your Rights</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Object to processing of your data</li>
                                <li>Data portability</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900">8. Cookies</h3>
                            <p className="text-sm">We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>

                            <h3 className="text-lg font-bold text-gray-900">9. Contact Us</h3>
                            <p className="text-sm">For privacy-related inquiries, contact us at: privacy@edubridgeportal.com</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms of Service Modal */}
            {showTerms && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                            <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-gray-700">
                            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                            <h3 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h3>
                            <p className="text-sm">By accessing and using EduBridge Portal, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.</p>

                            <h3 className="text-lg font-bold text-gray-900">2. Services Description</h3>
                            <p className="text-sm">EduBridge Portal provides a platform for international students to:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Browse and apply to Indian universities</li>
                                <li>Submit application documents for review</li>
                                <li>Track visa application progress</li>
                                <li>Receive guidance on the student visa process</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900">3. User Responsibilities</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Provide accurate and truthful information in all applications</li>
                                <li>Upload genuine and unaltered documents</li>
                                <li>Maintain the confidentiality of your account credentials</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Not submit fraudulent or misleading applications</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900">4. Application Fees</h3>
                            <p className="text-sm">The application processing fee is XOF 0per university application. This fee is non-refundable once the application has been submitted for processing. Payment must be made through our approved payment methods.</p>

                            <h3 className="text-lg font-bold text-gray-900">5. Document Verification</h3>
                            <p className="text-sm">All submitted documents are subject to verification by our administrative team. We reserve the right to reject applications containing falsified or invalid documents. Users will be notified of any issues with their submissions.</p>

                            <h3 className="text-lg font-bold text-gray-900">6. Visa Process</h3>
                            <p className="text-sm">EduBridge Portal provides guidance for the Indian student visa process. However, final visa approval is at the sole discretion of the Indian government and embassy officials. We do not guarantee visa approval.</p>

                            <h3 className="text-lg font-bold text-gray-900">7. Limitation of Liability</h3>
                            <p className="text-sm">EduBridge Portal acts as an intermediary between students and universities. We are not responsible for:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>University admission decisions</li>
                                <li>Visa application outcomes</li>
                                <li>Changes in university policies or fees</li>
                                <li>Delays in processing times</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900">8. Intellectual Property</h3>
                            <p className="text-sm">All content on EduBridge Portal, including text, graphics, logos, and software, is the property of EduBridge and is protected by copyright laws.</p>

                            <h3 className="text-lg font-bold text-gray-900">9. Termination</h3>
                            <p className="text-sm">We reserve the right to suspend or terminate accounts that violate these terms, submit fraudulent applications, or engage in prohibited activities.</p>

                            <h3 className="text-lg font-bold text-gray-900">10. Changes to Terms</h3>
                            <p className="text-sm">We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

                            <h3 className="text-lg font-bold text-gray-900">11. Contact</h3>
                            <p className="text-sm">For questions about these terms, contact: legal@edubridgeportal.com</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Footer