# Personal Portal Website

A modern, animated personal portal website built with React, Vite, and Framer Motion. This project serves as a digital playground showcasing personal interests, useful tools, and curated links with beautiful animations and transitions.

## ✨ Features

- **Modern Design**: Minimalist black background with bold typography
- **Smooth Animations**: Page transitions with curtain wipe effects
- **Responsive Layout**: Mobile-friendly design with hamburger menu
- **Interactive Tools**: Calculator and currency converter
- **Curated Links**: Personal collection of interesting websites
- **Spotify Integration**: Mock ticker showing currently playing music

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios

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
- Spotify playlist ticker with infinite scroll
- Mask text reveal animations

### Tools
- **Calculator**: Grid-based calculator with basic arithmetic operations
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

4. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 API Integration

### Currency Converter
- Uses ExchangeRate-API for real-time currency conversion
- Fallback to mock rates if API is unavailable
- Default conversion from HKD to JPY, USD, and CNY

### Spotify Integration (Mock)
- Currently uses mock data for demonstration
- Ready for real Spotify API integration
- Requires Spotify Developer credentials for production use

## 🎯 Key Components

- **PageTransition**: Full-screen curtain wipe transitions
- **MaskTextReveal**: Animated text reveals with mask effects
- **DynamicText**: Rotating text component with smooth transitions
- **SpotifyTicker**: Infinite horizontal scrolling music ticker
- **Calculator**: Functional calculator with grid layout
- **CurrencyConverter**: Real-time currency conversion tool
- **LinkCard**: Animated link cards with hover effects

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── data/               # Static data files
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

## 🔮 Future Enhancements

- Real Spotify API integration
- Dark/light mode toggle
- Blog section
- Contact form
- PWA support
- More utility tools

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using React, Vite, and Framer Motion 