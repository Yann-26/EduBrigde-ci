import React from 'react'
import { FiCheck, FiUser, FiFileText, FiCreditCard } from 'react-icons/fi'

function Stepper({ currentStep, completedSteps }) {
    const steps = [
        { number: 1, label: 'Personal Info', icon: <FiUser /> },
        { number: 2, label: 'Documents', icon: <FiFileText /> },
        { number: 3, label: 'Payment & Submit', icon: <FiCreditCard /> },
    ]

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.number
                    const isCompleted = completedSteps.includes(step.number)

                    return (
                        <React.Fragment key={step.number}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${isCompleted
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                            : isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {isCompleted ? <FiCheck /> : step.icon}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-semibold transition-colors ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4 h-1 rounded-full transition-all duration-300">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${completedSteps.includes(step.number)
                                                ? 'bg-green-500'
                                                : 'bg-gray-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default Stepper