# Personal Portal Website

A modern, animated personal portal website built with React, Vite, and Framer Motion. This project serves as a digital playground showcasing personal interests, useful tools, and curated links with beautiful animations and transitions.

## ✨ Features

- **Modern Design**: Minimalist black background with bold typography
- **Smooth Animations**: Page transitions with curtain wipe effects
- **Responsive Layout**: Mobile-friendly design with hamburger menu
- **Interactive Tools**: Enhanced calculator with expression input and currency converter
- **Curated Links**: Personal collection of interesting websites
- **Spotify Integration**: Live ticker showing currently playing and recently played music (optional)
- **Expression Calculator**: Type mathematical expressions directly and get instant results

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **API Integration**: Spotify Web API (optional)

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
- **Spotify ticker** with infinite scroll showing currently playing and recently played tracks
- Mask text reveal animations
- Falls back to demo tracks if Spotify is not configured

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

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will work with demo data. To enable Spotify integration, follow the Spotify Setup section below.

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎵 Spotify Setup (Optional)

The app displays demo tracks by default. To show your actual Spotify listening data:

### Prerequisites
- A Spotify account (Free or Premium)
- A deployed website with HTTPS (GitHub Pages, Netlify, Vercel, etc.)

### Method 1: Using a Hosted Redirect URL (Recommended)

1. **Deploy your website first**
   - Deploy to GitHub Pages, Netlify, Vercel, or any HTTPS hosting service
   - Note your deployed URL (e.g., `https://yourusername.github.io/personal-portal`)

2. **Create a Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
   - Create a new app
   - Set redirect URI to your deployed URL: `https://yourusername.github.io/personal-portal`
   - Note down your Client ID and Client Secret

3. **Generate Refresh Token**
   - Visit this URL (replace YOUR_CLIENT_ID and YOUR_DEPLOYED_URL):
     ```
     https://accounts.spotify.com/en/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_DEPLOYED_URL&scope=user-read-currently-playing+user-read-recently-played
     ```
   - Authorize the app and copy the code from the redirect URL
   - Create a base64 encoded string of `client_id:client_secret` using [base64encode.org](https://www.base64encode.org/)
   - Run this curl command (replace placeholders):
     ```bash
     curl -H "Authorization: Basic YOUR_BASE64_ENCODED_CREDENTIALS" \
     -d grant_type=authorization_code \
     -d code=YOUR_CODE \
     -d redirect_uri=YOUR_DEPLOYED_URL \
     https://accounts.spotify.com/api/token
     ```
   - Copy the `refresh_token` from the response

4. **Set Environment Variables**
   Create a `.env` file in your project root:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   VITE_SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
   ```

### Method 2: Using a Temporary Redirect Page

If you don't have a hosted site yet, you can use a temporary redirect:

1. Create a simple HTML page and host it on GitHub Pages or similar
2. Use that URL as your redirect URI
3. Follow the same steps as Method 1

### Method 3: Local Development (Advanced)

For local development, you can use tools like ngrok to create a temporary HTTPS tunnel:

1. Install ngrok: `npm install -g ngrok`
2. Run your app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the provided HTTPS URL as your redirect URI

## 🌐 API Integration

### Currency Converter
- Uses ExchangeRate-API for real-time currency conversion
- Fallback to mock rates if API is unavailable
- Default conversion from HKD to JPY, USD, and CNY

### Spotify Integration
- **Currently Playing**: Shows the track currently playing on your Spotify account
- **Recently Played**: Displays your recently played tracks
- **Real-time Updates**: Refreshes every 30 seconds to show latest activity
- **Graceful Fallback**: Uses demo data if API is unavailable or not configured
- **Visual Indicators**: Highlights currently playing track with special styling
- **Optional**: App works perfectly without Spotify configuration

## 🎯 Key Components

- **PageTransition**: Full-screen curtain wipe transitions
- **MaskTextReveal**: Animated text reveals with mask effects
- **DynamicText**: Rotating text component with smooth transitions
- **SpotifyTicker**: Music ticker with real Spotify integration and demo fallback
- **Calculator**: Enhanced calculator with expression input and instant evaluation
- **CurrencyConverter**: Real-time currency conversion tool
- **LinkCard**: Animated link cards with hover effects

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── data/               # Static data files
├── utils/              # Utility functions
│   └── spotify.js      # Spotify API integration
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

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
- Efficient API polling for Spotify integration (only when configured)

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

## 🎵 Spotify Status Messages

The app will display different status messages based on configuration:

- **"Spotify not configured - Showing demo tracks"**: No environment variables set
- **"Showing demo tracks - Configure Spotify for live data"**: Credentials configured but no data available
- **"Failed to load Spotify data - Showing demo tracks"**: API error occurred

## 🔧 Troubleshooting

### Spotify Issues
- **"Spotify not configured"**: Check that all environment variables are set
- **"Failed to load Spotify data"**: Check that your refresh token is valid
- **CORS errors**: Ensure you're using the correct redirect URI in your Spotify app settings

### General Issues
- **Build errors**: Make sure all dependencies are installed with `npm install`
- **Environment variables not loading**: Ensure `.env` file is in project root and variables start with `VITE_`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using React, Vite, Framer Motion, and Spotify Web API