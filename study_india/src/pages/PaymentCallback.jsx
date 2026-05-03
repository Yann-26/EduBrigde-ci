import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function PaymentCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying')
    const [message, setMessage] = useState('Verifying your payment...')

    useEffect(() => {
        const reference = searchParams.get('reference')
        const trxref = searchParams.get('trxref')
        const ref = reference || trxref

        if (ref) {
            verifyPayment(ref)
        } else {
            setStatus('error')
            setMessage('No payment reference found')
        }
    }, [])

    const verifyPayment = async (reference) => {
        try {
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/payments/paystack/verify/${reference}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success && result.data?.status === 'success') {
                setStatus('success')
                setMessage('Payment confirmed! You can close this tab now.')

                // USE THE SAME KEYS that Apply.jsx is polling for
                localStorage.setItem('payment_verified_ref', reference)
                localStorage.setItem('payment_verified_status', 'true')
                localStorage.setItem('payment_amount', result.data.amount / 100)

                // Auto-close after 3 seconds
                setTimeout(() => {
                    window.close()
                }, 3000)
            } else {
                setStatus('error')
                setMessage(result.data?.gateway_response || 'Payment verification failed')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Failed to verify payment')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-green-700 mb-2">Payment Successful!</h2>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FiXCircle className="text-4xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-700 mb-2">Payment Failed</h2>
                    </>
                )}

                <p className="text-gray-600">{message}</p>

                {status === 'error' && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Go Back & Try Again
                    </button>
                )}
            </div>
        </div>
    )
}

export default PaymentCallback