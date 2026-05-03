import React from 'react'
import { FiCheck, FiInfo, FiImage, FiBookOpen, FiFileText, FiList } from 'react-icons/fi'

function UniversityStepper({ currentStep, completedSteps, isEditing }) {
    const steps = [
        { number: 1, label: 'Basic Info', icon: <FiInfo /> },
        { number: 2, label: 'Media', icon: <FiImage /> },
        { number: 3, label: 'Academics', icon: <FiBookOpen /> },
        { number: 4, label: 'Courses', icon: <FiList /> },
        { number: 5, label: 'Documents', icon: <FiFileText /> },
    ]

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.number
                    const isCompleted = completedSteps.includes(step.number)

                    return (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                            : isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {isCompleted ? <FiCheck /> : step.icon}
                                </div>
                                <span className={`mt-1.5 text-[10px] font-semibold transition-colors hidden sm:block ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-2 h-0.5 rounded-full">
                                    <div className={`h-full rounded-full transition-all duration-500 ${completedSteps.includes(step.number) ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
            <h2 className="text-center text-sm text-gray-500 mt-4">
                {isEditing ? 'Editing University' : 'Adding New University'}
            </h2>
        </div>
    )
}

export default UniversityStepper