import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const extensionsDir = path.join(projectRoot, 'extensions');

console.log('Cleaning extension build files...');

try {
  // Clean Chrome extension build
  const chromeBuildDir = path.join(extensionsDir, 'chrome', 'build');
  if (fs.existsSync(chromeBuildDir)) {
    fs.rmSync(chromeBuildDir, { recursive: true, force: true });
    console.log('✅ Chrome extension build cleaned');
  }
  
  // Clean Firefox extension build
  const firefoxBuildDir = path.join(extensionsDir, 'firefox', 'build');
  if (fs.existsSync(firefoxBuildDir)) {
    fs.rmSync(firefoxBuildDir, { recursive: true, force: true });
    console.log('✅ Firefox extension build cleaned');
  }
  
  // Clean packaged extensions
  const chromePackage = path.join(projectRoot, 'personal-portal-chrome.zip');
  if (fs.existsSync(chromePackage)) {
    fs.unlinkSync(chromePackage);
    console.log('✅ Chrome extension package removed');
  }
  
  const firefoxPackage = path.join(projectRoot, 'personal-portal-firefox.xpi');
  if (fs.existsSync(firefoxPackage)) {
    fs.unlinkSync(firefoxPackage);
    console.log('✅ Firefox extension package removed');
  }
  
  console.log('🧹 Extension cleanup completed!');
  
} catch (error) {
  console.error('❌ Error cleaning extensions:', error);
  process.exit(1);
}