import React, { useState, useEffect } from 'react'
import {
    FiSearch, FiDownload, FiDollarSign, FiTrendingUp,
    FiCheckCircle, FiXCircle, FiClock, FiLoader, FiRefreshCw,
    FiFileText
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Payments({ searchTerm, setSearchTerm }) {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [methodFilter, setMethodFilter] = useState('all')
    const [updatingId, setUpdatingId] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchPayments()
    }, [statusFilter, methodFilter])

    const fetchPayments = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (searchTerm) params.append('search', searchTerm)
            params.append('limit', '100')

            const response = await fetch(`${API_URL}/payments?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            if (result.success) {
                setPayments(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch payments:', err)
        } finally {
            setLoading(false)
        }
    }

    const updatePaymentStatus = async (paymentId, newStatus) => {
        try {
            setUpdatingId(paymentId)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/payments/${paymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            })
            const result = await response.json()

            if (result.success) {
                setPayments(payments.map(p =>
                    p.id === paymentId ? { ...p, status: newStatus } : p
                ))
                setMessage(`Payment ${newStatus === 'completed' ? 'confirmed' : newStatus} successfully!`)
                setTimeout(() => setMessage(''), 3000)
            } else {
                alert(result.error || 'Failed to update payment')
            }
        } catch (err) {
            console.error('Failed to update payment:', err)
        } finally {
            setUpdatingId(null)
        }
    }

    const exportToCSV = () => {
        if (payments.length === 0) {
            alert('No data to export')
            return
        }

        let csv = 'Transaction ID,Student,Application ID,Amount,Currency,Method,Status,Date\n'

        payments.forEach(p => {
            csv += `"${p.transaction_id || ''}",`
            csv += `"${p.student_name || ''}",`
            csv += `"${p.application?.application_id || ''}",`
            csv += `${parseFloat(p.amount || 0).toFixed(2)},`
            csv += `${p.currency || 'ZMW'},`
            csv += `${p.method || ''},`
            csv += `${p.status || ''},`
            csv += `${new Date(p.created_at).toLocaleDateString()}\n`
        })

        // Add summary
        csv += `\nSummary\n`
        csv += `Total Payments,${payments.length}\n`
        csv += `Completed,${completedPayments.length}\n`
        csv += `Pending,${pendingPayments.length}\n`
        csv += `Failed,${failedPayments.length}\n`
        csv += `Total Revenue (ZMW),${totalRevenue.toFixed(2)}\n`

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setMessage('Report exported successfully!')
        setTimeout(() => setMessage(''), 3000)
    }

    const filteredPayments = payments.filter(p => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            (p.student_name || '').toLowerCase().includes(search) ||
            (p.transaction_id || '').toLowerCase().includes(search)
        )
    })

    const completedPayments = payments.filter(p => p.status === 'completed')
    const pendingPayments = payments.filter(p => p.status === 'pending')
    const failedPayments = payments.filter(p => p.status === 'failed')

    const totalRevenue = completedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading payments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Message */}
            {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 flex items-center gap-2">
                    <FiCheckCircle /> {message}
                </div>
            )}

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <FiDollarSign className="text-2xl opacity-80" />
                        <FiTrendingUp className="text-xl opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">XOF{totalRevenue.toFixed(2)}</p>
                    <p className="text-sm opacity-90">Total Revenue</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <FiDollarSign className="text-blue-600 text-xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{completedPayments.length}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                        <FiClock className="text-yellow-600 text-xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{pendingPayments.length}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <FiXCircle className="text-red-600 text-xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">XOF{pendingAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Pending Amount</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or transaction ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        >
                            <option value="all">All Status ({payments.length})</option>
                            <option value="completed">Completed ({completedPayments.length})</option>
                            <option value="pending">Pending ({pendingPayments.length})</option>
                            <option value="failed">Failed ({failedPayments.length})</option>
                        </select>
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        >
                            <option value="all">All Methods</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Mobile Money">Mobile Money</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                        <button onClick={fetchPayments} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm flex items-center gap-2">
                            <FiRefreshCw /> Refresh
                        </button>
                        <button onClick={exportToCSV} className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm flex items-center gap-2">
                            <FiDownload /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Transaction ID</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Student</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">App ID</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Method</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        <FiFileText className="text-4xl mx-auto mb-2 text-gray-300" />
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map(payment => (
                                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4 text-sm font-mono text-gray-600">
                                            {payment.transaction_id}
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-gray-900 text-sm">{payment.student_name}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            {payment.application?.application_id && (
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                    {payment.application.application_id}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-gray-900 text-sm">
                                            {payment.currency || 'ZMW'} {parseFloat(payment.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {payment.status === 'completed' ? <FiCheckCircle size={12} /> :
                                                    payment.status === 'pending' ? <FiClock size={12} /> :
                                                        <FiXCircle size={12} />}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updatePaymentStatus(payment.id, 'completed')}
                                                            disabled={updatingId === payment.id}
                                                            className="px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 font-medium"
                                                        >
                                                            {updatingId === payment.id ? '...' : '✅ Confirm'}
                                                        </button>
                                                        <button
                                                            onClick={() => updatePaymentStatus(payment.id, 'failed')}
                                                            disabled={updatingId === payment.id}
                                                            className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 font-medium"
                                                        >
                                                            {updatingId === payment.id ? '...' : '❌ Reject'}
                                                        </button>
                                                    </>
                                                )}
                                                {payment.status !== 'pending' && (
                                                    <button
                                                        onClick={() => updatePaymentStatus(payment.id, 'pending')}
                                                        className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                                                    >
                                                        🔄 Reset
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                {filteredPayments.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                        <span>Showing {filteredPayments.length} of {payments.length} payments</span>
                        <div className="flex gap-4">
                            <span>Completed: <strong className="text-green-600">{completedPayments.length}</strong></span>
                            <span>Pending: <strong className="text-yellow-600">{pendingPayments.length}</strong></span>
                            <span>Failed: <strong className="text-red-600">{failedPayments.length}</strong></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Payments