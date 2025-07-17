import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Weather Widget - Current weather and forecast with location detection
 */
const WeatherWidget = ({ 
  title = "Weather", 
  description = "Current weather and forecast",
  size = "large",
  settings = {},
  onSettingsChange,
  className = ""
}) => {
  const [weatherData, setWeatherData] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // Default settings
  const locationSetting = settings.location || 'auto'
  const units = settings.units || 'metric'
  const showForecast = settings.showForecast !== false

  // OpenWeatherMap API key (in production, this should be in environment variables)
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo'

  // Get user's location
  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])

  // Fetch weather data
  const fetchWeatherData = useCallback(async (lat, lon) => {
    if (API_KEY === 'demo') {
      // Return demo data when no API key is available
      return getDemoWeatherData()
    }

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`),
        showForecast ? fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`) : Promise.resolve(null)
      ])

      if (!currentResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const currentData = await currentResponse.json()
      const forecastDataResult = forecastResponse ? await forecastResponse.json() : null

      return {
        current: currentData,
        forecast: forecastDataResult
      }
    } catch (error) {
      console.error('Weather API error:', error)
      throw error
    }
  }, [API_KEY, units, showForecast])

  // Get demo weather data
  const getDemoWeatherData = () => {
    const demoData = {
      current: {
        name: 'Demo City',
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 65,
          pressure: 1013
        },
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        wind: {
          speed: 3.5
        },
        visibility: 10000,
        sys: {
          country: 'US'
        }
      },
      forecast: {
        list: [
          {
            dt: Date.now() / 1000 + 86400,
            main: { temp: 25, humidity: 60 },
            weather: [{ main: 'Sunny', description: 'sunny', icon: '01d' }]
          },
          {
            dt: Date.now() / 1000 + 172800,
            main: { temp: 20, humidity: 70 },
            weather: [{ main: 'Clouds', description: 'partly cloudy', icon: '02d' }]
          },
          {
            dt: Date.now() / 1000 + 259200,
            main: { temp: 18, humidity: 80 },
            weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }]
          },
          {
            dt: Date.now() / 1000 + 345600,
            main: { temp: 23, humidity: 55 },
            weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
          },
          {
            dt: Date.now() / 1000 + 432000,
            main: { temp: 26, humidity: 50 },
            weather: [{ main: 'Sunny', description: 'sunny', icon: '01d' }]
          }
        ]
      }
    }
    return demoData
  }

  // Load weather data
  const loadWeatherData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let coords

      if (locationSetting === 'auto') {
        coords = await getUserLocation()
        setLocation({ lat: coords.lat, lon: coords.lon, name: 'Current Location' })
      } else {
        // For custom locations, you would geocode the location name
        // For demo, we'll use a default location
        coords = { lat: 40.7128, lon: -74.0060 } // New York
        setLocation({ lat: coords.lat, lon: coords.lon, name: locationSetting })
      }

      const data = await fetchWeatherData(coords.lat, coords.lon)
      setWeatherData(data.current)
      setForecastData(data.forecast)
    } catch (err) {
      console.error('Failed to load weather data:', err)
      setError(err.message)
      
      // Fallback to demo data
      const demoData = getDemoWeatherData()
      setWeatherData(demoData.current)
      setForecastData(demoData.forecast)
      setLocation({ name: 'Demo Location' })
    } finally {
      setLoading(false)
    }
  }, [locationSetting, getUserLocation, fetchWeatherData])

  // Load weather data on mount and when settings change
  useEffect(() => {
    loadWeatherData()
  }, [loadWeatherData])

  // Refresh weather data every 10 minutes
  useEffect(() => {
    const interval = setInterval(loadWeatherData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadWeatherData])

  // Get weather icon
  const getWeatherIcon = (iconCode, size = 'w-8 h-8') => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    }

    return (
      <div className={`${size} flex items-center justify-center text-2xl`}>
        {iconMap[iconCode] || '🌤️'}
      </div>
    )
  }

  // Format temperature
  const formatTemp = (temp) => {
    const unit = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K'
    return `${Math.round(temp)}${unit}`
  }

  // Format date for forecast
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // Handle settings change
  const handleSettingsChange = (newSettings) => {
    onSettingsChange?.({ ...settings, ...newSettings })
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin" />
            <span>Loading weather...</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm ${className}`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-accent-1">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm">{location?.name || 'Unknown Location'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadWeatherData}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh weather"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Weather settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {error && API_KEY !== 'demo' && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Weather data unavailable. Showing demo data.
          </p>
        </div>
      )}

      {/* Current Weather */}
      {weatherData && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weatherData.weather[0].icon, 'w-16 h-16')}
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatTemp(weatherData.main.temp)}
                </div>
                <div className="text-gray-400 capitalize">
                  {weatherData.weather[0].description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Feels like</div>
              <div className="text-lg text-white">
                {formatTemp(weatherData.main.feels_like)}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">💧</span>
              <span className="text-gray-400">Humidity:</span>
              <span className="text-white">{weatherData.main.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">💨</span>
              <span className="text-gray-400">Wind:</span>
              <span className="text-white">{weatherData.wind.speed} {units === 'metric' ? 'm/s' : 'mph'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🌡️</span>
              <span className="text-gray-400">Pressure:</span>
              <span className="text-white">{weatherData.main.pressure} hPa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">👁️</span>
              <span className="text-gray-400">Visibility:</span>
              <span className="text-white">{(weatherData.visibility / 1000).toFixed(1)} km</span>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {showForecast && forecastData && (
        <div>
          <h4 className="text-white font-medium mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {forecastData.list.slice(0, 5).map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-800/30 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">
                  {formatDate(day.dt)}
                </div>
                <div className="mb-2">
                  {getWeatherIcon(day.weather[0].icon, 'w-6 h-6')}
                </div>
                <div className="text-sm text-white font-medium">
                  {formatTemp(day.main.temp)}
                </div>
                <div className="text-xs text-gray-400">
                  {day.main.humidity}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Units</label>
                <select
                  value={units}
                  onChange={(e) => handleSettingsChange({ units: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-accent-1"
                >
                  <option value="metric">Celsius</option>
                  <option value="imperial">Fahrenheit</option>
                  <option value="kelvin">Kelvin</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Show 5-day forecast</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showForecast}
                    onChange={(e) => handleSettingsChange({ showForecast: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-1"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Notice */}
      {API_KEY === 'demo' && (
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
          <p className="text-blue-400 text-xs">
            Add VITE_OPENWEATHER_API_KEY to your .env file for live weather data.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default WeatherWidget