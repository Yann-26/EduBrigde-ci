// components/admin/Sidebar.jsx
import React from 'react'
import {
    FiHome, FiUsers, FiFileText, FiDollarSign, FiSettings,
    FiLogOut, FiMenu, FiX, FiBookOpen, FiUserCheck, FiBell, FiPieChart,
    FiCheckSquare, FiFile
} from 'react-icons/fi'

function Sidebar({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) {

    // Grouped menu items into logical sections
    const menuSections = [
        {
            title: 'Overview',
            items: [
                { icon: <FiHome size={20} />, label: 'Dashboard', tab: 'dashboard' },
                { icon: <FiPieChart size={20} />, label: 'Reports', tab: 'reports' },
                { icon: <FiBell size={20} />, label: 'Notifications', tab: 'notifications' },
            ]
        },
        {
            title: 'Admissions',
            items: [
                { icon: <FiBookOpen size={20} />, label: 'Universities', tab: 'universities' },
                { icon: <FiUsers size={20} />, label: 'Applications', tab: 'applications' },
                { icon: <FiDollarSign size={20} />, label: 'Payments', tab: 'payments' },
            ]
        },
        {
            title: 'Visa & Documents',
            items: [
                { icon: <FiFileText size={20} />, label: 'Documents', tab: 'documents' },
                { icon: <FiCheckSquare size={20} />, label: 'Visa Steps', tab: 'visa-steps' },
                { icon: <FiFile size={20} />, label: 'Visa Applications', tab: 'visa-applications' },
            ]
        },
        {
            title: 'Administration',
            items: [
                { icon: <FiUserCheck size={20} />, label: 'Users', tab: 'users' },
                { icon: <FiSettings size={20} />, label: 'Settings', tab: 'settings' },
            ]
        }
    ]

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 fixed h-full z-20 flex flex-col`}>

            {/* Header Section */}
            <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {sidebarOpen && (
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                EduAdmin
                            </h1>
                            <p className="text-xs text-slate-400 mt-1">Management Portal</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg ${!sidebarOpen && 'mx-auto'}`}
                    >
                        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* Scrollable Nav Section */}
            <div className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <nav className="px-3 py-4">
                    {menuSections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="mb-6 last:mb-0">

                            {/* Section Header */}
                            {sidebarOpen ? (
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">
                                    {section.title}
                                </h3>
                            ) : (
                                /* Small visual divider when collapsed */
                                <div className="h-px bg-slate-700/50 w-8 mx-auto mb-4 mt-2"></div>
                            )}

                            {/* Section Items */}
                            <div className="space-y-1">
                                {section.items.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTab(item.tab)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === item.tab
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                            }`}
                                    >
                                        <span className="flex-shrink-0">{item.icon}</span>

                                        {sidebarOpen && (
                                            <span className="font-medium truncate">{item.label}</span>
                                        )}

                                        {/* Floating Tooltip for collapsed state */}
                                        {!sidebarOpen && (
                                            <div className="absolute left-16 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
                                                {item.label}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Anchored Footer Section */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 flex-shrink-0">
                <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-4`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-indigo-600/20">
                            A
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">Admin User</p>
                                <p className="text-[11px] text-slate-400 uppercase tracking-wider truncate">Super Admin</p>
                            </div>
                        )}
                    </div>
                </div>
                <button className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors`}>
                    <FiLogOut size={18} className="flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>

        </div>
    )
}

export default Sidebar