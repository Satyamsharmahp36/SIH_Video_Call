import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Languages, Settings, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSelector from './LanguageSelector';

const TranslatedCaptions = ({ 
  isActive = false, 
  onToggle = () => {},
  className = "",
  showControls = true 
}) => {
  const { 
    userLanguage, 
    doctorLanguage, 
    patientLanguage, 
    translateCaptions,
    autoTranslate,
    setAutoTranslate 
  } = useTranslation();
  
  const [captions, setCaptions] = useState([]);
  const [translatedCaptions, setTranslatedCaptions] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState('en');
  const [isMuted, setIsMuted] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const captionsRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default language
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
    };
    
    recognition.onresult = (event) => {
      const newCaptions = [];
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        newCaptions.push({
          id: Date.now(),
          text: finalTranscript,
          timestamp: new Date(),
          isFinal: true
        });
      }
      
      if (interimTranscript) {
        newCaptions.push({
          id: Date.now() + 1,
          text: interimTranscript,
          timestamp: new Date(),
          isFinal: false
        });
      }
      
      setCaptions(prev => [...prev.slice(-10), ...newCaptions]); // Keep last 10 captions
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      if (isActive) {
        recognition.start(); // Restart if still active
      }
    };
    
    setSpeechRecognition(recognition);
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isActive]);

  // Start/stop speech recognition
  useEffect(() => {
    if (speechRecognition) {
      if (isActive) {
        speechRecognition.start();
      } else {
        speechRecognition.stop();
      }
    }
  }, [isActive, speechRecognition]);

  // Auto-translate captions
  useEffect(() => {
    const translateCaptionsAsync = async () => {
      if (!autoTranslate || captions.length === 0) {
        setTranslatedCaptions(captions);
        return;
      }
      
      setIsTranslating(true);
      try {
        const translated = await translateCaptions(captions, captionLanguage);
        setTranslatedCaptions(translated);
      } catch (error) {
        console.error('Caption translation error:', error);
        setTranslatedCaptions(captions);
      } finally {
        setIsTranslating(false);
      }
    };

    translateCaptionsAsync();
  }, [captions, captionLanguage, autoTranslate, translateCaptions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (captionsRef.current) {
      captionsRef.current.scrollTop = captionsRef.current.scrollHeight;
    }
  }, [translatedCaptions]);

  const handleToggle = () => {
    onToggle(!isActive);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const clearCaptions = () => {
    setCaptions([]);
    setTranslatedCaptions([]);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="font-semibold text-gray-800">
              Live Captions {isActive ? '(Active)' : '(Inactive)'}
            </span>
          </div>
          
          {isTranslating && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Translating...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showControls && (
            <>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={18} />
              </button>
              
              <button
                onClick={handleMuteToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted 
                    ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </>
          )}
          
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isActive ? <MicOff size={18} /> : <Mic size={18} />}
            {isActive ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto-translate captions
              </label>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoTranslate ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoTranslate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <LanguageSelector
              selectedLanguage={captionLanguage}
              onLanguageChange={setCaptionLanguage}
              label="Caption Language"
              size="small"
            />
            
            <button
              onClick={clearCaptions}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Captions
            </button>
          </div>
        </div>
      )}

      {/* Captions Display */}
      <div 
        ref={captionsRef}
        className="h-48 overflow-y-auto p-4 space-y-2"
      >
        {translatedCaptions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Mic size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {isActive ? 'Listening for speech...' : 'Click Start to begin live captions'}
              </p>
            </div>
          </div>
        ) : (
          translatedCaptions.map((caption, index) => (
            <div
              key={caption.id}
              className={`p-3 rounded-lg border transition-all ${
                caption.isFinal
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-yellow-50 border-yellow-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${
                    caption.isFinal ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {caption.text}
                  </p>
                  
                  {caption.translated && (
                    <div className="flex items-center gap-1 mt-1">
                      <Languages size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-500">
                        Translated to {caption.targetLanguage?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 ml-2">
                  {caption.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>Language: {captionLanguage.toUpperCase()}</span>
            {autoTranslate && (
              <span className="flex items-center gap-1">
                <Languages size={12} />
                Auto-translate ON
              </span>
            )}
          </div>
          <span>{translatedCaptions.length} captions</span>
        </div>
      </div>
    </div>
  );
};

export default TranslatedCaptions;
