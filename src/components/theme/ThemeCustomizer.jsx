import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, BACKGROUND_PATTERNS } from '../../contexts/ThemeContext'

/**
 * Theme Customizer - Interface for theme selection and customization
 */
const ThemeCustomizer = ({ isOpen, onClose }) => {
  const { 
    currentPreset, 
    customColors, 
    background, 
    presets, 
    patterns,
    setThemePreset, 
    updateCustomColors, 
    setBackground, 
    resetTheme,
    getCurrentColors,
    isCustomTheme
  } = useTheme()

  const [activeTab, setActiveTab] = useState('presets')
  const [tempColors, setTempColors] = useState(getCurrentColors())

  if (!isOpen) return null

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    setThemePreset(preset)
    setTempColors(preset.colors)
  }

  // Handle custom color change
  const handleColorChange = (colorKey, value) => {
    const newColors = { ...tempColors, [colorKey]: value }
    setTempColors(newColors)
    updateCustomColors(newColors)
  }

  // Handle background change
  const handleBackgroundChange = (type, value, pattern = null) => {
    const newBackground = { type, value, pattern }
    setBackground(newBackground)
  }

  // Reset to default theme
  const handleReset = () => {
    resetTheme()
    setTempColors(presets.PERSONAL_PORTAL.colors)
  }

  const tabs = [
    { id: 'presets', name: 'Presets', icon: '🎨' },
    { id: 'colors', name: 'Colors', icon: '🌈' },
    { id: 'background', name: 'Background', icon: '🖼️' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-accent-1">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Theme Customization</h2>
              <p className="text-gray-400 text-sm">
                {isCustomTheme() ? 'Custom Theme' : currentPreset.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-1/20 text-accent-1 border-b-2 border-accent-1'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'presets' && (
              <motion.div
                key="presets"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-white mb-4">Choose a Theme Preset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(presets).map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        currentPreset.id === preset.id && !isCustomTheme()
                          ? 'border-accent-1 bg-accent-1/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
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
                        <h4 className="text-white font-medium">{preset.name}</h4>
                      </div>
                      <p className="text-gray-400 text-sm">{preset.description}</p>
                      
                      {/* Preview */}
                      <div 
                        className="mt-3 h-8 rounded"
                        style={{
                          background: preset.background.type === 'gradient' 
                            ? preset.background.value 
                            : preset.colors.primary
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'colors' && (
              <motion.div
                key="colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Custom Colors</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Colors */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Primary Colors</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Background</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Secondary</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.secondary}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.secondary}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Accent Colors</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Primary Accent</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.accent1}
                            onChange={(e) => handleColorChange('accent1', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.accent1}
                            onChange={(e) => handleColorChange('accent1', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Secondary Accent</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.accent2}
                            onChange={(e) => handleColorChange('accent2', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.accent2}
                            onChange={(e) => handleColorChange('accent2', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Colors */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Text Colors</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Primary Text</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.text}
                            onChange={(e) => handleColorChange('text', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.text}
                            onChange={(e) => handleColorChange('text', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Secondary Text</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.textSecondary}
                            onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.textSecondary}
                            onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Border Color</h4>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Border</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={tempColors.border}
                          onChange={(e) => handleColorChange('border', e.target.value)}
                          className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={tempColors.border}
                          onChange={(e) => handleColorChange('border', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'background' && (
              <motion.div
                key="background"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Background Options</h3>
                
                {/* Background Type Selection */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Background Type</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Solid Color */}
                    <div
                      onClick={() => handleBackgroundChange('solid', tempColors.primary)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        background.type === 'solid'
                          ? 'border-accent-1 bg-accent-1/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                      }`}
                    >
                      <div className="text-center">
                        <div 
                          className="w-full h-16 rounded mb-3"
                          style={{ backgroundColor: tempColors.primary }}
                        />
                        <h5 className="text-white font-medium">Solid Color</h5>
                        <p className="text-gray-400 text-sm">Single background color</p>
                      </div>
                    </div>

                    {/* Gradient */}
                    <div
                      onClick={() => handleBackgroundChange('gradient', currentPreset.background.value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        background.type === 'gradient'
                          ? 'border-accent-1 bg-accent-1/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                      }`}
                    >
                      <div className="text-center">
                        <div 
                          className="w-full h-16 rounded mb-3"
                          style={{ background: currentPreset.background.value }}
                        />
                        <h5 className="text-white font-medium">Gradient</h5>
                        <p className="text-gray-400 text-sm">Smooth color transitions</p>
                      </div>
                    </div>

                    {/* Pattern */}
                    <div
                      onClick={() => handleBackgroundChange('pattern', tempColors.primary, 'DOTS')}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        background.type === 'pattern'
                          ? 'border-accent-1 bg-accent-1/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                      }`}
                    >
                      <div className="text-center">
                        <div 
                          className="w-full h-16 rounded mb-3"
                          style={{ 
                            background: `${tempColors.primary} ${patterns.DOTS.css}`,
                            backgroundSize: patterns.DOTS.size
                          }}
                        />
                        <h5 className="text-white font-medium">Pattern</h5>
                        <p className="text-gray-400 text-sm">Subtle background patterns</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pattern Selection */}
                {background.type === 'pattern' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Pattern Style</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(patterns).map(([patternKey, pattern]) => (
                        <div
                          key={pattern.id}
                          onClick={() => handleBackgroundChange('pattern', tempColors.primary, patternKey)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            background.pattern === patternKey
                              ? 'border-accent-1 bg-accent-1/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div 
                            className="w-full h-12 rounded mb-2"
                            style={{ 
                              background: `${tempColors.primary} ${pattern.css}`,
                              backgroundSize: pattern.size
                            }}
                          />
                          <p className="text-white text-sm font-medium text-center">{pattern.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Gradient Editor */}
                {background.type === 'gradient' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Custom Gradient</h4>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Gradient CSS</label>
                      <textarea
                        value={background.value}
                        onChange={(e) => handleBackgroundChange('gradient', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1 font-mono text-sm"
                        rows={3}
                        placeholder="linear-gradient(135deg, #000000 0%, #333333 100%)"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ThemeCustomizer