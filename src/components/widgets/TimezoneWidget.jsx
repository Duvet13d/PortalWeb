import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Popular timezones with their display names
const POPULAR_TIMEZONES = [
  { zone: 'America/New_York', label: 'New York', flag: '🇺🇸' },
  { zone: 'America/Los_Angeles', label: 'Los Angeles', flag: '🇺🇸' },
  { zone: 'Europe/London', label: 'London', flag: '🇬🇧' },
  { zone: 'Europe/Paris', label: 'Paris', flag: '🇫🇷' },
  { zone: 'Asia/Tokyo', label: 'Tokyo', flag: '🇯🇵' },
  { zone: 'Asia/Hong_Kong', label: 'Hong Kong', flag: '🇭🇰' },
  { zone: 'Asia/Singapore', label: 'Singapore', flag: '🇸🇬' },
  { zone: 'Australia/Sydney', label: 'Sydney', flag: '🇦🇺' },
  { zone: 'Asia/Dubai', label: 'Dubai', flag: '🇦🇪' },
  { zone: 'Europe/Berlin', label: 'Berlin', flag: '🇩🇪' },
  { zone: 'Asia/Shanghai', label: 'Shanghai', flag: '🇨🇳' },
  { zone: 'America/Chicago', label: 'Chicago', flag: '🇺🇸' }
];

const TimezoneWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('widget-settings-timezone');
    return savedSettings ? JSON.parse(savedSettings) : {
      selectedTimezones: [
        'America/New_York',
        'Europe/London', 
        'Asia/Tokyo',
        'Asia/Hong_Kong'
      ],
      format24Hour: false,
      showSeconds: false
    };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('widget-settings-timezone', JSON.stringify(settings));
  }, [settings]);

  const formatTime = (date, timezone) => {
    const options = {
      timeZone: timezone,
      hour: settings.format24Hour ? '2-digit' : 'numeric',
      minute: '2-digit',
      ...(settings.showSeconds && { second: '2-digit' }),
      ...(!settings.format24Hour && { hour12: true })
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatDate = (date, timezone) => {
    const options = {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const getTimezoneInfo = (timezone) => {
    return POPULAR_TIMEZONES.find(tz => tz.zone === timezone) || {
      zone: timezone,
      label: timezone.split('/').pop().replace('_', ' '),
      flag: '🌍'
    };
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettings(settingsForm);
    setShowSettings(false);
  };

  const handleTimezoneToggle = (timezone) => {
    const isSelected = settingsForm.selectedTimezones.includes(timezone);
    
    if (isSelected) {
      // Remove timezone (but keep at least one)
      if (settingsForm.selectedTimezones.length > 1) {
        setSettingsForm(prev => ({
          ...prev,
          selectedTimezones: prev.selectedTimezones.filter(tz => tz !== timezone)
        }));
      }
    } else {
      // Add timezone (max 6)
      if (settingsForm.selectedTimezones.length < 6) {
        setSettingsForm(prev => ({
          ...prev,
          selectedTimezones: [...prev.selectedTimezones, timezone]
        }));
      }
    }
  };

  const handleSettingsChange = (e) => {
    const { name, type, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : e.target.value
    }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white" data-testid="timezone-widget" role="region" aria-label="World clock">
      {showSettings ? (
        <div className="timezone-settings">
          <h3 className="text-lg font-semibold mb-3">Timezone Settings</h3>
          <form onSubmit={handleSettingsSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-2">Select Timezones (max 6)</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {POPULAR_TIMEZONES.map((tz) => (
                  <button
                    key={tz.zone}
                    type="button"
                    onClick={() => handleTimezoneToggle(tz.zone)}
                    className={`text-xs px-2 py-2 rounded flex items-center space-x-1 ${
                      settingsForm.selectedTimezones.includes(tz.zone)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    disabled={
                      !settingsForm.selectedTimezones.includes(tz.zone) && 
                      settingsForm.selectedTimezones.length >= 6
                    }
                  >
                    <span>{tz.flag}</span>
                    <span>{tz.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Selected: {settingsForm.selectedTimezones.length}/6
              </p>
            </div>

            <div className="mb-3 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="format24Hour"
                  checked={settingsForm.format24Hour}
                  onChange={handleSettingsChange}
                  className="mr-2"
                />
                <span className="text-sm">24-hour format</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showSeconds"
                  checked={settingsForm.showSeconds}
                  onChange={handleSettingsChange}
                  className="mr-2"
                />
                <span className="text-sm">Show seconds</span>
              </label>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">World Clock</h3>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              aria-label="Timezone settings"
            >
              ⚙️
            </button>
          </div>

          <div className="space-y-3">
            {settings.selectedTimezones.map((timezone) => {
              const tzInfo = getTimezoneInfo(timezone);
              return (
                <motion.div
                  key={timezone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tzInfo.flag}</span>
                    <div>
                      <div className="text-sm font-medium">{tzInfo.label}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(currentTime, timezone)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold">
                      {formatTime(currentTime, timezone)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-700 text-center">
            <div className="text-xs text-gray-400">
              Local: {formatTime(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimezoneWidget;