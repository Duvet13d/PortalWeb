# Personal Portal Website

A modern, animated personal portal website built with React, Vite, and Framer Motion. This project serves as a digital playground showcasing personal interests, useful tools, and curated links with beautiful animations and transitions.

## ✨ Features

- **Modern Design**: Minimalist black background with bold typography
- **Smooth Animations**: Page transitions with curtain wipe effects
- **Responsive Layout**: Mobile-friendly design with hamburger menu
- **Interactive Tools**: Enhanced calculator with expression input and currency converter
- **Curated Links**: Personal collection of interesting websites
- **Real Spotify Integration**: Live ticker showing currently playing and recently played music
- **Expression Calculator**: Type mathematical expressions directly and get instant results

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **API Integration**: Spotify Web API

## 🎨 Design System

### Color Palette
- Background: `#000000` (Black)
- Primary Text: `#FFFFFF` (White)
- Accent 1: `rgb(221, 0, 0)` (Red) - Primary highlights
- Accent 2: `rgb(252, 92, 18)` (Orange) - Secondary highlights

### Typography
- **Headings**: Dela Gothic One (Bold, uppercase)
- **Body Text**: IBM Plex Sans JP (Regular weight)

## 📱 Pages

### Home
- Hero section with animated welcome text
- Dynamic rotating text phrases
- **Real Spotify ticker** with infinite scroll showing currently playing and recently played tracks
- Mask text reveal animations

### Tools
- **Enhanced Calculator**: 
  - Input field for typing mathematical expressions (e.g., "1 + 4")
  - Press Enter to calculate or use the = button
  - Instant preview of results as you type
  - Traditional button interface that inserts values into the input
  - Error handling for invalid expressions
- **Currency Converter**: Real-time HKD to JPY/USD/CNY conversion with +100 HKD hotkey

### Links
- Curated collection of interesting websites
- Organized by categories (Design, Development, Learning, etc.)
- Hover effects and stagger animations

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Spotify API credentials (see Spotify Setup section below)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎵 Spotify Setup

To enable real Spotify integration:

1. **Create a Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
   - Create a new app
   - Set redirect URI to `http://localhost:3000`
   - Note down your Client ID and Client Secret

2. **Generate Refresh Token**
   - Visit this URL with your client ID:
     ```
     https://accounts.spotify.com/en/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2Flocalhost:3000&scope=user-read-currently-playing+user-read-recently-played
     ```
   - Authorize the app and copy the code from the redirect URL
   - Create a base64 encoded string of `client_id:client_secret`
   - Run this curl command:
     ```bash
     curl -H "Authorization: Basic BASE64_ENCODED_CLIENT_CREDENTIALS" \
     -d grant_type=authorization_code \
     -d code=YOUR_CODE \
     -d redirect_uri=http%3A%2F%2Flocalhost:3000 \
     https://accounts.spotify.com/api/token
     ```
   - Copy the `refresh_token` from the response

3. **Update Environment Variables**
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   VITE_SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
   ```

## 🌐 API Integration

### Currency Converter
- Uses ExchangeRate-API for real-time currency conversion
- Fallback to mock rates if API is unavailable
- Default conversion from HKD to JPY, USD, and CNY

### Spotify Integration
- **Currently Playing**: Shows the track currently playing on your Spotify account
- **Recently Played**: Displays your recently played tracks
- **Real-time Updates**: Refreshes every 30 seconds to show latest activity
- **Fallback**: Uses mock data if API is unavailable or not configured
- **Visual Indicators**: Highlights currently playing track with special styling

## 🎯 Key Components

- **PageTransition**: Full-screen curtain wipe transitions
- **MaskTextReveal**: Animated text reveals with mask effects
- **DynamicText**: Rotating text component with smooth transitions
- **SpotifyTicker**: Real-time horizontal scrolling music ticker with Spotify integration
- **Calculator**: Enhanced calculator with expression input and instant evaluation
- **CurrencyConverter**: Real-time currency conversion tool
- **LinkCard**: Animated link cards with hover effects

## 📦 Project Structure
src/
├── components/ # Reusable UI components
├── pages/ # Page components
├── data/ # Static data files
├── utils/ # Utility functions
│ └── spotify.js # Spotify API integration
├── App.jsx # Main application component
├── main.jsx # Application entry point
└── index.css # Global styles

## 🔧 Customization

### Adding New Links
Edit `src/data/links.js` to add new curated links:

```javascript
{
  id: 13,
  title: "New Website",
  url: "https://example.com",
  description: "Description of the website",
  category: "Category"
}
```

### Modifying Dynamic Text
Update the text array in `src/components/DynamicText.jsx` or pass custom texts to the component.

### Styling Changes
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Custom colors and fonts defined in Tailwind config

## 🚀 Performance Features

- Vite for fast development and optimized builds
- Framer Motion for smooth 60fps animations
- Lazy loading and code splitting ready
- Responsive images and optimized assets
- Efficient API polling for Spotify integration

## 🔮 Future Enhancements

- User authentication for personalized Spotify data
- Dark/light mode toggle
- Blog section
- Contact form
- PWA support
- More utility tools
- Playlist management features

## 🛠️ Calculator Usage

The enhanced calculator supports two modes:

1. **Expression Mode**: Type mathematical expressions directly
   - Example: `1 + 4 * 2` → `9`
   - Press Enter to calculate
   - Real-time preview of results

2. **Button Mode**: Use traditional calculator buttons
   - Number buttons insert digits
   - Operator buttons (+, -, *, /) insert operators
   - = button evaluates the expression

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using React, Vite, Framer Motion, and Spotify Web API