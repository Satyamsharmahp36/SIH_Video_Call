import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { 
  Video, 
  Users, 
  Shield, 
  Stethoscope, 
  Heart, 
  Calendar,
  Plus,
  LogIn,
  Link,
  Activity
} from 'lucide-react'

export default function LandingPage() {
    const [roomInput, setRoomInput] = useState('')
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        const newRoomId = nanoid(6)
        navigate(`/room/${newRoomId}`)
    }

    const handleJoinRoom = () => {
        let roomId = roomInput.trim()

        if(roomId.includes('/room/')){
            const parts = roomId.split('/room/')
            roomId = parts[1];
        }

        if(roomId){
            navigate(`/room/${roomId}`)
        }
        else{
            alert('Please enter a valid Room ID or link')
        }
    }

    const features = [
        {
            icon: Shield,
            title: "Secure & HIPAA Compliant",
            description: "End-to-end encryption ensures patient privacy and data security"
        },
        {
            icon: Video,
            title: "HD Video Consultations",
            description: "Crystal clear video quality for effective remote consultations"
        },
        {
            icon: Activity,
            title: "Medical Records Integration",
            description: "Access patient history, vitals, and medical data during consultations"
        },
        {
            icon: Heart,
            title: "Digital Prescriptions",
            description: "Create and send electronic prescriptions directly to pharmacies"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Stethoscope size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Nirmay
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">Telemedicine Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Live & Secure
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Hero Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                <Heart size={16} />
                                Healthcare Made Simple
                            </div>
                            
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Connect with{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Patients
                                </span>{' '}
                                Seamlessly
                            </h1>
                            
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Secure, HIPAA-compliant telemedicine platform for healthcare professionals. 
                                Conduct consultations, access medical records, and provide care from anywhere.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button 
                                onClick={handleCreateRoom}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={24} />
                                Start New Consultation
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="h-px bg-gray-300 flex-1"></div>
                                <span className="text-gray-500 font-medium">or</span>
                                <div className="h-px bg-gray-300 flex-1"></div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Link size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={roomInput} 
                                        onChange={(e) => setRoomInput(e.target.value)}
                                        placeholder="Enter Room ID or consultation link"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                    />
                                </div>
                                <button 
                                    onClick={handleJoinRoom}
                                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-6 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 hover:bg-blue-50"
                                >
                                    <LogIn size={20} />
                                    Join Room
                                </button>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield size={16} className="text-green-500" />
                                <span className="font-semibold">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users size={16} className="text-blue-500" />
                                <span className="font-semibold">Multi-participant</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Video size={16} className="text-purple-500" />
                                <span className="font-semibold">HD Video Quality</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Feature Cards */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                                    <Calendar size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Quick Start</h3>
                                    <p className="text-gray-600">Ready in seconds</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
                                    <span>Click "Start New Consultation"</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
                                    <span>Share room link with patient</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">3</div>
                                    <span>Begin secure consultation</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                        <feature.icon size={20} className="text-white" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-700 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">
                            Trusted by Healthcare Professionals
                        </h2>
                        <p className="text-xl text-blue-100">
                            Join thousands of doctors providing quality care through our secure platform
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 pt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">99.9%</div>
                                <div className="text-blue-200 text-sm">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">256-bit</div>
                                <div className="text-blue-200 text-sm">Encryption</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-blue-200 text-sm">Support</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">HIPAA</div>
                                <div className="text-blue-200 text-sm">Compliant</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Stethoscope size={16} className="text-white" />
                            </div>
                            <span className="text-gray-600">© 2025 Nirmay Telemedicine Platform</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
