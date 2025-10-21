import React, { createContext, useContext, useState, useCallback } from 'react';
import { translateText, detectLanguage } from '../utils/translation';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  // User's preferred language
  const [userLanguage, setUserLanguage] = useState('en');
  
  // Doctor's preferred language (for medical panel)
  const [doctorLanguage, setDoctorLanguage] = useState('en');
  
  // Patient's preferred language
  const [patientLanguage, setPatientLanguage] = useState('en');
  
  // Auto-translation enabled/disabled
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // Translation history for chat messages
  const [translationHistory, setTranslationHistory] = useState(new Map());

  // Translate text to user's preferred language
  const translateToUser = useCallback(async (text, sourceLanguage = 'auto') => {
    if (!autoTranslate || !text || userLanguage === sourceLanguage) {
      return text;
    }
    
    try {
      return await translateText(text, userLanguage, sourceLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [userLanguage, autoTranslate]);

  // Translate text to doctor's preferred language
  const translateToDoctor = useCallback(async (text, sourceLanguage = 'auto') => {
    if (!autoTranslate || !text || doctorLanguage === sourceLanguage) {
      return text;
    }
    
    try {
      return await translateText(text, doctorLanguage, sourceLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [doctorLanguage, autoTranslate]);

  // Translate text to patient's preferred language
  const translateToPatient = useCallback(async (text, sourceLanguage = 'auto') => {
    if (!autoTranslate || !text || patientLanguage === sourceLanguage) {
      return text;
    }
    
    try {
      return await translateText(text, patientLanguage, sourceLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [patientLanguage, autoTranslate]);

  // Translate chat message with caching
  const translateChatMessage = useCallback(async (message, targetLanguage, sourceLanguage = 'auto') => {
    const cacheKey = `${message.id}-${sourceLanguage}-${targetLanguage}`;
    
    // Check if already translated
    if (translationHistory.has(cacheKey)) {
      return translationHistory.get(cacheKey);
    }
    
    try {
      const translatedText = await translateText(message.text, targetLanguage, sourceLanguage);
      const translatedMessage = {
        ...message,
        text: translatedText,
        originalText: message.text,
        translated: true,
        targetLanguage
      };
      
      // Cache the translation
      setTranslationHistory(prev => new Map(prev.set(cacheKey, translatedMessage)));
      
      return translatedMessage;
    } catch (error) {
      console.error('Chat translation error:', error);
      return message;
    }
  }, [translationHistory]);

  // Translate captions in real-time
  const translateCaptions = useCallback(async (captions, targetLanguage, sourceLanguage = 'auto') => {
    if (!autoTranslate || !captions) return captions;
    
    try {
      const translatedCaptions = await Promise.all(
        captions.map(async (caption) => {
          if (caption.text && caption.text.trim()) {
            const translatedText = await translateText(caption.text, targetLanguage, sourceLanguage);
            return {
              ...caption,
              text: translatedText,
              originalText: caption.text,
              translated: true
            };
          }
          return caption;
        })
      );
      
      return translatedCaptions;
    } catch (error) {
      console.error('Caption translation error:', error);
      return captions;
    }
  }, [autoTranslate]);

  // Detect and set patient language from their messages
  const detectPatientLanguage = useCallback(async (patientMessages) => {
    if (!patientMessages || patientMessages.length === 0) return;
    
    try {
      // Use the first few messages to detect language
      const sampleText = patientMessages
        .slice(0, 3)
        .map(msg => msg.text)
        .join(' ');
      
      const detectedLanguage = await detectLanguage(sampleText);
      if (detectedLanguage && detectedLanguage !== 'auto') {
        setPatientLanguage(detectedLanguage);
      }
    } catch (error) {
      console.error('Language detection error:', error);
    }
  }, []);

  // Clear translation history
  const clearTranslationHistory = useCallback(() => {
    setTranslationHistory(new Map());
  }, []);

  const value = {
    // Language settings
    userLanguage,
    setUserLanguage,
    doctorLanguage,
    setDoctorLanguage,
    patientLanguage,
    setPatientLanguage,
    autoTranslate,
    setAutoTranslate,
    
    // Translation functions
    translateToUser,
    translateToDoctor,
    translateToPatient,
    translateChatMessage,
    translateCaptions,
    detectPatientLanguage,
    
    // Utility functions
    clearTranslationHistory,
    translationHistory
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
