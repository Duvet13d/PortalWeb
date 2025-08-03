import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

// Add slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--color-accent-1);
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--color-accent-1);
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
    background: #374151;
  }
  
  .slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: #374151;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = sliderStyles;
  document.head.appendChild(styleSheet);
}

/**
 * Theme Customizer - Interface for theme selection and customization
 */
const ThemeCustomizer = ({ isOpen, onClose }) => {
  const {
    currentPreset,
    customColors,
    background,
    presets,
    setThemePreset,
    updateCustomColors,
    setBackground,
    resetTheme,
    getCurrentColors,
    isCustomTheme,
  } = useTheme();

  const [activeTab, setActiveTab] = useState("presets");
  const [tempColors, setTempColors] = useState(getCurrentColors());
  const [tempBackground, setTempBackground] = useState(background);
  const [tempPreset, setTempPreset] = useState(currentPreset);
  const [hasChanges, setHasChanges] = useState(false);
  const [imageFilters, setImageFilters] = useState({
    blur: 0,
    brightness: 100,
    contrast: 100,
    hue: 0,
    saturation: 100,
    sepia: 0,
    grayscale: 0,
    opacity: 100
  });

  // Initialize temp state when component opens
  useEffect(() => {
    if (isOpen) {
      setTempColors(getCurrentColors());
      setTempBackground(background);
      setTempPreset(currentPreset);
      setHasChanges(false);
      // Reset filters when opening
      setImageFilters({
        blur: 0,
        brightness: 100,
        contrast: 100,
        hue: 0,
        saturation: 100,
        sepia: 0,
        grayscale: 0,
        opacity: 100
      });
    }
  }, [isOpen, getCurrentColors, background, currentPreset]);

  if (!isOpen) return null;

  // Handle preset selection (temporary)
  const handlePresetSelect = (preset) => {
    setTempPreset(preset);
    setTempColors(preset.colors);
    setTempBackground(preset.background);
    setHasChanges(true);
  };

  // Handle custom color change (temporary)
  const handleColorChange = (colorKey, value) => {
    const newColors = { ...tempColors, [colorKey]: value };
    setTempColors(newColors);
    setHasChanges(true);
  };

  // Handle background change (temporary)
  const handleBackgroundChange = (
    type,
    value,
    pattern = null,
    size = "cover",
    position = "center",
    repeat = "no-repeat",
    filter = ""
  ) => {
    const newBackground = { type, value, pattern, size, position, repeat, filter };
    setTempBackground(newBackground);
    setHasChanges(true);
  };

  // Apply all changes
  const handleApplyChanges = () => {
    // Apply preset if it changed
    if (tempPreset.id !== currentPreset.id) {
      setThemePreset(tempPreset);
    }

    // Apply custom colors if they changed
    const currentColors = getCurrentColors();
    const colorsChanged = Object.keys(tempColors).some(
      (key) => tempColors[key] !== currentColors[key]
    );
    if (colorsChanged) {
      updateCustomColors(tempColors);
    }

    // Apply background if it changed
    const backgroundChanged =
      JSON.stringify(tempBackground) !== JSON.stringify(background);
    if (backgroundChanged) {
      setBackground(tempBackground);
    }

    setHasChanges(false);
  };

  // Cancel changes and revert to current state
  const handleCancelChanges = () => {
    setTempColors(getCurrentColors());
    setTempBackground(background);
    setTempPreset(currentPreset);
    setHasChanges(false);
  };

  // Generate CSS filter string from filter values
  const generateFilterString = (filters) => {
    const filterParts = [];
    
    if (filters.blur > 0) filterParts.push(`blur(${filters.blur}px)`);
    if (filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`);
    if (filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`);
    if (filters.hue !== 0) filterParts.push(`hue-rotate(${filters.hue}deg)`);
    if (filters.saturation !== 100) filterParts.push(`saturate(${filters.saturation}%)`);
    if (filters.sepia > 0) filterParts.push(`sepia(${filters.sepia}%)`);
    if (filters.grayscale > 0) filterParts.push(`grayscale(${filters.grayscale}%)`);
    if (filters.opacity !== 100) filterParts.push(`opacity(${filters.opacity}%)`);
    
    return filterParts.join(' ');
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...imageFilters, [filterName]: value };
    setImageFilters(newFilters);
    
    if (tempBackground.type === 'image' && tempBackground.value) {
      const filterString = generateFilterString(newFilters);
      handleBackgroundChange(
        'image', 
        tempBackground.value, 
        null, 
        tempBackground.size, 
        tempBackground.position, 
        tempBackground.repeat,
        filterString
      );
    }
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters = {
      blur: 0,
      brightness: 100,
      contrast: 100,
      hue: 0,
      saturation: 100,
      sepia: 0,
      grayscale: 0,
      opacity: 100
    };
    setImageFilters(defaultFilters);
    
    if (tempBackground.type === 'image' && tempBackground.value) {
      handleBackgroundChange(
        'image', 
        tempBackground.value, 
        null, 
        tempBackground.size, 
        tempBackground.position, 
        tempBackground.repeat,
        ''
      );
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      // Reset filters when uploading new image
      setImageFilters({
        blur: 0,
        brightness: 100,
        contrast: 100,
        hue: 0,
        saturation: 100,
        sepia: 0,
        grayscale: 0,
        opacity: 100
      });
      handleBackgroundChange("image", imageDataUrl);
    };
    reader.onerror = () => {
      alert("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };

  // Reset to default theme
  const handleReset = () => {
    resetTheme();
    setTempColors(presets.PERSONAL_PORTAL.colors);
  };

  const tabs = [
    { id: "presets", name: "Presets" },
    { id: "colors", name: "Colors" },
    { id: "background", name: "Background" },
  ];

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
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel - Controls */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-accent-1">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Theme Customization
                </h2>
                <p className="text-gray-400 text-sm">
                  {hasChanges
                    ? "Unsaved Changes"
                    : isCustomTheme()
                    ? "Custom Theme"
                    : currentPreset.name}
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent-1/20 text-accent-1 border-b-2 border-accent-1"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "presets" && (
              <motion.div
                key="presets"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Choose a Theme Preset
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(presets).map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        tempPreset.id === preset.id
                          ? "border-accent-1 bg-accent-1/10"
                          : "border-gray-600 hover:border-gray-500 bg-gray-800/30"
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
                        <h4 className="text-white font-medium">
                          {preset.name}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {preset.description}
                      </p>

                      {/* Preview */}
                      <div
                        className="mt-3 h-8 rounded"
                        style={{
                          background:
                            preset.background.type === "gradient"
                              ? preset.background.value
                              : preset.colors.primary,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "colors" && (
              <motion.div
                key="colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Custom Colors
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Colors */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Primary Colors</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Background
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.primary}
                            onChange={(e) =>
                              handleColorChange("primary", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.primary}
                            onChange={(e) =>
                              handleColorChange("primary", e.target.value)
                            }
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Secondary
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.secondary}
                            onChange={(e) =>
                              handleColorChange("secondary", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.secondary}
                            onChange={(e) =>
                              handleColorChange("secondary", e.target.value)
                            }
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
                        <label className="block text-sm text-gray-400 mb-2">
                          Primary Accent
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.accent1}
                            onChange={(e) =>
                              handleColorChange("accent1", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.accent1}
                            onChange={(e) =>
                              handleColorChange("accent1", e.target.value)
                            }
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Secondary Accent
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.accent2}
                            onChange={(e) =>
                              handleColorChange("accent2", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.accent2}
                            onChange={(e) =>
                              handleColorChange("accent2", e.target.value)
                            }
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
                        <label className="block text-sm text-gray-400 mb-2">
                          Primary Text
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.text}
                            onChange={(e) =>
                              handleColorChange("text", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.text}
                            onChange={(e) =>
                              handleColorChange("text", e.target.value)
                            }
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Secondary Text
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={tempColors.textSecondary}
                            onChange={(e) =>
                              handleColorChange("textSecondary", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tempColors.textSecondary}
                            onChange={(e) =>
                              handleColorChange("textSecondary", e.target.value)
                            }
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
                      <label className="block text-sm text-gray-400 mb-2">
                        Border
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={tempColors.border}
                          onChange={(e) =>
                            handleColorChange("border", e.target.value)
                          }
                          className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={tempColors.border}
                          onChange={(e) =>
                            handleColorChange("border", e.target.value)
                          }
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "background" && (
              <motion.div
                key="background"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Background Image
                </h3>

                {/* Quick Actions */}
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Background Actions</h4>
                  {tempBackground.type === "image" && tempBackground.value && (
                    <button
                      onClick={() => handleBackgroundChange("solid", tempColors.primary)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      title="Remove background image"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Upload New Background */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">
                    Upload New Background
                  </h4>

                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="background-upload"
                    />
                    <label
                      htmlFor="background-upload"
                      className="cursor-pointer block"
                    >
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-white font-medium mb-2">
                        Click to upload background image
                      </p>
                      <p className="text-gray-400 text-sm">
                        Supports JPG, PNG, GIF, WebP (Max 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Background Settings */}
                {tempBackground.type === "image" && tempBackground.value && (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">
                      Background Settings
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Background Size */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Background Size
                        </label>
                        <select
                          value={tempBackground.size || "cover"}
                          onChange={(e) =>
                            handleBackgroundChange(
                              "image",
                              tempBackground.value,
                              null,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                        >
                          <option value="cover">Cover (Fill screen)</option>
                          <option value="contain">
                            Contain (Fit to screen)
                          </option>
                          <option value="auto">Auto (Original size)</option>
                        </select>
                      </div>

                      {/* Background Position */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Background Position
                        </label>
                        <select
                          value={tempBackground.position || "center"}
                          onChange={(e) =>
                            handleBackgroundChange(
                              "image",
                              tempBackground.value,
                              null,
                              tempBackground.size,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top left">Top Left</option>
                          <option value="top right">Top Right</option>
                          <option value="bottom left">Bottom Left</option>
                          <option value="bottom right">Bottom Right</option>
                        </select>
                      </div>
                    </div>

                    {/* Background Repeat */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Background Repeat
                      </label>
                      <select
                        value={tempBackground.repeat || "no-repeat"}
                        onChange={(e) =>
                          handleBackgroundChange(
                            "image",
                            tempBackground.value,
                            null,
                            tempBackground.size,
                            tempBackground.position,
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-accent-1"
                      >
                        <option value="no-repeat">No Repeat</option>
                        <option value="repeat">Repeat</option>
                        <option value="repeat-x">Repeat Horizontally</option>
                        <option value="repeat-y">Repeat Vertically</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Image Editor */}
                {tempBackground.type === 'image' && tempBackground.value && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Image Filters</h4>
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>

                    <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 space-y-4">
                      <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Blur */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Blur: {imageFilters.blur}px
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={imageFilters.blur}
                              onChange={(e) => handleFilterChange('blur', parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Brightness */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Brightness: {imageFilters.brightness}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              step="5"
                              value={imageFilters.brightness}
                              onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Contrast */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Contrast: {imageFilters.contrast}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              step="5"
                              value={imageFilters.contrast}
                              onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Hue Rotate */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Hue Shift: {imageFilters.hue}°
                            </label>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="5"
                              value={imageFilters.hue}
                              onChange={(e) => handleFilterChange('hue', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Saturation */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Saturation: {imageFilters.saturation}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              step="5"
                              value={imageFilters.saturation}
                              onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Sepia */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Sepia: {imageFilters.sepia}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={imageFilters.sepia}
                              onChange={(e) => handleFilterChange('sepia', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Grayscale */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Grayscale: {imageFilters.grayscale}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={imageFilters.grayscale}
                              onChange={(e) => handleFilterChange('grayscale', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>

                          {/* Opacity */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Opacity: {imageFilters.opacity}%
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={imageFilters.opacity}
                              onChange={(e) => handleFilterChange('opacity', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        </div>

                        {/* Filter Presets */}
                        <div className="border-t border-gray-600 pt-4">
                          <h5 className="text-white font-medium mb-3">Quick Presets</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                              onClick={() => {
                                setImageFilters({
                                  blur: 0, brightness: 100, contrast: 100, hue: 0,
                                  saturation: 100, sepia: 0, grayscale: 0, opacity: 100
                                });
                                handleFilterChange('blur', 0);
                              }}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                              Original
                            </button>
                            <button
                              onClick={() => {
                                const filters = { blur: 0, brightness: 80, contrast: 120, hue: 0, saturation: 80, sepia: 0, grayscale: 0, opacity: 100 };
                                setImageFilters(filters);
                                handleFilterChange('brightness', 80);
                              }}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                              Vintage
                            </button>
                            <button
                              onClick={() => {
                                const filters = { blur: 0, brightness: 100, contrast: 100, hue: 0, saturation: 100, sepia: 0, grayscale: 100, opacity: 100 };
                                setImageFilters(filters);
                                handleFilterChange('grayscale', 100);
                              }}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                              B&W
                            </button>
                            <button
                              onClick={() => {
                                const filters = { blur: 2, brightness: 90, contrast: 110, hue: 0, saturation: 120, sepia: 20, grayscale: 0, opacity: 90 };
                                setImageFilters(filters);
                                handleFilterChange('blur', 2);
                              }}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                              Dreamy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-accent-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Tips for best results
                  </h5>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>
                      • Use high-resolution images (1920x1080 or higher) for
                      best quality
                    </li>
                    <li>
                      • Dark or subtle images work best to maintain text
                      readability
                    </li>
                    <li>• Images are stored locally in your browser</li>
                    <li>• Large images may affect page loading performance</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Preview (only show for background tab) */}
        {activeTab === 'background' && (
          <div className="w-80 border-l border-gray-700 flex flex-col">
            {/* Preview Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white mb-2">Live Preview</h3>
              <p className="text-gray-400 text-sm">See your changes in real-time</p>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-4 space-y-4">
            {/* Background Preview */}
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Background</h4>
              <div className="relative">
                <div
                  className="w-full h-40 rounded-lg border border-gray-600 relative overflow-hidden"
                  style={{
                    backgroundColor: tempColors.primary,
                  }}
                >
                  {tempBackground.type === "image" && tempBackground.value && (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${tempBackground.value})`,
                        backgroundSize: tempBackground.size || 'cover',
                        backgroundPosition: tempBackground.position || 'center',
                        backgroundRepeat: tempBackground.repeat || 'no-repeat',
                        filter: tempBackground.filter || 'none',
                      }}
                    />
                  )}
                  {(!tempBackground.value || tempBackground.type !== "image") && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">No background</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color Swatches Preview */}
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div 
                    className="w-full h-8 rounded border border-gray-600"
                    style={{ backgroundColor: tempColors.primary }}
                  />
                  <p className="text-xs text-gray-400">Primary</p>
                </div>
                <div className="space-y-1">
                  <div 
                    className="w-full h-8 rounded border border-gray-600"
                    style={{ backgroundColor: tempColors.secondary }}
                  />
                  <p className="text-xs text-gray-400">Secondary</p>
                </div>
                <div className="space-y-1">
                  <div 
                    className="w-full h-8 rounded border border-gray-600"
                    style={{ backgroundColor: tempColors.accent1 }}
                  />
                  <p className="text-xs text-gray-400">Accent 1</p>
                </div>
                <div className="space-y-1">
                  <div 
                    className="w-full h-8 rounded border border-gray-600"
                    style={{ backgroundColor: tempColors.accent2 }}
                  />
                  <p className="text-xs text-gray-400">Accent 2</p>
                </div>
              </div>
            </div>

            {/* Text Preview */}
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Text</h4>
              <div className="p-3 bg-gray-800/30 rounded border border-gray-600">
                <p 
                  className="font-medium mb-1"
                  style={{ color: tempColors.text }}
                >
                  Primary Text
                </p>
                <p 
                  className="text-sm"
                  style={{ color: tempColors.textSecondary }}
                >
                  Secondary text and descriptions
                </p>
                <div className="mt-2 pt-2 border-t" style={{ borderColor: tempColors.border }}>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: tempColors.accent1 }}
                  >
                    Accent Color
                  </span>
                </div>
              </div>
            </div>

            {/* Current Filter Info */}
            {tempBackground.type === 'image' && tempBackground.value && tempBackground.filter && (
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">Active Filters</h4>
                <div className="p-3 bg-gray-800/30 rounded border border-gray-600">
                  <p className="text-xs text-gray-400 font-mono">
                    {tempBackground.filter || 'none'}
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

      </motion.div>

      {/* Separate Apply/Cancel Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-sm font-medium">
                You have unsaved changes
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyChanges}
                className="px-6 py-2 bg-accent-1 hover:bg-accent-1/80 text-white rounded-lg transition-colors font-medium"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ThemeCustomizer;
