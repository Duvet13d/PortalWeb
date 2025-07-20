import { createContext, useContext, useReducer, useEffect } from "react";
import { enhancedStorage } from "../utils/enhancedStorage";

// Widget Types
export const WIDGET_TYPES = {
  WEATHER: "weather",
  SPOTIFY: "spotify",
  QUICK_LINKS: "quickLinks",
  TIMEZONE: "timezone",
};

// Default widget visibility - weather enabled by default
const DEFAULT_WIDGET_VISIBILITY = {
  [WIDGET_TYPES.WEATHER]: true,
  [WIDGET_TYPES.SPOTIFY]: false,
  [WIDGET_TYPES.QUICK_LINKS]: false,
  [WIDGET_TYPES.TIMEZONE]: false,
};

// Widget sizes
export const WIDGET_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

// Default widget layout
const DEFAULT_WIDGET_LAYOUT = {
  [WIDGET_TYPES.WEATHER]: { size: WIDGET_SIZES.LARGE, order: 0 },
  [WIDGET_TYPES.SPOTIFY]: { size: WIDGET_SIZES.MEDIUM, order: 1 },
  [WIDGET_TYPES.QUICK_LINKS]: { size: WIDGET_SIZES.LARGE, order: 2 },
  [WIDGET_TYPES.TIMEZONE]: { size: WIDGET_SIZES.LARGE, order: 3 },
};

// Default widget settings
const DEFAULT_WIDGET_SETTINGS = {
  [WIDGET_TYPES.WEATHER]: {
    location: "auto",
    units: "metric",
    showForecast: true,
  },
  [WIDGET_TYPES.SPOTIFY]: {
    showControls: true,
    showAlbumArt: true,
  },
  [WIDGET_TYPES.QUICK_LINKS]: {
    columns: 3,
    showLabels: true,
    links: [],
  },
  [WIDGET_TYPES.TIMEZONE]: {
    selectedTimezones: [
      'America/New_York',
      'Europe/London', 
      'Asia/Tokyo',
      'Asia/Hong_Kong'
    ],
    format24Hour: false,
    showSeconds: false,
  },
};

// Action types
const WIDGET_ACTIONS = {
  TOGGLE_WIDGET: "TOGGLE_WIDGET",
  UPDATE_WIDGET_SETTINGS: "UPDATE_WIDGET_SETTINGS",
  UPDATE_WIDGET_LAYOUT: "UPDATE_WIDGET_LAYOUT",
  REORDER_WIDGETS: "REORDER_WIDGETS",
  RESET_WIDGETS: "RESET_WIDGETS",
  LOAD_WIDGETS: "LOAD_WIDGETS",
};

// Initial state
const initialState = {
  visibility: DEFAULT_WIDGET_VISIBILITY,
  settings: DEFAULT_WIDGET_SETTINGS,
  layout: DEFAULT_WIDGET_LAYOUT,
  isLoaded: false,
};

// Reducer
const widgetReducer = (state, action) => {
  switch (action.type) {
    case WIDGET_ACTIONS.TOGGLE_WIDGET:
      return {
        ...state,
        visibility: {
          ...state.visibility,
          [action.payload.widgetType]:
            !state.visibility[action.payload.widgetType],
        },
      };

    case WIDGET_ACTIONS.UPDATE_WIDGET_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.widgetType]: {
            ...state.settings[action.payload.widgetType],
            ...action.payload.settings,
          },
        },
      };

    case WIDGET_ACTIONS.UPDATE_WIDGET_LAYOUT:
      return {
        ...state,
        layout: {
          ...state.layout,
          [action.payload.widgetType]: {
            ...state.layout[action.payload.widgetType],
            ...action.payload.layout,
          },
        },
      };

    case WIDGET_ACTIONS.REORDER_WIDGETS:
      return {
        ...state,
        layout: action.payload.layout,
      };

    case WIDGET_ACTIONS.RESET_WIDGETS:
      return {
        ...state,
        visibility: DEFAULT_WIDGET_VISIBILITY,
        settings: DEFAULT_WIDGET_SETTINGS,
        layout: DEFAULT_WIDGET_LAYOUT,
      };

    case WIDGET_ACTIONS.LOAD_WIDGETS:
      return {
        ...state,
        visibility: action.payload.visibility || DEFAULT_WIDGET_VISIBILITY,
        settings: action.payload.settings || DEFAULT_WIDGET_SETTINGS,
        layout: action.payload.layout || DEFAULT_WIDGET_LAYOUT,
        isLoaded: true,
      };

    default:
      return state;
  }
};

// Context
const WidgetContext = createContext();

// Provider component
export const WidgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(widgetReducer, initialState);

  // Load widget preferences from enhanced storage on mount
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const savedWidgets = await enhancedStorage.get("widgets", { fallbackToBackup: true });
        if (savedWidgets) {
          dispatch({
            type: WIDGET_ACTIONS.LOAD_WIDGETS,
            payload: savedWidgets,
          });
        } else {
          dispatch({
            type: WIDGET_ACTIONS.LOAD_WIDGETS,
            payload: {},
          });
        }
      } catch (error) {
        console.warn("Failed to load widget preferences:", error);
        dispatch({
          type: WIDGET_ACTIONS.LOAD_WIDGETS,
          payload: {},
        });
      }
    };

    loadWidgets();
  }, []);

  // Save to enhanced storage whenever state changes
  useEffect(() => {
    const saveWidgets = async () => {
      if (state.isLoaded) {
        try {
          const widgetData = {
            visibility: state.visibility,
            settings: state.settings,
            layout: state.layout,
          };
          await enhancedStorage.set("widgets", widgetData, { backup: true });
        } catch (error) {
          console.warn("Failed to save widget preferences:", error);
        }
      }
    };

    saveWidgets();
  }, [state.visibility, state.settings, state.layout, state.isLoaded]);

  // Actions
  const toggleWidget = (widgetType) => {
    dispatch({
      type: WIDGET_ACTIONS.TOGGLE_WIDGET,
      payload: { widgetType },
    });
  };

  const updateWidgetSettings = (widgetType, settings) => {
    dispatch({
      type: WIDGET_ACTIONS.UPDATE_WIDGET_SETTINGS,
      payload: { widgetType, settings },
    });
  };

  const updateWidgetLayout = (widgetType, layout) => {
    dispatch({
      type: WIDGET_ACTIONS.UPDATE_WIDGET_LAYOUT,
      payload: { widgetType, layout },
    });
  };

  const reorderWidgets = (newLayout) => {
    dispatch({
      type: WIDGET_ACTIONS.REORDER_WIDGETS,
      payload: { layout: newLayout },
    });
  };

  const resetWidgets = () => {
    dispatch({
      type: WIDGET_ACTIONS.RESET_WIDGETS,
    });
  };

  // Selectors
  const isWidgetVisible = (widgetType) => {
    return state.visibility[widgetType] || false;
  };

  const getWidgetSettings = (widgetType) => {
    return state.settings[widgetType] || {};
  };

  const getVisibleWidgets = () => {
    return Object.keys(state.visibility).filter(
      (widgetType) => state.visibility[widgetType]
    );
  };

  const getWidgetLayout = (widgetType) => {
    return state.layout[widgetType] || { size: WIDGET_SIZES.MEDIUM, order: 0 };
  };

  const getOrderedWidgets = () => {
    const visibleWidgets = getVisibleWidgets();
    return visibleWidgets.sort((a, b) => {
      const layoutA = getWidgetLayout(a);
      const layoutB = getWidgetLayout(b);
      return layoutA.order - layoutB.order;
    });
  };

  const value = {
    // State
    visibility: state.visibility,
    settings: state.settings,
    layout: state.layout,
    isLoaded: state.isLoaded,

    // Actions
    toggleWidget,
    updateWidgetSettings,
    updateWidgetLayout,
    reorderWidgets,
    resetWidgets,

    // Selectors
    isWidgetVisible,
    getWidgetSettings,
    getVisibleWidgets,
    getWidgetLayout,
    getOrderedWidgets,
  };

  return (
    <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>
  );
};

// Hook to use widget context
export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgets must be used within a WidgetProvider");
  }
  return context;
};

export { WIDGET_ACTIONS };
