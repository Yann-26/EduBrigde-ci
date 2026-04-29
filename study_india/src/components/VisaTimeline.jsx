import React, { useState } from 'react'
import { FiChevronDown, FiFile, FiCheckCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

function VisaTimeline({ steps }) {
    const [expandedStep, setExpandedStep] = useState(steps[0]?.step || null)

    return (
        <div className="max-w-3xl mx-auto py-8">
            {steps.map((step, index) => (
                <div key={step.step} className="relative pl-12 md:pl-0 mb-8 group">
                    {/* Center Line for Desktop, Left for Mobile */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-indigo-100 md:-translate-x-1/2 group-last:hidden" />

                    <div className={`md:flex items-center justify-between ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                        {/* Empty div for spacing on desktop */}
                        <div className="hidden md:block w-5/12" />

                        {/* Node Icon */}
                        <div className="absolute left-0 md:left-1/2 top-0 w-8 h-8 rounded-full bg-white border-4 border-indigo-500 shadow-md flex items-center justify-center z-10 md:-translate-x-1/2 transform transition-transform group-hover:scale-110">
                            <span className="text-xs text-indigo-600 font-bold">{step.icon || step.step}</span>
                        </div>

                        {/* Content Card */}
                        <div className="w-full md:w-5/12">
                            <div
                                className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${expandedStep === step.step ? 'border-indigo-400 shadow-lg shadow-indigo-100' : 'border-gray-200 shadow-sm hover:border-indigo-300'
                                    }`}
                                onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                            >
                                <div className="p-5 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <span className="text-indigo-600 text-xs font-black uppercase tracking-wider mb-1 block">Step {step.step}</span>
                                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                                    </div>
                                    <motion.div animate={{ rotate: expandedStep === step.step ? 180 : 0 }}>
                                        <FiChevronDown className="text-gray-400 text-xl" />
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {expandedStep === step.step && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-100"
                                        >
                                            <div className="p-5">
                                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{step.description}</p>

                                                <ul className="space-y-2 mb-4">
                                                    {step.details.map((detail, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <FiCheckCircle className="text-indigo-500 mt-0.5 shrink-0" />
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>

                                                {step.documents && (
                                                    <div className="bg-indigo-50 rounded-xl p-4 mt-4">
                                                        <h4 className="flex items-center gap-2 text-indigo-900 font-semibold text-sm mb-2">
                                                            <FiFile /> Required Documents
                                                        </h4>
                                                        <ul className="grid grid-cols-1 gap-1.5">
                                                            {step.documents.map((doc, idx) => (
                                                                <li key={idx} className="text-xs text-indigo-700 flex items-center gap-1.5">
                                                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                                                    {doc}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default VisaTimeline