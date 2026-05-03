import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/universities', label: 'Universities' },
        { path: '/visa-tracker', label: 'Visa Tracker' },
    ]

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
        setIsOpen(false)
        navigate('/')
    }

    const handleApplyClick = (e) => {
        if (!user) {
            e.preventDefault()
            navigate('/login?redirect=/universities')
        }
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <motion.span
                        whileHover={{ rotate: 15 }}
                        className="text-3xl"
                    >
                        🎓
                    </motion.span>
                    <span className="text-2xl font-black tracking-tight text-gray-900">
                        Edu<span className="text-indigo-600">Bridge</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="relative text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            {link.label}
                            {location.pathname === link.path && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-600 rounded-full"
                                />
                            )}
                        </Link>
                    ))}

                    {/* Auth Section */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                                <FiChevronDown className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <FiUser size={16} /> My Dashboard
                                        </Link>
                                        {user.role === 'admin' || user.role === 'super_admin' ? (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                ⚙️ Admin Panel
                                            </Link>
                                        ) : null}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <FiLogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Apply Button - Always visible but redirects to login if not authenticated */}
                    <Link
                        to={user ? "/universities" : "/login?redirect=/universities"}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5"
                    >
                        Apply Now
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-2xl text-gray-600 p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-lg font-medium ${location.pathname === link.path ? 'text-indigo-600' : 'text-gray-600'}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 py-3 border-t border-gray-100">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/applications"
                                        className="text-gray-600 font-medium py-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Applications
                                    </Link>
                                    {user.role === 'admin' || user.role === 'super_admin' ? (
                                        <Link
                                            to="/admin"
                                            className="text-gray-600 font-medium py-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            ⚙️ Admin Panel
                                        </Link>
                                    ) : null}
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-600 font-medium text-left py-2"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                    <Link
                                        to="/login"
                                        className="text-center text-indigo-600 font-semibold py-3 border-2 border-indigo-600 rounded-xl"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            <Link
                                to={user ? "/universities" : "/login?redirect=/universities"}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 rounded-xl font-semibold mt-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Apply Now
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar