import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone,
  MessageSquare,
  FileText,
  User,
  Clock,
  Pill,
  Send,
  Minimize2,
  Maximize2,
  Settings,
  Activity,
  Heart,
  Thermometer,
  AlertTriangle,
  Calendar,
  MapPin,
  UserPlus,
  Users,
  Shield,
  Stethoscope
} from "lucide-react";
import "./Room.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const socket = io(baseUrl, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export default function MedicalRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Core video call state - SIMPLIFIED
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [remoteVideoStatus, setRemoteVideoStatus] = useState({});

  // Role-based state - SIMPLIFIED
  const [userRole, setUserRole] = useState("patient"); // Default to patient
  const [isFirstUser, setIsFirstUser] = useState(false);
  const isDoctor = userRole === "doctor";
  const [showDoctorPanel, setShowDoctorPanel] = useState(true);
  const [activeTab, setActiveTab] = useState("patient");
  const [sessionStartTime] = useState(new Date());
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "🏥 Medical consultation room initialized. Secure connection established.",
      sender: "System",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [prescription, setPrescription] = useState({
    medications: "",
    instructions: "",
    followUp: ""
  });

  // Patient data - Initialize immediately for doctors
  const [patientInfo, setPatientInfo] = useState(null);

  // Patient database (unchanged)
  const patientDatabase = {
    "patient-sarah-123": {
      name: "Anshul Kashyap",
      age: 34,
      id: "P-2024-001",
      mrn: "MRN-789456123",
      dob: "March 15, 1990",
      gender: "Male",
      phone: "(555) 123-4567",
      email: "anshul.kashyap@email.com",
      address: "123 Oak Street, Springfield, IL 62701",
      emergencyContact: {
        name: "Priya Kashyap (Wife)",
        phone: "(555) 987-6543",
        relationship: "Spouse"
      },
      insurance: {
        provider: "Blue Cross Blue Shield Illinois",
        policyNumber: "BC123456789",
        groupNumber: "GRP001",
        copay: "$25"
      },
      condition: "Hypertension Management & Type 2 Diabetes Follow-up",
      chiefComplaint: "Follow-up for blood pressure management and diabetes monitoring. Reports occasional dizziness and increased thirst.",
      lastVisit: "August 15, 2024",
      nextAppointment: "October 25, 2025",
      primaryPhysician: "Dr. Emily Smith, MD - Internal Medicine",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily in morning",
          startDate: "January 15, 2024",
          indication: "Hypertension",
          prescriber: "Dr. Smith",
          pharmacy: "CVS Pharmacy #3456",
          refillsRemaining: 3,
          lastFilled: "September 1, 2024"
        },
        {
          name: "Metformin XR",
          dosage: "500mg",
          frequency: "Twice daily with meals",
          startDate: "November 20, 2023",
          indication: "Type 2 Diabetes Mellitus",
          prescriber: "Dr. Smith",
          pharmacy: "CVS Pharmacy #3456",
          refillsRemaining: 5,
          lastFilled: "September 5, 2024"
        }
      ],
      allergies: [
        {
          allergen: "Penicillin",
          reaction: "Severe skin rash, difficulty breathing, swelling of face and throat",
          severity: "High",
          dateReported: "June 10, 2015",
          reportedBy: "Emergency Department - Springfield General",
          notes: "Anaphylactic reaction - carries EpiPen"
        }
      ],
      vitals: {
        bloodPressure: "142/88",
        heartRate: "76 bpm",
        temperature: "98.7°F",
        respiratoryRate: "18/min",
        oxygenSat: "97%",
        height: "5'6\" (168 cm)",
        weight: "172 lbs (78 kg)",
        bmi: "27.7",
        painScale: "2/10",
        lastUpdated: "September 20, 2025 - 2:15 PM"
      },
      labResults: [
        {
          test: "HbA1c (Hemoglobin A1C)",
          value: "7.4%",
          normalRange: "< 7.0% for diabetics",
          status: "Slightly elevated",
          date: "September 1, 2024",
          trend: "↑ from 7.2% (June 2024)",
          notes: "Target <7% for diabetes management"
        }
      ]
    }
  };

  // Core video functionality refs
  const localVideoRef = useRef();
  const localStream = useRef(null);
  const peerConnections = useRef({});
  const remoteVideoRefs = useRef({});
  const audioContextRef = useRef(null);
  const analysersRef = useRef({});

  // Effect to handle window resizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ICE server configuration
  const iceConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  };

  // Audio level detection setup
  const setupAudioAnalyser = (userId, stream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 32;
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyser);
    analysersRef.current[userId] = analyser;
  };

  // Detect active speaker
  useEffect(() => {
    if (Object.keys(analysersRef.current).length === 0) return;
    const interval = setInterval(() => {
      const dataArray = new Uint8Array(32);
      let maxVolume = 0;
      let loudestUserId = null;
      Object.entries(analysersRef.current).forEach(([userId, analyser]) => {
        analyser.getByteFrequencyData(dataArray);
        const volume = Math.max(...dataArray);
        if (volume > maxVolume && volume > 30) {
          maxVolume = volume;
          loudestUserId = userId;
        }
      });
      setActiveSpeaker(loudestUserId);
    }, 200);
    return () => clearInterval(interval);
  }, [remoteUsers]);

  // Create peer connection - MOVED BEFORE useEffect
  const createPeerConnection = useCallback((remoteUserId) => {
    if (peerConnections.current[remoteUserId]) return;
    
    console.log("Creating peer connection for:", remoteUserId);
    const pc = new RTCPeerConnection(iceConfig);
    peerConnections.current[remoteUserId] = pc;
    
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current);
      });
    }
    
    pc.ontrack = (event) => {
      console.log("Received track from:", remoteUserId);
      if (event.streams && event.streams[0]) {
        if (remoteVideoRefs.current[remoteUserId]) {
          remoteVideoRefs.current[remoteUserId].srcObject = event.streams[0];
          setupAudioAnalyser(remoteUserId, event.streams[0]);
        }
        const videoTrack = event.streams[0].getVideoTracks()[0];
        if (videoTrack) {
          setRemoteVideoStatus((prev) => ({
            ...prev,
            [remoteUserId]: videoTrack.enabled,
          }));
          videoTrack.onmute = () => {
            setRemoteVideoStatus((prev) => ({
              ...prev,
              [remoteUserId]: false,
            }));
          };
          videoTrack.onunmute = () => {
            setRemoteVideoStatus((prev) => ({ ...prev, [remoteUserId]: true }));
          };
        }
      }
    };
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", {
          to: remoteUserId,
          data: { type: "candidate", candidate: event.candidate },
        });
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        if (peerConnections.current[remoteUserId]) {
          peerConnections.current[remoteUserId].close();
          delete peerConnections.current[remoteUserId];
        }
        setRemoteUsers((prev) => prev.filter((id) => id !== remoteUserId));
        delete analysersRef.current[remoteUserId];
        setRemoteVideoStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[remoteUserId];
          return newStatus;
        });
      }
    };
    
    pc.onnegotiationneeded = async () => {
      try {
        if (socket.id > remoteUserId) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("signal", {
            to: remoteUserId,
            data: { type: "offer", sdp: pc.localDescription },
          });
        }
      } catch (err) {
        console.error("Error during negotiation:", err);
      }
    };
  }, []);

  // Core setup effect - SIMPLIFIED
  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setupAudioAnalyser("local", stream);
        socket.connect();
      } catch (err) {
        console.error("Failed to get media:", err);
        alert("Camera and microphone access required!");
        navigate("/");
      }
    };

    const onConnect = () => {
      console.log("Connected to server");
      setConnectionStatus("connected");
      socket.emit("join-room", roomId); // Simple string, not object
    };

    const onDisconnect = () => {
      console.log("Disconnected from server");
      setConnectionStatus("disconnected");
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      setRemoteUsers([]);
      analysersRef.current = {};
    };

    // SIMPLE: Receive existing users
    const onAllUsers = (usersList) => {
      console.log("Existing users:", usersList);
      setRemoteUsers(usersList.filter(id => id !== socket.id));
      usersList.forEach(userId => {
        if (userId !== socket.id) {
          createPeerConnection(userId);
        }
      });
    };

    // SIMPLE: Get role assignment from server
    const onUserRole = ({ role, isFirst }) => {
      console.log("My role:", role, "First user:", isFirst);
      setUserRole(role);
      setIsFirstUser(isFirst);
      
      // FIX: Load patient data immediately for doctors
      if (role === "doctor") {
        const patientData = patientDatabase["patient-sarah-123"];
        setPatientInfo(patientData);
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          text: `🩺 Welcome Doctor! Patient ${patientData.name} records loaded and ready for consultation.`,
          sender: "System",
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };

    // SIMPLE: New user joined
    const onUserJoined = (userId) => {
      console.log("User joined:", userId);
      setRemoteUsers(prev => [...prev, userId]);
      createPeerConnection(userId);
      
      // Update chat when patient joins (but don't reload patient data)
      if (isDoctor && patientInfo) {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          text: `👤 Patient ${patientInfo.name} has joined the consultation room.`,
          sender: "System",
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };

    const onUserDisconnected = (userId) => {
      console.log("User disconnected:", userId);
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setRemoteUsers(prev => prev.filter(id => id !== userId));
      delete analysersRef.current[userId];
      setRemoteVideoStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[userId];
        return newStatus;
      });
    };

    const onSignal = async ({ from, data }) => {
      console.log("Signal received from:", from, "type:", data.type);
      const pc = peerConnections.current[from];
      if (!pc) return;
      try {
        if (data.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("signal", { to: from, data: { type: "answer", sdp: pc.localDescription } });
        } else if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === "candidate") {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("Signal error:", err);
      }
    };

    setupMedia();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("all-users", onAllUsers);
    socket.on("user-role", onUserRole); // NEW: Listen for role assignment
    socket.on("user-joined", onUserJoined);
    socket.on("user-disconnected", onUserDisconnected);
    socket.on("signal", onSignal);

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("all-users", onAllUsers);
      socket.off("user-role", onUserRole);
      socket.off("user-joined", onUserJoined);
      socket.off("user-disconnected", onUserDisconnected);
      socket.off("signal", onSignal);
      if (socket.connected) socket.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [roomId, navigate, createPeerConnection, isDoctor]); // Keep createPeerConnection in dependencies

  // Medical functionality handlers
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: isDoctor ? "Doctor" : "Patient",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const handlePrescriptionSave = () => {
    if (!patientInfo) {
      alert("Please wait for a patient to join before creating a prescription.");
      return;
    }
    console.log("Prescription saved:", prescription);
    alert(`✅ Digital Prescription Saved Successfully!\n\n📋 Patient: ${patientInfo.name}\n🏥 Provider: Dr. Emily Smith, MD\n📅 Date: ${new Date().toLocaleDateString()}\n🏪 Pharmacy: CVS Pharmacy #3456 - Main Street`);
  };

  // Core control handlers - individual per user
  const handleHangUp = () => {
    socket.disconnect();
    navigate("/");
  };

  const toggleAudio = () => {
    if (localStream.current) {
      localStream.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsVideoEnabled((prev) => !prev);
    }
  };

  // Helper functions
  const getGridClass = () => {
    const totalParticipants = remoteUsers.length + 1;
    if (totalParticipants <= 1) return "participants-1";
    if (totalParticipants === 2) return "participants-2";
    if (totalParticipants === 3) return "participants-3";
    if (totalParticipants === 4) return "participants-4";
    if (totalParticipants <= 6) return "participants-6";
    if (totalParticipants <= 9) return "participants-9";
    return "participants-many";
  };

  const getVideoTileClass = (userId) => {
    let classes = "video-tile";
    if (userId === "local") classes += " local";
    if (activeSpeaker === userId) classes += " active-speaker";
    return classes;
  };

  const getVideoClass = (userId) => {
    let classes = "video-element";
    if (userId === "local") classes += " local";
    if (activeSpeaker && activeSpeaker !== userId && userId !== "local")
      classes += " dimmed";
    return classes;
  };

  const getSessionDuration = () => {
    const now = new Date();
    const diff = now - sessionStartTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [sessionDuration, setSessionDuration] = useState("00:00");
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(getSessionDuration());
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  return (
    <div className="room-container">
      {/* Enhanced Header with Medical Info */}
      <div className="room-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '1rem 2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 className="room-title" style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                🏥 Nirmay Consultation Room: {roomId}
              </h2>
              <div className={`status-indicator ${connectionStatus}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div className={`status-dot ${connectionStatus}`} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: connectionStatus === "connected" ? '#10b981' : '#f59e0b'
                }} />
                <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                  {connectionStatus === "connected" ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.25)', 
                padding: '0.5rem 1rem', 
                borderRadius: '1rem', 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                👥 {remoteUsers.length + 1} participants
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.25)', 
                padding: '0.5rem 1rem', 
                borderRadius: '1rem', 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                ⏱️ {sessionDuration}
              </div>
              <div style={{ 
                background: isDoctor 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(16, 185, 129, 0.3)', 
                padding: '0.5rem 1rem', 
                borderRadius: '1rem', 
                color: 'white', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {isDoctor ? "👨‍⚕️ DOCTOR" : "👤 PATIENT"}
              </div>
            </div>
          </div>
          
          {/* Only show medical panel toggle for doctors */}
          {isDoctor && (
            <button
              onClick={() => setShowDoctorPanel(!showDoctorPanel)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '1rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.35)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
              }}
            >
              {showDoctorPanel ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>🩺 Medical Panel</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 140px)' }}>
        {/* Main Video Area */}
        <div className={`video-grid ${getGridClass()}`} style={{ 
          flex: isDoctor && showDoctorPanel ? '2' : '1',
          transition: 'all 0.3s ease'
        }}>
          {/* Local video */}
          <div className={getVideoTileClass("local")} style={{ position: 'relative' }}>
            {!isVideoEnabled && (
              <div className="video-avatar" style={{
                background: isDoctor 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                {isDoctor ? <Stethoscope size={48} color="white" /> : <User size={48} color="white" />}
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {isDoctor ? "Dr. Emily Smith" : "You"}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {isDoctor ? "Internal Medicine" : "Patient"}
                  </div>
                </div>
              </div>
            )}
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={getVideoClass("local")}
              style={{ display: isVideoEnabled ? "block" : "none" }}
            />
            <div className="video-label" style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="video-name" style={{ fontWeight: '600' }}>
                {isDoctor ? "Dr. Smith" : "You"}
              </span>
              <span className={`video-status ${isMuted ? "muted" : "active"}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                opacity: 0.8
              }}>
                {isMuted ? (
                  <>
                    <MicOff size={12} /> Muted
                  </>
                ) : (
                  <>
                    <Mic size={12} /> Active
                  </>
                )}
              </span>
            </div>
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{
                background: isDoctor 
                  ? 'rgba(59, 130, 246, 0.9)' 
                  : 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {isDoctor ? '🩺 DOCTOR' : '👤 PATIENT'}
              </div>
            </div>
          </div>

          {/* Remote videos */}
          {remoteUsers.map((userId) => (
            <div key={userId} className={getVideoTileClass(userId)} style={{ position: 'relative' }}>
              {remoteVideoStatus[userId] === false && (
                <div className="video-avatar" style={{
                  background: patientInfo 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  {patientInfo ? (
                    <div style={{
                      width: '4rem',
                      height: '4rem',
                      background: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#059669'
                    }}>
                      {patientInfo.name.charAt(0)}
                    </div>
                  ) : (
                    <VideoOff size={isMobile ? 24 : 32} color="white" />
                  )}
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {patientInfo ? patientInfo.name : `User ${userId.substring(0, 6)}`}
                    </div>
                    {patientInfo && (
                      <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                        Age {patientInfo.age} • {patientInfo.id}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <video
                ref={(el) => (remoteVideoRefs.current[userId] = el)}
                autoPlay
                playsInline
                className={getVideoClass(userId)}
                style={{
                  display: remoteVideoStatus[userId] !== false ? "block" : "none",
                }}
              />
              <div className="video-label" style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className="video-name" style={{ fontWeight: '600' }}>
                  {patientInfo ? patientInfo.name : `User ${userId.substring(0, 6)}`}
                </span>
                {activeSpeaker === userId && (
                  <span className="video-status speaking" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#10b981'
                  }}>
                    <Mic size={12} /> Speaking
                  </span>
                )}
              </div>
              {patientInfo && isDoctor && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    👤 PATIENT
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Medical Panel - Only visible to doctors */}
        {isDoctor && showDoctorPanel && (
          <div style={{
            flex: '1',
            minWidth: '400px',
            background: 'white',
            borderLeft: '4px solid #3b82f6',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Medical panel tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #e5e7eb',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
              {[
                { id: "patient", icon: User, label: "📋 Medical Records", color: "blue" },
                { id: "chat", icon: MessageSquare, label: "💬 Chat", color: "purple" },
                { id: "prescription", icon: FileText, label: "💊 Prescription", color: "green" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === tab.id ? 'white' : 'transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                    borderBottom: activeTab === tab.id ? '4px solid #3b82f6' : 'none'
                  }}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Enhanced panel content with better styling */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {activeTab === "patient" && patientInfo && (
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                  {/* Patient Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    marginBottom: '1.5rem',
                    border: '2px solid #3b82f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {patientInfo.name.charAt(0)}
                      </div>
                      <div>
                        <h2 style={{ margin: 0, color: '#1e40af', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {patientInfo.name}
                        </h2>
                        <p style={{ margin: 0, color: '#3730a3', fontSize: '1rem', opacity: 0.8 }}>
                          Age {patientInfo.age} • {patientInfo.gender} • ID: {patientInfo.id}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      color: '#374151'
                    }}>
                      <strong>Chief Complaint:</strong> {patientInfo.chiefComplaint}
                    </div>
                  </div>

                  {/* Current Vitals */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      🩺 Current Vitals
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem'
                    }}>
                      {[
                        { label: 'Blood Pressure', value: patientInfo.vitals.bloodPressure, icon: '💓' },
                        { label: 'Heart Rate', value: patientInfo.vitals.heartRate, icon: '❤️' },
                        { label: 'Temperature', value: patientInfo.vitals.temperature, icon: '🌡️' },
                        { label: 'Oxygen Sat', value: patientInfo.vitals.oxygenSat, icon: '🫁' }
                      ].map((vital, index) => (
                        <div key={index} style={{
                          background: '#f8fafc',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b7280', 
                            marginBottom: '0.25rem',
                            fontWeight: '600'
                          }}>
                            {vital.icon} {vital.label}
                          </div>
                          <div style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: 'bold', 
                            color: '#374151' 
                          }}>
                            {vital.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      💊 Current Medications
                    </h3>
                    {patientInfo.medications.map((med, index) => (
                      <div key={index} style={{
                        background: '#fef3c7',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                        border: '1px solid #fbbf24'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#92400e',
                          marginBottom: '0.25rem'
                        }}>
                          {med.name} {med.dosage}
                        </div>
                        <div style={{ color: '#92400e', fontSize: '0.875rem' }}>
                          {med.frequency} • {med.indication}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Allergies */}
                  <div>
                    <h3 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      ⚠️ Allergies
                    </h3>
                    {patientInfo.allergies.map((allergy, index) => (
                      <div key={index} style={{
                        background: '#fecaca',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                        border: '2px solid #ef4444'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#dc2626',
                          marginBottom: '0.25rem'
                        }}>
                          {allergy.allergen} - {allergy.severity} Risk
                        </div>
                        <div style={{ color: '#7f1d1d', fontSize: '0.875rem' }}>
                          {allergy.reaction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "patient" && !patientInfo && (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem',
                  flex: 1,
                  color: '#6b7280'
                }}>
                  <User size={64} color="#d1d5db" />
                  <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#374151' }}>
                    No Patient Data Available
                  </h3>
                  <p style={{ textAlign: 'center', margin: 0 }}>
                    Patient information will appear when medical records are loaded
                  </p>
                </div>
              )}

              {activeTab === "chat" && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '1.5rem',
                    background: '#f8fafc'
                  }}>
                    {chatMessages.map((message) => (
                      <div key={message.id} style={{ 
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: message.sender === 'System' ? '#dbeafe' : 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: message.sender === 'System' ? '#1e40af' : '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          {message.sender}
                        </div>
                        <div style={{ color: '#374151', marginBottom: '0.5rem' }}>
                          {message.text}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {message.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    padding: '1rem',
                    background: 'white',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      style={{ 
                        flex: 1, 
                        padding: '0.75rem', 
                        border: '2px solid #d1d5db', 
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        background: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "prescription" && (
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                  <h3 style={{ color: '#374151', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    💊 Digital Prescription
                  </h3>
                  {patientInfo ? (
                    <div>
                      <div style={{
                        background: '#f0f9ff',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        border: '1px solid #0ea5e9'
                      }}>
                        <strong style={{ color: '#0369a1' }}>Creating prescription for:</strong>
                        <div style={{ color: '#0369a1', marginTop: '0.25rem' }}>
                          {patientInfo.name} (Age {patientInfo.age}) • {patientInfo.id}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem', 
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Medications & Dosage:
                        </label>
                        <textarea
                          placeholder="Enter medications, dosage, and frequency..."
                          value={prescription.medications}
                          onChange={(e) => setPrescription(prev => ({...prev, medications: e.target.value}))}
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            padding: '0.75rem', 
                            border: '2px solid #d1d5db',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem', 
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Instructions:
                        </label>
                        <textarea
                          placeholder="Special instructions for patient..."
                          value={prescription.instructions}
                          onChange={(e) => setPrescription(prev => ({...prev, instructions: e.target.value}))}
                          style={{ 
                            width: '100%', 
                            height: '80px', 
                            padding: '0.75rem', 
                            border: '2px solid #d1d5db',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem', 
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Follow-up Instructions:
                        </label>
                        <textarea
                          placeholder="Follow-up appointment details..."
                          value={prescription.followUp}
                          onChange={(e) => setPrescription(prev => ({...prev, followUp: e.target.value}))}
                          style={{ 
                            width: '100%', 
                            height: '60px', 
                            padding: '0.75rem', 
                            border: '2px solid #d1d5db',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <button
                        onClick={handlePrescriptionSave}
                        style={{ 
                          width: '100%',
                          padding: '1rem 1.5rem', 
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '0.75rem',
                          fontWeight: '700',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FileText size={20} />
                        Save Digital Prescription
                      </button>
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem',
                      color: '#6b7280'
                    }}>
                      <FileText size={64} color="#d1d5db" />
                      <h4 style={{ marginTop: '1rem', color: '#374151' }}>
                        Patient Required
                      </h4>
                      <p>Wait for a patient to join before creating a prescription</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="controls-container" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '1.5rem 2rem',
        borderTop: '4px solid #e2e8f0',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <button
            onClick={toggleAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isMuted 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              color: isMuted ? 'white' : '#374151',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            {isMuted ? "🔊 Unmute" : "🔇 Mute"}
          </button>
          
          <button
            onClick={toggleVideo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: !isVideoEnabled 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              color: !isVideoEnabled ? 'white' : '#374151',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            {isVideoEnabled ? "📹 Stop Video" : "📷 Start Video"}
          </button>
          
          <button
            onClick={handleHangUp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Phone size={20} />
            🔚 End Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
