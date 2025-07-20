# Deployment Guide

This guide covers various deployment options for Personal Portal, from simple static hosting to browser extensions.

## 🚀 Quick Deployment Options

### GitHub Pages (Recommended)
The easiest way to deploy Personal Portal with automatic updates.

1. **Fork or clone the repository**
2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (will be created automatically)
3. **Configure the base URL** in `vite.config.js`:
   ```javascript
   base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
   ```
4. **Push changes** - GitHub Actions will automatically build and deploy

**Your site will be available at:** `https://yourusername.github.io/your-repo-name/`

### Netlify
1. **Connect your repository** to Netlify
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables** (if using Spotify):
   - `VITE_SPOTIFY_CLIENT_ID`
   - `VITE_SPOTIFY_CLIENT_SECRET`
   - `VITE_SPOTIFY_REFRESH_TOKEN`
4. **Deploy** - Automatic deployments on git push

### Vercel
1. **Import your repository** to Vercel
2. **Framework preset**: Vite
3. **Build settings** (auto-detected):
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment variables** (if needed)
5. **Deploy** - Automatic deployments on git push

### Firebase Hosting
1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```
3. **Configure `firebase.json`**:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```
4. **Build and deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Advanced Deployment

### Custom Domain Setup

#### GitHub Pages with Custom Domain
1. **Add CNAME file** to `public/` directory:
   ```
   yourdomain.com
   ```
2. **Configure DNS** with your domain provider:
   - Add CNAME record pointing to `yourusername.github.io`
3. **Enable HTTPS** in repository settings

#### Netlify Custom Domain
1. **Add domain** in Netlify dashboard
2. **Configure DNS** or use Netlify DNS
3. **SSL certificate** is automatically provisioned

### Environment Variables Setup

Create `.env` file for local development:
```env
# Spotify Integration (Optional)
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
VITE_SPOTIFY_REFRESH_TOKEN=your_refresh_token

# Weather API (Optional)
VITE_WEATHER_API_KEY=your_openweather_api_key

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_google_analytics_id
```

For production, set these in your hosting platform's environment variables section.

## 📦 Browser Extension Deployment

### Chrome Web Store

1. **Prepare extension package**:
   ```bash
   npm run build:chrome-extension
   ```

2. **Create developer account** at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

3. **Upload extension**:
   - Zip the `extensions/chrome/` folder after build
   - Upload to Chrome Web Store
   - Fill in store listing details

4. **Store listing requirements**:
   - Screenshots (1280x800 or 640x400)
   - Detailed description
   - Privacy policy (if collecting data)
   - Icon (128x128px)

### Firefox Add-ons

1. **Prepare extension package**:
   ```bash
   npm run build:firefox-extension
   ```

2. **Create developer account** at [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)

3. **Submit extension**:
   - Upload the `.xpi` file
   - Complete listing information
   - Wait for review (usually 1-3 days)

### Manual Extension Installation

#### Chrome (Developer Mode)
1. Build the extension: `npm run build:chrome-extension`
2. Open Chrome → Extensions (`chrome://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked" and select `extensions/chrome/` folder

#### Firefox (Temporary Installation)
1. Build the extension: `npm run build:firefox-extension`
2. Open Firefox → Add-ons (`about:addons`)
3. Click gear icon → "Debug Add-ons"
4. Click "Load Temporary Add-on" and select `manifest.json`

## 🔄 Continuous Deployment

### GitHub Actions (Included)
The repository includes a GitHub Actions workflow that:
- Builds the project on every push to main
- Deploys to GitHub Pages automatically
- Runs tests and linting

### Custom CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Personal Portal

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_SPOTIFY_CLIENT_ID: ${{ secrets.SPOTIFY_CLIENT_ID }}
          VITE_SPOTIFY_CLIENT_SECRET: ${{ secrets.SPOTIFY_CLIENT_SECRET }}
          VITE_SPOTIFY_REFRESH_TOKEN: ${{ secrets.SPOTIFY_REFRESH_TOKEN }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🛠️ Build Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:chrome-extension": "npm run build && npm run copy:chrome-extension",
    "build:firefox-extension": "npm run build && npm run copy:firefox-extension",
    "copy:chrome-extension": "cp -r dist/* extensions/chrome/ && cp extensions/chrome/manifest.json extensions/chrome/",
    "copy:firefox-extension": "cp -r dist/* extensions/firefox/ && cp extensions/firefox/manifest.json extensions/firefox/",
    "package:chrome": "cd extensions/chrome && zip -r ../../personal-portal-chrome.zip .",
    "package:firefox": "cd extensions/firefox && zip -r ../../personal-portal-firefox.xpi .",
    "deploy:gh-pages": "npm run build && gh-pages -d dist"
  }
}
```

## 🔍 Performance Optimization

### Build Optimization
The `vite.config.js` includes optimizations for:
- Code splitting by feature (widgets, tools, etc.)
- Asset optimization and compression
- Bundle size analysis
- Service worker for caching

### CDN Setup
For better performance, consider using a CDN:

1. **Cloudflare** (Free tier available)
2. **AWS CloudFront**
3. **Google Cloud CDN**

### Monitoring
Set up monitoring for your deployment:
- **Google Analytics** for usage tracking
- **Sentry** for error monitoring
- **Lighthouse CI** for performance monitoring

## 🔒 Security Considerations

### Content Security Policy
The app includes CSP headers for security:
```javascript
// In vite.config.js
define: {
  __CSP_NONCE__: JSON.stringify(process.env.CSP_NONCE || '')
}
```

### Environment Variables
Never commit sensitive data:
- Use `.env.local` for local secrets
- Set environment variables in hosting platform
- Use different keys for development/production

### HTTPS
Always deploy with HTTPS:
- GitHub Pages provides HTTPS automatically
- Netlify/Vercel include free SSL certificates
- Use Let's Encrypt for custom servers

## 📊 Analytics and Monitoring

### Google Analytics Setup
1. Create GA4 property
2. Add tracking ID to environment variables
3. Analytics will be automatically included in build

### Error Monitoring
Consider adding error tracking:
```javascript
// In src/main.jsx
if (import.meta.env.PROD) {
  // Add error tracking service
}
```

## 🚨 Troubleshooting

### Common Deployment Issues

**Build fails:**
- Check Node.js version (requires 16+)
- Clear `node_modules` and reinstall
- Check for missing environment variables

**Assets not loading:**
- Verify `base` URL in `vite.config.js`
- Check file paths are relative
- Ensure assets are in `public/` directory

**Extension not working:**
- Check manifest.json syntax
- Verify permissions are correct
- Test in incognito mode

**API calls failing:**
- Check CORS settings
- Verify API keys are set
- Check network connectivity

### Getting Help
- Check [GitHub Issues](https://github.com/yourusername/PortalWeb/issues)
- Review browser console for errors
- Test in different browsers
- Check hosting platform logs

---

**Ready to deploy?** Choose your preferred method above and follow the step-by-step instructions!