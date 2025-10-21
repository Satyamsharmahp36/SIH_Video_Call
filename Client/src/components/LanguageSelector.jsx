import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { languages, getLanguageName } from '../utils/translation';

const LanguageSelector = ({ 
  selectedLanguage, 
  onLanguageChange, 
  label = "Select Language",
  placeholder = "Choose language...",
  className = "",
  showLabel = true,
  size = "medium" // small, medium, large
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter languages based on search term
  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[16]; // Default to English

  const sizeClasses = {
    small: 'text-sm px-3 py-2',
    medium: 'text-base px-4 py-3',
    large: 'text-lg px-5 py-4'
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between
            bg-white border-2 border-gray-200 rounded-lg
            hover:border-blue-300 focus:border-blue-500 focus:outline-none
            transition-all duration-200 shadow-sm hover:shadow-md
            ${sizeClasses[size]}
          `}
        >
          <div className="flex items-center gap-3">
            <Globe size={iconSizes[size]} className="text-gray-500" />
            <span className="text-gray-700 font-medium">
              {selectedLang.name} ({selectedLang.native})
            </span>
          </div>
          <ChevronDown 
            size={iconSizes[size]} 
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Language list */}
            <div className="max-h-64 overflow-y-auto">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(language.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left
                      hover:bg-blue-50 transition-colors duration-150
                      ${selectedLanguage === language.code ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language.native}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {language.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {language.code.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {selectedLanguage === language.code && (
                      <Check size={20} className="text-blue-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No languages found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
