# Weather Widget Setup

The Weather widget uses the OpenWeatherMap API to fetch real-time weather data and forecasts. Follow these steps to set up your API key:

## Getting an OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/) and create a free account
2. After signing in, go to your Account > API keys
3. Generate a new API key or use the default one provided
4. Note that new API keys may take a few hours to activate

## Setting Up Your API Key

1. Create a `.env` file in the root directory of the project (if it doesn't exist)
2. Add your API key to the `.env` file:

```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

3. Replace `your_api_key_here` with your actual OpenWeatherMap API key
4. Restart the development server for the changes to take effect

## Using the Weather Widget

The Weather widget has the following features:

- Current weather conditions with temperature, humidity, wind speed, and more
- 5-day weather forecast
- Automatic location detection (requires browser permission)
- Unit selection (Celsius, Fahrenheit, Kelvin)
- Option to show/hide the forecast

## Demo Mode

If no API key is provided, the Weather widget will run in demo mode with simulated weather data. This is useful for development and testing purposes.

## Troubleshooting

- If you're seeing demo data despite setting up your API key, make sure:
  - The API key is correctly added to the `.env` file
  - The development server has been restarted
  - Your API key has been activated (can take a few hours for new keys)
- If location detection isn't working, ensure you've granted location permissions to your browser