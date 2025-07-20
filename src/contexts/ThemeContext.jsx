import React, { createContext, useContext, useReducer, useEffect } from "react";
import { enhancedStorage } from "../utils/enhancedStorage";

// Theme presets
export const THEME_PRESETS = {
  PERSONAL_PORTAL: {
    id: "personal-portal",
    name: "Personal Portal",
    description: "Default dark theme with red accents",
    colors: {
      primary: "#000000",
      secondary: "#111111",
      accent1: "#dd0000",
      accent2: "#fc5c12",
      text: "#ffffff",
      textSecondary: "#a1a1aa",
      border: "#374151",
    },
    background: {
      type: "solid",
      value: "#000000",
    },
  },
  MIDNIGHT_BLUE: {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Deep blue theme with cyan accents",
    colors: {
      primary: "#0f172a",
      secondary: "#1e293b",
      accent1: "#06b6d4",
      accent2: "#0ea5e9",
      text: "#f8fafc",
      textSecondary: "#94a3b8",
      border: "#334155",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    },
  },
  FOREST_GREEN: {
    id: "forest-green",
    name: "Forest Green",
    description: "Nature-inspired green theme",
    colors: {
      primary: "#0f1419",
      secondary: "#1a2332",
      accent1: "#10b981",
      accent2: "#34d399",
      text: "#f0fdf4",
      textSecondary: "#86efac",
      border: "#166534",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #064e3b 100%)",
    },
  },
  PURPLE_HAZE: {
    id: "purple-haze",
    name: "Purple Haze",
    description: "Vibrant purple theme with pink accents",
    colors: {
      primary: "#1e1b4b",
      secondary: "#312e81",
      accent1: "#8b5cf6",
      accent2: "#ec4899",
      text: "#faf5ff",
      textSecondary: "#c4b5fd",
      border: "#6d28d9",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #581c87 100%)",
    },
  },
  SUNSET_ORANGE: {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm sunset colors with orange accents",
    colors: {
      primary: "#1c1917",
      secondary: "#292524",
      accent1: "#f97316",
      accent2: "#fbbf24",
      text: "#fef7ed",
      textSecondary: "#fed7aa",
      border: "#ea580c",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #1c1917 0%, #292524 30%, #451a03 100%)",
    },
  },
  MONOCHROME: {
    id: "monochrome",
    name: "Monochrome",
    description: "Clean black and white theme",
    colors: {
      primary: "#000000",
      secondary: "#1f1f1f",
      accent1: "#ffffff",
      accent2: "#d1d5db",
      text: "#ffffff",
      textSecondary: "#9ca3af",
      border: "#374151",
    },
    background: {
      type: "solid",
      value: "#000000",
    },
  },
};

// Background patterns
export const BACKGROUND_PATTERNS = {
  DOTS: {
    id: "dots",
    name: "Dots",
    css: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
    size: "20px 20px",
  },
  GRID: {
    id: "grid",
    name: "Grid",
    css: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    size: "20px 20px",
  },
  DIAGONAL: {
    id: "diagonal",
    name: "Diagonal Lines",
    css: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
    size: "auto",
  },
  HEXAGON: {
    id: "hexagon",
    name: "Hexagon",
    css: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
    size: "30px 26px",
  },
};

// Action types
const THEME_ACTIONS = {
  SET_THEME_PRESET: "SET_THEME_PRESET",
  UPDATE_CUSTOM_COLORS: "UPDATE_CUSTOM_COLORS",
  SET_BACKGROUND: "SET_BACKGROUND",
  RESET_THEME: "RESET_THEME",
  LOAD_THEME: "LOAD_THEME",
};

// Initial state
const initialState = {
  currentPreset: THEME_PRESETS.PERSONAL_PORTAL,
  customColors: null,
  background: THEME_PRESETS.PERSONAL_PORTAL.background,
  isLoaded: false,
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME_PRESET:
      return {
        ...state,
        currentPreset: action.payload.preset,
        background: action.payload.preset.background,
        customColors: null,
      };

    case THEME_ACTIONS.UPDATE_CUSTOM_COLORS:
      return {
        ...state,
        customColors: {
          ...state.customColors,
          ...action.payload.colors,
        },
      };

    case THEME_ACTIONS.SET_BACKGROUND:
      return {
        ...state,
        background: action.payload.background,
      };

    case THEME_ACTIONS.RESET_THEME:
      return {
        ...state,
        currentPreset: THEME_PRESETS.PERSONAL_PORTAL,
        customColors: null,
        background: THEME_PRESETS.PERSONAL_PORTAL.background,
      };

    case THEME_ACTIONS.LOAD_THEME:
      return {
        ...state,
        currentPreset:
          action.payload.currentPreset || THEME_PRESETS.PERSONAL_PORTAL,
        customColors: action.payload.customColors || null,
        background:
          action.payload.background || THEME_PRESETS.PERSONAL_PORTAL.background,
        isLoaded: true,
      };

    default:
      return state;
  }
};

// Context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load theme from enhanced storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await enhancedStorage.get("theme", { fallbackToBackup: true });
        if (savedTheme) {
          dispatch({
            type: THEME_ACTIONS.LOAD_THEME,
            payload: savedTheme,
          });
        } else {
          dispatch({
            type: THEME_ACTIONS.LOAD_THEME,
            payload: {},
          });
        }
      } catch (error) {
        console.warn("Failed to load theme preferences:", error);
        dispatch({
          type: THEME_ACTIONS.LOAD_THEME,
          payload: {},
        });
      }
    };

    loadTheme();
  }, []);

  // Save theme to enhanced storage whenever it changes
  useEffect(() => {
    const saveTheme = async () => {
      if (state.isLoaded) {
        try {
          const themeData = {
            currentPreset: state.currentPreset,
            customColors: state.customColors,
            background: state.background,
          };
          await enhancedStorage.set("theme", themeData, { backup: true });
        } catch (error) {
          console.warn("Failed to save theme preferences:", error);
        }
      }
    };

    saveTheme();
  }, [
    state.currentPreset,
    state.customColors,
    state.background,
    state.isLoaded,
  ]);

  // Apply theme to document
  useEffect(() => {
    if (!state.isLoaded) return;

    const colors = state.customColors || state.currentPreset.colors;
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-accent-1", colors.accent1);
    root.style.setProperty("--color-accent-2", colors.accent2);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-text-secondary", colors.textSecondary);
    root.style.setProperty("--color-border", colors.border);

    // Apply theme-aware scrollbar colors
    const scrollbarThumb = `${colors.accent1}40`; // 25% opacity
    const scrollbarThumbHover = `${colors.accent1}66`; // 40% opacity
    const scrollbarThumbActive = `${colors.accent1}80`; // 50% opacity
    const scrollbarTrack = `${colors.primary}1A`; // 10% opacity

    root.style.setProperty("--scrollbar-thumb", scrollbarThumb);
    root.style.setProperty("--scrollbar-thumb-hover", scrollbarThumbHover);
    root.style.setProperty("--scrollbar-thumb-active", scrollbarThumbActive);
    root.style.setProperty("--scrollbar-track", scrollbarTrack);

    // Apply background
    const body = document.body;
    if (state.background.type === "solid") {
      body.style.background = state.background.value;
    } else if (state.background.type === "gradient") {
      body.style.background = state.background.value;
    } else if (
      state.background.type === "pattern" &&
      state.background.pattern
    ) {
      const pattern = BACKGROUND_PATTERNS[state.background.pattern];
      if (pattern) {
        body.style.background = `${colors.primary} ${pattern.css}`;
        body.style.backgroundSize = pattern.size;
      } else {
        // Fallback to solid color if pattern is invalid
        body.style.background = colors.primary;
      }
    } else {
      // Default fallback
      body.style.background = colors.primary;
    }
  }, [
    state.currentPreset,
    state.customColors,
    state.background,
    state.isLoaded,
  ]);

  // Actions
  const setThemePreset = (preset) => {
    dispatch({
      type: THEME_ACTIONS.SET_THEME_PRESET,
      payload: { preset },
    });
  };

  const updateCustomColors = (colors) => {
    dispatch({
      type: THEME_ACTIONS.UPDATE_CUSTOM_COLORS,
      payload: { colors },
    });
  };

  const setBackground = (background) => {
    dispatch({
      type: THEME_ACTIONS.SET_BACKGROUND,
      payload: { background },
    });
  };

  const resetTheme = () => {
    dispatch({
      type: THEME_ACTIONS.RESET_THEME,
    });
  };

  // Getters
  const getCurrentColors = () => {
    return state.customColors || state.currentPreset.colors;
  };

  const isCustomTheme = () => {
    return state.customColors !== null;
  };

  const value = {
    // State
    currentPreset: state.currentPreset,
    customColors: state.customColors,
    background: state.background,
    isLoaded: state.isLoaded,

    // Actions
    setThemePreset,
    updateCustomColors,
    setBackground,
    resetTheme,

    // Getters
    getCurrentColors,
    isCustomTheme,

    // Constants
    presets: THEME_PRESETS,
    patterns: BACKGROUND_PATTERNS,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { THEME_ACTIONS };
