import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiDownload, FiPrinter, FiCheckCircle, FiLoader } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function Receipt() {
    const { reference } = useParams()
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPayment()
    }, [reference])

    const fetchPayment = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/payments/${reference}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()
            if (result.success) {
                setPayment(result.data)
            }
        } catch (err) {
            console.error('Failed to fetch payment:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => window.print()

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><FiLoader className="animate-spin text-4xl text-indigo-600" /></div>
    }

    if (!payment) {
        return <div className="min-h-screen flex items-center justify-center"><p>Payment not found</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 print:py-0 print:bg-white">
            <div className="max-w-2xl mx-auto px-6 print:px-0">
                {/* Actions - hidden when printing */}
                <div className="flex gap-3 mb-6 print:hidden">
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2">
                        <FiPrinter /> Print Receipt
                    </button>
                    <Link to="/applications" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                        Back to Applications
                    </Link>
                </div>

                {/* Receipt Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none print:p-0">
                    {/* Header */}
                    <div className="text-center border-b border-gray-200 pb-6 mb-6">
                        <h1 className="text-2xl font-black text-gray-900">EduBridge</h1>
                        <p className="text-gray-500 text-sm">Payment Receipt</p>
                        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                            <FiCheckCircle /> Payment Successful
                        </div>
                    </div>

                    {/* Receipt Details */}
                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Receipt Number</span>
                            <span className="font-mono font-bold">{payment.transaction_id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Date</span>
                            <span className="font-medium">{new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Student Name</span>
                            <span className="font-medium">{payment.student_name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium">{payment.student_email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium">{payment.method}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Currency</span>
                            <span className="font-medium">{payment.currency || 'XOF'}</span>
                        </div>
                        <div className="flex justify-between py-3 bg-indigo-50 rounded-lg px-4 -mx-4">
                            <span className="text-gray-900 font-bold text-lg">Amount Paid</span>
                            <span className="text-indigo-700 font-black text-lg">{payment.currency || 'XOF'} {parseFloat(payment.amount || 0).toFixed(2)}</span>
                        </div>
                        {payment.application?.application_id && (
                            <div className="flex justify-between py-2 border-t border-gray-100 mt-4 pt-4">
                                <span className="text-gray-500">Application ID</span>
                                <span className="font-mono text-sm">{payment.application.application_id}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                        <p>This is a computer-generated receipt.</p>
                        <p>EduBridge - Your Gateway to Indian Education</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Receipt