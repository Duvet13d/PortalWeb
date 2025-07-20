import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const firefoxExtDir = path.join(projectRoot, 'extensions', 'firefox');

console.log('Building Firefox extension...');

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to copy file
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

try {
  // Create build directory for Firefox extension
  const firefoxBuildDir = path.join(firefoxExtDir, 'build');
  
  // Clean previous build
  if (fs.existsSync(firefoxBuildDir)) {
    fs.rmSync(firefoxBuildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(firefoxBuildDir, { recursive: true });
  
  // Copy built app files
  if (fs.existsSync(distDir)) {
    copyDir(distDir, firefoxBuildDir);
  } else {
    console.error('Dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Copy extension-specific files
  const extensionFiles = [
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js'
  ];
  
  for (const file of extensionFiles) {
    const srcPath = path.join(firefoxExtDir, file);
    const destPath = path.join(firefoxBuildDir, file);
    
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    }
  }
  
  // Create icons directory and copy icons if they exist
  const iconsDir = path.join(firefoxExtDir, 'icons');
  const buildIconsDir = path.join(firefoxBuildDir, 'icons');
  
  if (fs.existsSync(iconsDir)) {
    copyDir(iconsDir, buildIconsDir);
  } else {
    // Create placeholder icons
    fs.mkdirSync(buildIconsDir, { recursive: true });
    
    // Copy favicon as placeholder icons
    const faviPath = path.join(projectRoot, 'public', 'favi.svg');
    if (fs.existsSync(faviPath)) {
      const iconSizes = [16, 32, 48, 128];
      for (const size of iconSizes) {
        copyFile(faviPath, path.join(buildIconsDir, `icon-${size}.png`));
      }
    }
  }
  
  // Create welcome page
  const welcomeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Personal Portal</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
            color: #fff;
            margin: 0;
            padding: 40px;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        h1 {
            color: rgb(221, 0, 0);
            margin-bottom: 20px;
        }
        .btn {
            background: rgb(221, 0, 0);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
        .btn:hover {
            background: rgb(180, 0, 0);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Personal Portal!</h1>
        <p>Your new tab page has been successfully installed.</p>
        <p>Open a new tab to start using Personal Portal, or click below to configure your settings.</p>
        <a href="popup.html" class="btn">Open Settings</a>
        <a href="index.html" class="btn">Open Personal Portal</a>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(path.join(firefoxBuildDir, 'welcome.html'), welcomeHtml);
  
  console.log('✅ Firefox extension built successfully!');
  console.log(`📁 Extension files are in: ${firefoxBuildDir}`);
  
} catch (error) {
  console.error('❌ Error building Firefox extension:', error);
  process.exit(1);
}