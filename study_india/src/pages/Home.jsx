import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiMapPin, FiUsers, FiBookOpen, FiLoader } from 'react-icons/fi'
import { motion } from 'framer-motion'
import UniversityCard from '../components/UniversityCard'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function Home() {
    const [universities, setUniversities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUniversities()
    }, [])

    const fetchUniversities = async () => {
        try {
            const response = await fetch(`${API_URL}/universities`)
            const result = await response.json()
            if (result.success && result.data) {
                // Only take first 3 universities
                setUniversities(result.data.slice(0, 3))
            }
        } catch (err) {
            console.error('Failed to fetch universities:', err)
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        { icon: <FiBookOpen />, number: "100+", label: "Universities" },
        { icon: <FiUsers />, number: "10,000+", label: "International Students" },
        { icon: <FiMapPin />, number: "10+", label: "Countries" },
        { icon: <FiCheckCircle />, number: "95%", label: "Visa Success" }
    ]

    const features = [
        { icon: "🎓", title: "Find Your University", description: "Browse through hundreds of Indian universities and find the perfect match." },
        { icon: "📋", title: "Easy Application", description: "Apply directly through our portal with a simple, guided process." },
        { icon: "🛂", title: "Visa Assistance", description: "Complete visa guidance with step-by-step instructions." },
        { icon: "💰", title: "Scholarship Info", description: "Access information about scholarships and financial aid." }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            🎓 Your Gateway to Indian Education
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
                            Study in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400">India</span>
                        </h1>
                        <p className="text-lg text-indigo-100 mb-8 max-w-lg leading-relaxed">
                            Join thousands of international students pursuing quality education. World-class universities, affordable fees, and a vibrant cultural experience await.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/universities" className="bg-white text-indigo-900 px-8 py-3.5 rounded-full font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                Explore Universities <FiArrowRight />
                            </Link>
                            <Link to="/visa-guide" className="bg-indigo-800/50 backdrop-blur-md border border-indigo-400/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-700/50 transition-colors">
                                View Visa Guide
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="text-3xl text-indigo-300 mb-3 flex justify-center">{stat.icon}</div>
                                <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                                <div className="text-sm font-medium text-indigo-200">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Important Notice Section */}
            <section className="py-16 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 overflow-hidden">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group"
                    >
                        {/* Animated Shiny Border */}
                        <div className="absolute inset-0 rounded-3xl p-[3px]">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-shimmer bg-[length:200%_100%]" />
                        </div>

                        {/* Inner Content */}
                        <div className="relative bg-white rounded-3xl p-8 md:p-10 m-[3px]">
                            <div className="flex items-start gap-5">
                                {/* Animated Icon */}
                                <motion.div
                                    className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-amber-200"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                >
                                    ⚠️
                                </motion.div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-gray-900">
                                        Important <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Notice</span>
                                    </h3>

                                    <div className="space-y-3 text-gray-700 leading-relaxed">
                                        <p className="text-lg font-semibold text-gray-800">
                                            EduBridge does not charge any processing fees for our services.
                                        </p>

                                        <p>
                                            The only fee involved is a <strong className="text-amber-700">one-time payment of $300</strong>,
                                            paid directly to the university for the issuance of your admission letter.
                                            There are no hidden charges or additional costs.
                                        </p>

                                        <p>
                                            We provide comprehensive assistance throughout your entire journey —
                                            <strong>from the initial application to securing your student visa — completely free of charge.</strong>
                                        </p>
                                    </div>

                                    {/* Key Points with Shine Effect */}
                                    <div className="grid sm:grid-cols-3 gap-3 pt-2">
                                        {[
                                            { emoji: "✅", text: "No Service Fees", color: "from-green-400 to-emerald-500", bg: "bg-green-50", textColor: "text-green-800" },
                                            { emoji: "💳", text: "$300 One-Time Only", color: "from-amber-400 to-orange-500", bg: "bg-amber-50", textColor: "text-amber-800" },
                                            { emoji: "🤝", text: "Free Visa Assistance", color: "from-indigo-400 to-blue-500", bg: "bg-indigo-50", textColor: "text-indigo-800" },
                                        ].map((point, i) => (
                                            <motion.div
                                                key={i}
                                                className={`${point.bg} rounded-xl p-3 text-center relative overflow-hidden group/card`}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                {/* Shine overlay */}
                                                <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${point.color} opacity-20 animate-pulse`} />
                                                </div>
                                                <span className="block text-lg relative z-10">{point.emoji}</span>
                                                <span className={`text-sm ${point.textColor} font-medium relative z-10`}>{point.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-black text-gray-900 mb-4">Why Study in <span className="text-indigo-600">India?</span></h2>
                    <p className="text-gray-600 text-lg">India offers a unique blend of quality education, cultural diversity, and unmatched affordability.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group">
                            <div className="text-4xl mb-6 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Universities Preview Section */}
            <section className="py-24 bg-indigo-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Top <span className="text-indigo-600">Universities</span></h2>
                            <p className="text-gray-600 text-lg">Explore our premier partner institutions across India</p>
                        </div>
                        <Link to="/universities" className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                            View All <FiArrowRight />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading universities...</p>
                        </div>
                    ) : universities.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {universities.map((university, index) => (
                                <motion.div key={university.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                                    <UniversityCard university={university} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <p className="text-gray-500">No universities found. Please check your connection.</p>
                        </div>
                    )}

                    <Link to="/universities" className="md:hidden mt-8 flex justify-center items-center gap-2 text-indigo-600 font-bold">
                        View All Universities <FiArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default Home