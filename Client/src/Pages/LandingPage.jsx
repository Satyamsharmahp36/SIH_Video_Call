import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import {
  Video,
  Shield,
  Stethoscope,
  Heart,
  Plus,
  LogIn,
  Link,
  Activity,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  const [roomInput, setRoomInput] = useState("");
  const [joinType, setJoinType] = useState("doctor");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = nanoid(6);
    navigate(joinType === "ai" ? `/room/onlyai/${newRoomId}` : `/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    let roomId = roomInput.trim();
    if (roomId.includes("/room/")) roomId = roomId.split("/room/")[1];
    if (!roomId) return alert("Please enter a valid Room ID or link");
    navigate(joinType === "ai" ? `/room/onlyai/${roomId}` : `/room/${roomId}`);
  };

  const features = [
    {
      icon: Shield,
      title: "End‑to‑End Security",
      description:
        "HIPAA-compliant encryption ensures total patient privacy and safe data exchange.",
    },
    {
      icon: Video,
      title: "Seamless Consultations",
      description:
        "Adaptive AI‑backed video calls deliver clear, low-latency healthcare consultations.",
    },
    {
      icon: Activity,
      title: "Smart Records System",
      description:
        "Digital records integrated with AI insights for continuous health tracking and diagnosis.",
    },
    {
      icon: Heart,
      title: "Prescription Automation",
      description:
        "Doctors can issue e‑prescriptions instantly to nearby pharmacies with availability tracking.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-violet-50 text-gray-900 font-inter overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
                Nirogya
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Agentic AI Healthcare Platform
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live & Secure
          </div>
        </div>
      </header>

      {/* Main Section with Hero & Features side by side */}
      <main className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-[1.3fr_1fr] gap-16 items-start">
        {/* LEFT – Hero & Room */}
        <div className="space-y-10 max-w-lg">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50/70 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm border border-blue-100 shadow-sm">
              <Heart size={16} /> Smarter Healthcare for All
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight">
              Empowering India through 
              <span>  </span>
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Intelligent Care
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              Nirogya bridges rural and urban healthcare through AI‑powered consultations, 
              low‑bandwidth access, and smart medical record management—all in one intuitive platform.
            </p>
          </div>

          {/* Room Type Selection */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={() => setJoinType("doctor")}
              className={`flex-1 px-6 py-5 rounded-2xl border-2 font-semibold transition-all transform hover:scale-[1.03] ${
                joinType === "doctor"
                  ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Stethoscope size={28} />
                <span>Doctor Room</span>
              </div>
            </button>

            <button
              onClick={() => setJoinType("ai")}
              className={`flex-1 px-6 py-5 rounded-2xl border-2 font-semibold transition-all transform hover:scale-[1.03] ${
                joinType === "ai"
                  ? "border-violet-600 bg-gradient-to-br from-violet-50 to-blue-100 text-violet-700 shadow-md"
                  : "border-gray-200 bg-white hover:border-violet-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Bot size={28} />
                <span>AI Room</span>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-4 mt-10">
            <button
              onClick={handleCreateRoom}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-violet-400/30 transition-all hover:scale-105"
            >
              <Plus size={24} />
              Start New Consultation
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-gray-500 font-medium text-sm">or</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Enter Room ID or Link"
                  className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all overflow-hidden text-ellipsis"
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>

              <button
                onClick={handleJoinRoom}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-violet-50 border-2 border-gray-200 hover:border-blue-500 px-6 py-4 rounded-2xl text-lg font-medium text-gray-700 hover:text-blue-700 hover:bg-white transition-all duration-200"
              >
                <LogIn size={20} />
                Join {joinType === "ai" ? "AI" : "Doctor"} Room
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT – Feature Cards 2x2 Grid */}
        {/* Features Section */}
<div className="px-4 py-2">
  <div className="grid grid-cols-2 grid-rows-2 gap-x-34 gap-y-16 max-w-2xl mx-auto lg:mx-0">
    {features.map((f, i) => (
      <div
        key={i}
        className="flex flex-col justify-between bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-[1.04] text-center min-w-[260px]"
        style={{ height: "260px" }}
      >
        <div>
          <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <f.icon size={22} className="text-white" />
          </div>
          <h4 className="font-semibold text-lg text-gray-900 mb-2 whitespace-nowrap text-ellipsis overflow-hidden">
            {f.title}
          </h4>
          <p className="text-sm text-gray-600 leading-snug h-[80px] overflow-hidden">
            {f.description}
          </p>
        </div>
        <div className="mt-4 w-16 h-1 bg-gradient-to-r from-blue-500 to-violet-500 mx-auto rounded-full"></div>
      </div>
    ))}
  </div>
</div>

      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-violet-600 to-teal-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="text-sm tracking-wide">
              © 2025 Nirogya Agentic AI Healthcare
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
