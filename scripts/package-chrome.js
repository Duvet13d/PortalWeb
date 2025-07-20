import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const chromeBuildDir = path.join(projectRoot, 'extensions', 'chrome', 'build');
const outputPath = path.join(projectRoot, 'personal-portal-chrome.zip');

console.log('Packaging Chrome extension...');

try {
  // Check if build directory exists
  if (!fs.existsSync(chromeBuildDir)) {
    console.error('Chrome extension build not found. Run "npm run copy:chrome-extension" first.');
    process.exit(1);
  }
  
  // Remove existing package
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  
  // Create zip package
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Use PowerShell on Windows
    const command = `powershell -Command "Compress-Archive -Path '${chromeBuildDir}\\*' -DestinationPath '${outputPath}'"`;
    execSync(command, { stdio: 'inherit' });
  } else {
    // Use zip command on Unix-like systems
    const command = `cd "${chromeBuildDir}" && zip -r "${outputPath}" .`;
    execSync(command, { stdio: 'inherit' });
  }
  
  // Verify package was created
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log('✅ Chrome extension packaged successfully!');
    console.log(`📦 Package: ${outputPath}`);
    console.log(`📏 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Go to Chrome Web Store Developer Dashboard');
    console.log('2. Upload the .zip file');
    console.log('3. Fill in store listing details');
    console.log('4. Submit for review');
  } else {
    throw new Error('Package file was not created');
  }
  
} catch (error) {
  console.error('❌ Error packaging Chrome extension:', error);
  process.exit(1);
}