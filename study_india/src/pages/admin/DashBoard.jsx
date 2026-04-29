import React, { useEffect, useState } from 'react'
import {
    FiUsers, FiFileText, FiDollarSign, FiTrendingUp,
    FiClock, FiCheckCircle, FiXCircle, FiEye, FiArrowUp, FiArrowDown,
    FiCalendar, FiActivity, FiGlobe, FiBookOpen, FiLoader
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Dashboard() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingReview: 0,
        approved: 0,
        totalRevenue: 0,
    })
    const [recentApplications, setRecentApplications] = useState([])
    const [countryDistribution, setCountryDistribution] = useState([])
    const [documentStats, setDocumentStats] = useState({ verified: 0, pending: 0, rejected: 0 })

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            // Fetch stats from dashboard endpoint
            const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const statsResult = await statsRes.json()

            console.log('Stats response:', statsResult) // Debug log

            if (statsResult.success && statsResult.data) {
                const s = statsResult.data
                setStats({
                    totalApplications: s.total_applications || 0,
                    pendingReview: s.pending_review || 0,
                    approved: s.approved || 0,
                    totalRevenue: s.total_revenue || 0,
                })

                // Use recent applications from the stats response
                if (s.recentApplications && s.recentApplications.length > 0) {
                    setRecentApplications(s.recentApplications)

                    // Calculate country distribution
                    const countryMap = {}
                    s.recentApplications.forEach(app => {
                        const country = app.student_country || 'Unknown'
                        countryMap[country] = (countryMap[country] || 0) + 1
                    })

                    const distribution = Object.entries(countryMap)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count)

                    const total = distribution.reduce((sum, c) => sum + c.count, 0)
                    setCountryDistribution(distribution.map(c => ({
                        ...c,
                        percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
                    })))
                }

                // Also fetch all applications for document stats
                const appsRes = await fetch(`${API_URL}/applications?limit=100`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const appsResult = await appsRes.json()

                if (appsResult.success && appsResult.data) {
                    let verified = 0, pending = 0, rejected = 0
                    appsResult.data.forEach(app => {
                        if (app.documents) {
                            app.documents.forEach(doc => {
                                if (doc.status === 'verified') verified++
                                else if (doc.status === 'pending') pending++
                                else if (doc.status === 'rejected') rejected++
                            })
                        }
                    })
                    setDocumentStats({ verified, pending, rejected })
                }
            } else {
                console.error('Stats API returned error:', statsResult)
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { label: 'Total Applications', value: stats.totalApplications, icon: <FiFileText />, iconBg: 'bg-blue-500' },
        { label: 'Pending Review', value: stats.pendingReview, icon: <FiClock />, iconBg: 'bg-yellow-500' },
        { label: 'Approved', value: stats.approved, icon: <FiCheckCircle />, iconBg: 'bg-green-500' },
        { label: 'Total Revenue', value: `XOF${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, iconBg: 'bg-purple-500' },
    ]

    const totalDocs = documentStats.verified + documentStats.pending + documentStats.rejected
    const verifiedPercent = totalDocs > 0 ? Math.round((documentStats.verified / totalDocs) * 100) : 0
    const pendingPercent = totalDocs > 0 ? Math.round((documentStats.pending / totalDocs) * 100) : 0
    const rejectedPercent = totalDocs > 0 ? Math.round((documentStats.rejected / totalDocs) * 100) : 0

    const countryColors = ['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500']

    const getStatusColor = (status) => {
        const colors = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle size={12} />
            case 'pending': return <FiClock size={12} />
            case 'under_review': return <FiEye size={12} />
            case 'rejected': return <FiXCircle size={12} />
            default: return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
                        <p className="text-indigo-100">Here's what's happening with your applications today.</p>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                <FiCalendar />
                                <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                <FiClock />
                                <span>{currentTime.toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <FiActivity className="text-6xl text-indigo-300 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                        <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center text-white text-xl mb-4`}>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Status - Donut Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Document Verification</h3>
                    <div className="flex items-center justify-center">
                        <div className="relative w-56 h-56">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                                {verifiedPercent > 0 && (
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="3"
                                        strokeDasharray={`${verifiedPercent}, 100`} />
                                )}
                                {pendingPercent > 0 && (
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="3"
                                        strokeDasharray={`${pendingPercent}, 100`} strokeDashoffset={`-${verifiedPercent}`} />
                                )}
                                {rejectedPercent > 0 && (
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EF4444" strokeWidth="3"
                                        strokeDasharray={`${rejectedPercent}, 100`} strokeDashoffset={`-${verifiedPercent + pendingPercent}`} />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-gray-900">{totalDocs}</p>
                                    <p className="text-sm text-gray-500">Total Documents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">{verifiedPercent}%</span>
                            </div>
                            <p className="text-xs text-gray-500">Verified ({documentStats.verified})</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">{pendingPercent}%</span>
                            </div>
                            <p className="text-xs text-gray-500">Pending ({documentStats.pending})</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">{rejectedPercent}%</span>
                            </div>
                            <p className="text-xs text-gray-500">Rejected ({documentStats.rejected})</p>
                        </div>
                    </div>
                </div>

                {/* Country Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Applications by Country</h3>
                    {countryDistribution.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    ) : (
                        <div className="space-y-5">
                            {countryDistribution.map((country, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <FiGlobe className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{country.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">{country.count}</span>
                                            <span className="text-xs text-gray-500">({country.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`${countryColors[idx] || 'bg-indigo-500'} h-2.5 rounded-full`}
                                            style={{ width: `${country.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Applications Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                </div>
                <div className="overflow-x-auto">
                    {recentApplications.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No applications yet</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">University</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Course</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentApplications.map(app => (
                                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-semibold text-sm">
                                                        {(app.student_name || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{app.student_name}</p>
                                                    <p className="text-xs text-gray-500">{app.student_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{app.university?.name || 'N/A'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{app.course}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                {getStatusIcon(app.status)}
                                                {(app.status || '').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${app.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                <FiDollarSign size={12} />
                                                {app.payment_status || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard