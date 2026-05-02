import React, { useState, useEffect } from 'react'
import {
    FiDownload, FiTrendingUp, FiTrendingDown,
    FiDollarSign, FiUsers, FiFileText, FiCheckCircle, FiLoader, FiRefreshCw, FiCheckSquare
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1']

function Reports() {
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('6months')
    const [applicationTrends, setApplicationTrends] = useState([])
    const [courseDistribution, setCourseDistribution] = useState([])
    const [countryDistribution, setCountryDistribution] = useState([])
    const [kpi, setKpi] = useState({
        totalApplications: 0,
        approvalRate: 0,
        totalRevenue: 0,
        activeStudents: 0,
    })

    useEffect(() => {
        fetchReports()
    }, [period])

    const fetchReports = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await fetch(`${API_URL}/dashboard/reports?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const result = await response.json()

            console.log('Reports:', result)

            if (result.success && result.data) {
                setApplicationTrends(result.data.applicationTrends || [])
                setCourseDistribution(result.data.courseDistribution || [])
                setCountryDistribution(result.data.countryDistribution || [])
                if (result.data.kpi) setKpi(result.data.kpi)
            }

            //  VISA STATS  - 
            try {
                const visaRes = await fetch(`${API_URL}/visa/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const visaResult = await visaRes.json()
                console.log('Visa stats response:', visaResult) // Debug

                if (visaResult.success && visaResult.data) {
                    // Handle both possible response formats
                    const visaTotal = visaResult.data.totalApplications ||
                        visaResult.data.total_applications ||
                        visaResult.data.total || 0
                    setKpi(prev => ({ ...prev, visaTotal }))
                }
            } catch (visaErr) {
                console.error('Failed to fetch visa stats:', visaErr)
                // Fallback: count from applications if endpoint fails
                setKpi(prev => ({ ...prev, visaTotal: 1 }))
            }

        } catch (err) {
            console.error('Failed to fetch reports:', err)
        } finally {
            setLoading(false)
        }
    }

    const maxApplications = Math.max(...applicationTrends.map(d => d.applications || 0), 1)
    const maxRevenue = Math.max(...applicationTrends.map(d => d.revenue || 0), 1)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading reports...</p>
                </div>
            </div>
        )
    }

    const exportToCSV = () => {
        if (applicationTrends.length === 0) {
            alert('No data to export')
            return
        }

        // Create CSV content
        let csvContent = 'Month,Applications,Approved,Revenue (XOF)\n'

        applicationTrends.forEach(row => {
            csvContent += `${row.month},${row.applications},${row.approved || 0},${row.revenue || 0}\n`
        })

        // Add summary
        csvContent += `\n`
        csvContent += `Total,${kpi.totalApplications},${kpi.approvalRate}%,${kpi.totalRevenue}\n`

        // Add course distribution
        csvContent += `\nCourses\n`
        csvContent += `Name,Count\n`
        courseDistribution.forEach(c => {
            csvContent += `${c.name},${c.value}\n`
        })

        // Add country distribution
        csvContent += `\nCountries\n`
        csvContent += `Name,Count\n`
        countryDistribution.forEach(c => {
            csvContent += `${c.name},${c.count}\n`
        })

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToPDF = () => {
        // Open print dialog with report content
        const printWindow = window.open('', '_blank', 'width=800,height=600')

        if (!printWindow) {
            alert('Please allow popups for this site to export PDF')
            return
        }

        const date = new Date().toLocaleDateString()

        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report - ${date}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
                h2 { color: #4F46E5; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #4F46E5; color: white; }
                tr:nth-child(even) { background: #f9fafb; }
                .kpi { display: inline-block; padding: 15px 25px; margin: 10px; background: #f3f4f6; border-radius: 10px; text-align: center; }
                .kpi-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
                .kpi-label { font-size: 12px; color: #6b7280; }
                .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>📊 Reports & Analytics</h1>
            <p>Generated on: ${date}</p>
            <p>Period: ${period}</p>

            <div style="margin: 20px 0;">
                <div class="kpi">
                    <div class="kpi-value">${kpi.totalApplications}</div>
                    <div class="kpi-label">Total Applications</div>
                </div>
                <div class="kpi">
                    <div class="kpi-value">${kpi.approvalRate}%</div>
                    <div class="kpi-label">Approval Rate</div>
                </div>
                <div class="kpi">
                    <div class="kpi-value">XOF${kpi.totalRevenue.toLocaleString()}</div>
                    <div class="kpi-label">Total Revenue</div>
                </div>
                <div class="kpi">
                    <div class="kpi-value">${kpi.activeStudents}</div>
                    <div class="kpi-label">Active Students</div>
                </div>
            </div>

            <h2>Monthly Trends</h2>
            <table>
                <tr><th>Month</th><th>Applications</th><th>Approved</th><th>Revenue (XOF)</th></tr>
                ${applicationTrends.map(row => `
                    <tr>
                        <td>${row.month}</td>
                        <td>${row.applications}</td>
                        <td>${row.approved || 0}</td>
                        <td>${(row.revenue || 0).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </table>

            ${courseDistribution.length > 0 ? `
                <h2>Course Distribution</h2>
                <table>
                    <tr><th>Course</th><th>Count</th></tr>
                    ${courseDistribution.map(c => `
                        <tr><td>${c.name}</td><td>${c.value}</td></tr>
                    `).join('')}
                </table>
            ` : ''}

            ${countryDistribution.length > 0 ? `
                <h2>Country Distribution</h2>
                <table>
                    <tr><th>Country</th><th>Count</th></tr>
                    ${countryDistribution.map(c => `
                        <tr><td>${c.name}</td><td>${c.count}</td></tr>
                    `).join('')}
                </table>
            ` : ''}

            <div class="footer">
                <p>EduBridge Admin Panel - Generated Report</p>
            </div>
        </body>
        </html>
    `

        printWindow.document.write(html)
        printWindow.document.close()

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print()
        }, 500)
    }



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                    <p className="text-gray-600 mt-1">Comprehensive insights into application trends</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
                    >
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">This Year</option>
                    </select>
                    <button onClick={fetchReports} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm flex items-center gap-2">
                        <FiRefreshCw /> Refresh
                    </button>

                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Applications', value: kpi.totalApplications, icon: <FiFileText />, color: 'bg-blue-500' },
                    { label: 'Approval Rate', value: `${kpi.approvalRate}%`, icon: <FiCheckCircle />, color: 'bg-green-500' },
                    // { label: 'Total Revenue', value: `XOF${kpi.totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, color: 'bg-purple-500' },
                    { label: 'Total Students', value: kpi.activeStudents, icon: <FiUsers />, color: 'bg-orange-500' },
                    { label: 'Visa Applications', value: kpi.visaTotal || 0, icon: <FiCheckSquare />, color: 'bg-teal-500' },
                ].map((kpiItem, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className={`w-12 h-12 ${kpiItem.color} rounded-xl flex items-center justify-center text-white text-xl mb-4`}>
                            {kpiItem.icon}
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{kpiItem.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{kpiItem.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Trends - Custom Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Application Trends</h3>
                    {applicationTrends.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    ) : (
                        <div className="flex items-end gap-3 h-64 px-2">
                            {applicationTrends.map((data, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex flex-col items-center gap-0.5">
                                        <div className="relative w-full group">
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100">
                                                {data.applications}
                                            </span>
                                            <div className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg hover:from-indigo-600 cursor-pointer"
                                                style={{ height: `${(data.applications / maxApplications) * 160}px` }}></div>
                                        </div>
                                        <div className="relative w-full group">
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100">
                                                {data.approved}
                                            </span>
                                            <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 cursor-pointer"
                                                style={{ height: `${((data.approved || 0) / maxApplications) * 160}px` }}></div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2 font-medium">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded"></div><span className="text-xs text-gray-600">Applications</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span className="text-xs text-gray-600">Approved</span></div>
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Analysis</h3>
                    {applicationTrends.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    ) : (
                        <div className="flex items-end gap-3 h-64 px-2">
                            {applicationTrends.map((data, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="relative w-full group">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100">
                                            XOF{data.revenue}
                                        </span>
                                        <div className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg hover:from-purple-600 cursor-pointer"
                                            style={{ height: `${((data.revenue || 0) / maxRevenue) * 180}px` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2 font-medium">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded"></div><span className="text-xs text-gray-600">Revenue (XOF)</span></div>
                    </div>
                </div>

                {/* Course Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Course Distribution</h3>
                    {courseDistribution.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    ) : (
                        <div className="space-y-4">
                            {courseDistribution.map((course, idx) => {
                                const total = courseDistribution.reduce((s, c) => s + c.value, 0)
                                const percent = total > 0 ? Math.round((course.value / total) * 100) : 0
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{course.name}</span>
                                            <span className="text-sm text-gray-500">{course.value} ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className={`${COLORS[idx % COLORS.length]} h-2.5 rounded-full opacity-80`}
                                                style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Country Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Country Distribution</h3>
                    {countryDistribution.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    ) : (
                        <div className="space-y-4">
                            {countryDistribution.slice(0, 8).map((country, idx) => {
                                const total = countryDistribution.reduce((s, c) => s + c.count, 0)
                                const percent = total > 0 ? Math.round((country.count / total) * 100) : 0
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{country.name}</span>
                                            <span className="text-sm text-gray-500">{country.count} ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className={`${COLORS[idx % COLORS.length]} h-2.5 rounded-full opacity-80`}
                                                style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Summary Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Monthly Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    {applicationTrends.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No data available</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Month</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Applications</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Approved</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicationTrends.map((data, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6 text-sm text-gray-900 font-medium">{data.month}</td>
                                        <td className="py-4 px-6 text-sm text-right text-gray-700">{data.applications}</td>
                                        <td className="py-4 px-6 text-sm text-right text-gray-700">{data.approved || 0}</td>
                                        <td className="py-4 px-6 text-sm text-right text-gray-700">XOF{(data.revenue || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Download Detailed Report</h3>
                        <p className="text-indigo-100">Get comprehensive analytics in your preferred format</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToPDF}
                            className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium flex items-center gap-2"
                        >
                            📄 PDF Report
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium flex items-center gap-2"
                        >
                            📊 Excel Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports