# GitHub Pages Deployment Guide

This guide will help you deploy your Personal Portal to GitHub Pages successfully.

## 🚨 Common Issue: Blank Page on GitHub Pages

If you're seeing a blank page, it's likely because Vite needs to be configured for GitHub Pages deployment. The main issues are:

1. **Base path configuration**: GitHub Pages serves from a subdirectory
2. **Routing configuration**: React Router needs proper setup
3. **Build configuration**: Assets need correct paths

## ✅ Solution: Updated Configuration

I've updated your configuration files to fix these issues:

### 1. Updated `vite.config.js`
- Added `base` path configuration for GitHub Pages
- Optimized build settings
- Added chunk splitting for better performance

### 2. Updated `package.json`
- Added deployment scripts
- Added `gh-pages` package for easy deployment

### 3. Added GitHub Actions Workflow
- Automatic deployment on push to main branch
- No manual deployment needed

## 🚀 Deployment Steps

### Method 1: Automatic Deployment (Recommended)

1. **Update Repository Name**
   
   In `vite.config.js`, change `/personal-portal/` to your actual repository name:
   ```javascript
   base: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME/' : '/',
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Set source to "Deploy from a branch"
   - Select `gh-pages` branch
   - Click Save

3. **Push Changes**
   ```bash
   git add .
   git commit -m "Fix GitHub Pages deployment"
   git push origin main
   ```

4. **Wait for Deployment**
   - GitHub Actions will automatically build and deploy
   - Check the "Actions" tab in your repository
   - Your site will be available at `https://yourusername.github.io/repository-name/`

### Method 2: Manual Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build and Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Configuration Details

### Repository Name Configuration

**IMPORTANT**: You must update the base path in `vite.config.js` to match your repository name.

If your repository is `https://github.com/yourusername/my-portal`, then:
```javascript
base: process.env.NODE_ENV === 'production' ? '/my-portal/' : '/',
```

### GitHub Pages Settings

1. Go to your repository settings
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Select `gh-pages` branch and `/ (root)` folder
5. Click "Save"

## 🐛 Troubleshooting

### Issue: Still seeing blank page

**Solution**: Check the browser console for errors and verify:
- Repository name matches the base path in `vite.config.js`
- GitHub Pages is enabled in repository settings
- Build completed successfully (check Actions tab)

### Issue: 404 errors for assets

**Solution**: 
- Ensure base path is correct in `vite.config.js`
- Clear browser cache
- Check that files exist in the `gh-pages` branch

### Issue: JSX MIME type error

**Error**: `Loading module from "https://username.github.io/repo/src/main.jsx" was blocked because of a disallowed MIME type ("text/jsx")`

**Solution**:
1. **Clean and rebuild**:
   ```bash
   # Windows PowerShell
   Remove-Item -Path "dist" -Recurse -Force
   npm run build
   npm run deploy
   
   # macOS/Linux
   rm -rf dist
   npm run build
   npm run deploy
   ```

2. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open developer tools → Network tab → check "Disable cache"

3. **Verify build output**:
   - Check that `dist/index.html` references `/RepositoryName/assets/index-[hash].js`
   - NOT `/RepositoryName/src/main.jsx`

### Issue: Routing doesn't work

**Solution**: GitHub Pages doesn't support client-side routing by default. Add a `404.html` file:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Personal Portal</title>
    <script type="text/javascript">
      // Redirect to index.html for client-side routing
      var segmentCount = location.pathname.split('/').length - 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, segmentCount + 1).join('/') + '/?p=/' +
        l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
        (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### Issue: Environment variables not working

**Solution**: 
- GitHub Pages only supports client-side environment variables
- Set them in your repository settings under "Secrets and variables" → "Actions"
- For Spotify: You'll need to set up the environment variables in your hosting platform

### Issue: Browser cache showing old version

**Solution**:
1. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache**: Go to browser settings and clear cache
3. **Disable cache during development**: 
   - Open developer tools (F12)
   - Go to Network tab
   - Check "Disable cache"
4. **Wait for CDN propagation**: Sometimes it takes 5-10 minutes

## 📱 Testing Your Deployment

After deployment, test these features:
1. **Homepage loads correctly**
2. **Navigation works** (Home, Tools, Links)
3. **Calculator functions properly**
4. **Currency converter works**
5. **Spotify ticker shows** (demo tracks if not configured)

## 🎵 Spotify Integration with GitHub Pages

For Spotify integration:
1. Use your GitHub Pages URL as the redirect URI
2. Example: `https://yourusername.github.io/personal-portal/`
3. Follow the [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) guide

## 📝 Quick Checklist

- [ ] Updated repository name in `vite.config.js`
- [ ] Enabled GitHub Pages in repository settings
- [ ] Set source to `gh-pages` branch
- [ ] Pushed changes to main branch
- [ ] Checked Actions tab for successful deployment
- [ ] Cleared browser cache
- [ ] Tested site functionality

## 🔗 Your Site URL

After successful deployment, your site will be available at:
```
https://yourusername.github.io/repository-name/
```

Replace `yourusername` with your GitHub username and `repository-name` with your actual repository name.

## 🆘 Still Having Issues?

If you're still seeing errors:

1. **Check browser console** for JavaScript errors
2. **Verify repository name** in `vite.config.js` matches exactly
3. **Check GitHub Actions logs** for build errors
4. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
5. **Wait a few minutes** for DNS propagation
6. **Try incognito/private browsing mode**

## 🔄 Common Deployment Workflow

For future updates:

1. **Make changes** to your code
2. **Test locally**: `npm run dev`
3. **Build and deploy**: `npm run deploy`
4. **Hard refresh** browser to see changes
5. **Test all functionality**

## 🎉 Success!

Once deployed successfully, your Personal Portal will be live and accessible to anyone with the URL. You can now share your digital playground with the world! 