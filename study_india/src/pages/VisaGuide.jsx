import React from 'react'
import { FiAlertCircle, FiPhone, FiGlobe, FiClock } from 'react-icons/fi'
import { visaSteps, visaFees, embassyContacts } from '../data/visaSteps'
import VisaTimeline from '../components/VisaTimeline'
import DocumentChecklist from '../components/DocumentChecklist'

function VisaGuide() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Student Visa <span className="text-indigo-600">Guide</span>
                    </h1>
                    <p className="text-lg text-gray-600">Your complete step-by-step roadmap to successfully securing your Indian student visa.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    {/* Main Timeline Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl shadow-sm flex gap-4">
                            <FiAlertCircle className="text-amber-500 text-2xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">Crucial Timing Requirement</h3>
                                <p className="text-amber-800 text-sm">We strongly advise starting your visa application process at least <strong>2-3 months</strong> before your intended course start date to account for processing delays.</p>
                            </div>
                        </div>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Process Timeline</h2>
                            <VisaTimeline steps={visaSteps} />
                        </section>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="lg:col-span-1 space-y-8 sticky top-24">

                        {/* Checklist Component Drop-in */}
                        <DocumentChecklist />

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FiClock className="text-indigo-500" /> Standard Visa Fees
                            </h3>
                            <div className="space-y-3 mb-6">
                                {[
                                    { label: '6 Months', value: visaFees?.student?.sixMonths || '$80' },
                                    { label: '1 Year', value: visaFees?.student?.oneYear || '$120' },
                                    { label: '5 Years', value: visaFees?.student?.fiveYears || '$200' }
                                ].map((fee, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <strong className="text-gray-700">{fee.label}</strong>
                                        <span className="font-bold text-indigo-600">{fee.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-xl text-sm">
                                <p className="text-indigo-900 mb-1"><strong>Processing:</strong> {visaFees?.processing || '3-5 Weeks'}</p>
                                <p className="text-indigo-900"><strong>Validity:</strong> {visaFees?.validity || 'Duration of course'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-3xl p-6 shadow-lg text-white">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FiGlobe className="text-indigo-400" /> Supportive Contacts
                            </h3>
                            <div className="space-y-4">
                                {embassyContacts?.slice(0, 3).map((embassy, index) => (
                                    <div key={index} className="border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                                        <strong className="block text-indigo-300 mb-1">{embassy.country}</strong>
                                        <span className="block text-sm text-gray-400 mb-2">{embassy.city}</span>
                                        <a href={`tel:${embassy.phone}`} className="inline-flex items-center gap-2 text-sm font-medium hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg">
                                            <FiPhone /> {embassy.phone}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default VisaGuide