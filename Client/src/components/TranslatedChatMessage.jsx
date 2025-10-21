import React, { useState, useEffect } from 'react';
import { Languages, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

const TranslatedChatMessage = ({ message, isDoctor, showTranslationControls = true }) => {
  const { 
    userLanguage, 
    doctorLanguage, 
    patientLanguage, 
    translateChatMessage,
    autoTranslate 
  } = useTranslation();
  
  const [translatedMessage, setTranslatedMessage] = useState(message);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  // Determine target language based on user role
  const targetLanguage = isDoctor ? doctorLanguage : patientLanguage;

  // Auto-translate message when it changes
  useEffect(() => {
    const autoTranslateMessage = async () => {
      if (!autoTranslate || !message.text || message.translated) return;
      
      setIsTranslating(true);
      setTranslationError(null);
      
      try {
        const translated = await translateChatMessage(message, targetLanguage);
        setTranslatedMessage(translated);
      } catch (error) {
        console.error('Auto-translation failed:', error);
        setTranslationError('Translation failed');
        setTranslatedMessage(message);
      } finally {
        setIsTranslating(false);
      }
    };

    autoTranslateMessage();
  }, [message, targetLanguage, autoTranslate, translateChatMessage]);

  // Manual translation function
  const handleManualTranslate = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    setTranslationError(null);
    
    try {
      const translated = await translateChatMessage(message, targetLanguage);
      setTranslatedMessage(translated);
    } catch (error) {
      console.error('Manual translation failed:', error);
      setTranslationError('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle between original and translated text
  const toggleOriginal = () => {
    setShowOriginal(!showOriginal);
  };

  const displayText = showOriginal && translatedMessage.originalText 
    ? translatedMessage.originalText 
    : translatedMessage.text;

  const isTranslated = translatedMessage.translated || translatedMessage.originalText;

  return (
    <div className="relative group">
      <div className={`
        p-4 rounded-lg border transition-all duration-200
        ${message.sender === 'System' 
          ? 'bg-blue-50 border-blue-200' 
          : message.sender === 'Doctor'
          ? 'bg-purple-50 border-purple-200'
          : 'bg-green-50 border-green-200'
        }
        ${isTranslating ? 'opacity-70' : ''}
      `}>
        {/* Message header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`
              font-semibold text-sm
              ${message.sender === 'System' 
                ? 'text-blue-700' 
                : message.sender === 'Doctor'
                ? 'text-purple-700'
                : 'text-green-700'
              }
            `}>
              {message.sender}
            </span>
            {isTranslated && (
              <div className="flex items-center gap-1">
                <Languages size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">
                  {translatedMessage.targetLanguage?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {message.timestamp}
          </div>
        </div>

        {/* Message content */}
        <div className="text-gray-800 leading-relaxed">
          {displayText}
        </div>

        {/* Translation status and controls */}
        {showTranslationControls && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {isTranslating && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Translating...
                </div>
              )}
              
              {translationError && (
                <div className="text-xs text-red-600">
                  {translationError}
                </div>
              )}
              
              {!isTranslating && !translationError && !isTranslated && autoTranslate && (
                <button
                  onClick={handleManualTranslate}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Languages size={12} />
                  Translate
                </button>
              )}
            </div>

            {/* Translation controls */}
            {isTranslated && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={toggleOriginal}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  title={showOriginal ? "Show translated" : "Show original"}
                >
                  {showOriginal ? <Eye size={12} /> : <EyeOff size={12} />}
                  {showOriginal ? "Translated" : "Original"}
                </button>
                
                <button
                  onClick={handleManualTranslate}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  title="Retranslate"
                >
                  <RotateCcw size={12} />
                  Retranslate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Language indicator */}
        {isTranslated && !showOriginal && (
          <div className="absolute top-2 right-2">
            <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-gray-600 border border-gray-200">
              🌐 {translatedMessage.targetLanguage?.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatedChatMessage;
