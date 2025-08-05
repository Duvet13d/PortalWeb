import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeCustomizer = () => {
  const {
    currentPreset,
    presets,
    setThemePreset,
    updateCustomColors,
    getCurrentColors,
    isCustomTheme,
    resetTheme,
    setBackground,
    background,
  } = useTheme();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState(null);
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const debounceRef = useRef(null);

  const currentColors = getCurrentColors();

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const colorLabels = {
    primary: "Primary Background",
    secondary: "Secondary Background", 
    accent1: "Primary Accent",
    accent2: "Secondary Accent",
    text: "Primary Text",
    textSecondary: "Secondary Text",
    border: "Border Color",
  };

  const handlePresetChange = (preset) => {
    setThemePreset(preset);
    setShowColorPicker(false);
  };

  const handleColorChange = (colorKey, value) => {
    updateCustomColors({ [colorKey]: value });
  };

  const openColorPicker = (colorKey) => {
    setSelectedColorKey(colorKey);
    setShowColorPicker(true);
  };

  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackground({
          type: 'image',
          value: e.target.result,
          size: 'cover',
          position: 'center',
          repeat: 'no-repeat',
          filter: background.filter || '' // Preserve existing filters
        });
        setShowBackgroundUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundTypeChange = (type, value = null) => {
    if (type === 'solid') {
      setBackground({
        type: 'solid',
        value: currentColors.primary
      });
    }
  };

  const debouncedSetBackground = useCallback((newBackground) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setBackground(newBackground);
    }, 100); // 100ms debounce
  }, [setBackground]);

  const handleFilterChange = (filterType, value) => {
    // Update local state immediately for responsive UI
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }));

    const currentFilter = background.filter || '';
    const filters = currentFilter.split(' ').filter(f => f.trim());
    
    // Remove existing filter of the same type
    const filteredFilters = filters.filter(f => !f.startsWith(filterType));
    
    // Add new filter if value > 0
    if (value > 0) {
      let filterValue;
      switch (filterType) {
        case 'blur':
          filterValue = `blur(${value}px)`;
          break;
        case 'brightness':
          filterValue = `brightness(${value}%)`;
          break;
        case 'contrast':
          filterValue = `contrast(${value}%)`;
          break;
        case 'saturate':
          filterValue = `saturate(${value}%)`;
          break;
        case 'sepia':
          filterValue = `sepia(${value}%)`;
          break;
        case 'grayscale':
          filterValue = `grayscale(${value}%)`;
          break;
        case 'hue-rotate':
          filterValue = `hue-rotate(${value}deg)`;
          break;
        default:
          filterValue = '';
      }
      if (filterValue) {
        filteredFilters.push(filterValue);
      }
    }
    
    // Use debounced update to prevent excessive re-renders
    debouncedSetBackground({
      ...background,
      filter: filteredFilters.join(' ')
    });
  };

  const getFilterValue = (filterType) => {
    // Check local state first for immediate UI feedback
    if (localFilters[filterType] !== undefined) {
      return localFilters[filterType];
    }

    const currentFilter = background.filter || '';
    const regex = new RegExp(`${filterType}\\(([^)]+)\\)`);
    const match = currentFilter.match(regex);
    if (match) {
      const value = match[1];
      return parseFloat(value.replace(/[^\d.]/g, ''));
    }
    
    // Default values
    switch (filterType) {
      case 'brightness':
      case 'contrast':
      case 'saturate':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-6 backdrop-blur-sm w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-accent-1">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Theme Customizer</h2>
            <p className="text-gray-400 text-sm">Customize your portal's appearance</p>
          </div>
        </div>
        
        {isCustomTheme() && (
          <button
            onClick={resetTheme}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Theme Presets */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Theme Presets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(presets).map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentPreset.id === preset.id && !isCustomTheme()
                  ? "border-accent-1 bg-accent-1/10"
                  : "border-gray-600 hover:border-gray-500 bg-gray-800/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.accent1 }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.accent2 }}
                  />
                </div>
                <h4 className="font-medium text-white text-sm">{preset.name}</h4>
              </div>
              <p className="text-gray-400 text-xs">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Background Customization */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Background</h3>
        <div className="space-y-4">
          {/* Background Type Selector */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBackgroundTypeChange('solid')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                background.type === 'solid'
                  ? 'bg-accent-1 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Solid Color
            </button>
            <button
              onClick={() => setShowBackgroundUpload(true)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                background.type === 'image'
                  ? 'bg-accent-1 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Upload Image
            </button>
            {background.type === 'image' && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  showFilterPanel
                    ? 'bg-accent-2 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Filters
              </button>
            )}
          </div>

          {/* Current Background Preview */}
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded border-2 border-gray-600"
                style={{
                  background: background.type === 'image' 
                    ? `url(${background.value}) center/cover no-repeat`
                    : background.value,
                  filter: background.type === 'image' ? background.filter : 'none'
                }}
              />
              <div>
                <p className="text-white text-sm font-medium">
                  Current Background
                </p>
                <p className="text-gray-400 text-xs">
                  {background.type === 'image' ? 'Custom Image' : 'Solid Color'}
                  {background.filter && background.type === 'image' && ' (Filtered)'}
                </p>
              </div>
            </div>
          </div>

          {/* Background Filters Panel */}
          <AnimatePresence>
            {showFilterPanel && background.type === 'image' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-600"
              >
                <h4 className="text-white font-medium mb-4">Background Filters</h4>
                <div className="space-y-4">
                  {/* Blur */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Blur: {getFilterValue('blur')}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={getFilterValue('blur')}
                      onChange={(e) => handleFilterChange('blur', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Brightness */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Brightness: {getFilterValue('brightness')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={getFilterValue('brightness')}
                      onChange={(e) => handleFilterChange('brightness', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Contrast: {getFilterValue('contrast')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={getFilterValue('contrast')}
                      onChange={(e) => handleFilterChange('contrast', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Saturation: {getFilterValue('saturate')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={getFilterValue('saturate')}
                      onChange={(e) => handleFilterChange('saturate', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Sepia */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Sepia: {getFilterValue('sepia')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={getFilterValue('sepia')}
                      onChange={(e) => handleFilterChange('sepia', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Grayscale */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Grayscale: {getFilterValue('grayscale')}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={getFilterValue('grayscale')}
                      onChange={(e) => handleFilterChange('grayscale', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Hue Rotate */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Hue Rotate: {getFilterValue('hue-rotate')}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={getFilterValue('hue-rotate')}
                      onChange={(e) => handleFilterChange('hue-rotate', e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      setLocalFilters({});
                      setBackground({ ...background, filter: '' });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Color Customization */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Custom Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(colorLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <span className="text-gray-300 text-sm">{label}</span>
              <button
                onClick={() => openColorPicker(key)}
                className="w-8 h-8 rounded border-2 border-gray-600 hover:border-gray-500 transition-colors"
                style={{ backgroundColor: currentColors[key] }}
                aria-label={`Change ${label}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Background Upload Modal */}
      <AnimatePresence>
        {showBackgroundUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBackgroundUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-medium text-white mb-4">
                Upload Background Image
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Choose Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-accent-1 file:text-white hover:file:bg-accent-2"
                  />
                </div>
                
                <div className="text-xs text-gray-400">
                  <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                  <p>• Recommended size: 1920x1080 or larger</p>
                  <p>• File will be stored locally in your browser</p>
                  <p>• Use the Filters button to add effects after upload</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBackgroundUpload(false)}
                  className="flex-1 px-4 py-2 bg-accent-1 hover:bg-accent-2 text-white rounded transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => setShowBackgroundUpload(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker && selectedColorKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowColorPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-medium text-white mb-4">
                Change {colorLabels[selectedColorKey]}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Color Value</label>
                  <input
                    type="color"
                    value={currentColors[selectedColorKey]}
                    onChange={(e) => handleColorChange(selectedColorKey, e.target.value)}
                    className="w-full h-12 rounded border border-gray-600 bg-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hex Code</label>
                  <input
                    type="text"
                    value={currentColors[selectedColorKey]}
                    onChange={(e) => handleColorChange(selectedColorKey, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="flex-1 px-4 py-2 bg-accent-1 hover:bg-accent-2 text-white rounded transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Theme Info */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Current Theme</h4>
        <p className="text-gray-400 text-sm">
          {isCustomTheme() ? "Custom Theme" : currentPreset.name}
          {isCustomTheme() && ` (based on ${currentPreset.name})`}
        </p>
      </div>
    </motion.div>
  );
};

export default ThemeCustomizer;