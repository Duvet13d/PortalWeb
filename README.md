# Personal Portal

A modern, customizable browser homepage built with React and Vite. Features smooth animations, useful tools, and curated links with optional Spotify integration.

## ✨ Features

- **Clean Design**: Minimalist dark theme with smooth animations
- **Useful Tools**: Calculator, currency converter, and notes
- **Quick Links**: Organize your favorite websites
- **Spotify Integration**: Show your currently playing music (optional)
- **Responsive**: Works great on desktop and mobile
- **Fast**: Built with Vite for optimal performance

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd personal-portal
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 🎵 Spotify Setup (Optional)

To show your actual Spotify music instead of demo tracks:

1. **Create a Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app with redirect URI: `http://localhost:3000`
   - Note your Client ID and Client Secret

2. **Get a Refresh Token**
   - Visit this URL (replace YOUR_CLIENT_ID):
     ```
     https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000&scope=user-read-currently-playing+user-read-recently-played
     ```
   - Authorize and copy the code from the redirect URL
   - Exchange the code for a refresh token using curl or Postman

3. **Set Environment Variables**
   ```bash
   # Create .env file
   VITE_SPOTIFY_CLIENT_ID=your_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
   VITE_SPOTIFY_REFRESH_TOKEN=your_refresh_token
   ```

## 🌐 Deployment

### GitHub Pages (Recommended)
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. The site will auto-deploy at `https://yourusername.github.io/repo-name`

### Other Platforms
- **Netlify**: Connect repo, build command: `npm run build`, publish dir: `dist`
- **Vercel**: Import repo, framework preset: Vite
- **Firebase**: `npm run build` then `firebase deploy`

## 🛠️ Customization

### Adding Links
Edit `src/data/links.js`:
```javascript
{
  id: 1,
  title: "Your Site",
  url: "https://example.com",
  description: "Description here",
  category: "Category"
}
```

### Styling
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Colors: Black background, white text, red accents

### Tools
- Calculator: `src/components/tools/Calculator.jsx`
- Currency Converter: `src/components/tools/CurrencyConverter.jsx`
- Notes: `src/components/tools/Notes.jsx`

## 🧪 Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run test         # Run tests
npm run lint         # Check code quality
```

## 📦 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Vitest** - Testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project however you'd like!

---

Built with ❤️ using React and Vite