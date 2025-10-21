import React, { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSelector from './LanguageSelector';
import { Globe, MessageSquare, Mic, Settings } from 'lucide-react';

const TranslationDemo = () => {
  const { 
    userLanguage, 
    doctorLanguage, 
    patientLanguage, 
    setUserLanguage, 
    setDoctorLanguage, 
    setPatientLanguage,
    autoTranslate,
    setAutoTranslate,
    translateToUser,
    translateToDoctor,
    translateToPatient
  } = useTranslation();

  const [demoText, setDemoText] = useState("Hello, how are you feeling today?");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const translated = await translateToUser(demoText);
      setTranslatedText(translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🌐 Multilingual Video Call Demo
        </h2>
        <p className="text-gray-600">
          Experience real-time translation for doctor-patient conversations
        </p>
      </div>

      {/* Language Settings */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Globe size={20} />
            Your Language
          </h3>
          <LanguageSelector
            selectedLanguage={userLanguage}
            onLanguageChange={setUserLanguage}
            showLabel={false}
            size="small"
          />
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Settings size={20} />
            Doctor Language
          </h3>
          <LanguageSelector
            selectedLanguage={doctorLanguage}
            onLanguageChange={setDoctorLanguage}
            showLabel={false}
            size="small"
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <MessageSquare size={20} />
            Patient Language
          </h3>
          <LanguageSelector
            selectedLanguage={patientLanguage}
            onLanguageChange={setPatientLanguage}
            showLabel={false}
            size="small"
          />
        </div>
      </div>

      {/* Auto-translate Toggle */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Auto-translate Messages</h3>
            <p className="text-sm text-gray-600">Automatically translate chat messages and captions</p>
          </div>
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
      </div>

      {/* Translation Demo */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mic size={20} />
          Translation Demo
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter text to translate:
            </label>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Type your message here..."
            />
          </div>

          <button
            onClick={handleTranslate}
            disabled={isTranslating || !demoText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTranslating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Translating...
              </>
            ) : (
              <>
                <Globe size={16} />
                Translate to {userLanguage.toUpperCase()}
              </>
            )}
          </button>

          {translatedText && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Translated Text:</h4>
              <p className="text-green-700">{translatedText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Features List */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💬 Chat Translation</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Real-time message translation</li>
            <li>• Toggle between original and translated</li>
            <li>• Language detection for patients</li>
            <li>• Translation history caching</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">📝 Live Captions</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Speech-to-text recognition</li>
            <li>• Real-time caption translation</li>
            <li>• Multiple language support</li>
            <li>• Caption history and controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranslationDemo;
