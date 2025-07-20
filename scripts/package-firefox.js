import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const firefoxBuildDir = path.join(projectRoot, 'extensions', 'firefox', 'build');
const outputPath = path.join(projectRoot, 'personal-portal-firefox.xpi');

console.log('Packaging Firefox extension...');

try {
  // Check if build directory exists
  if (!fs.existsSync(firefoxBuildDir)) {
    console.error('Firefox extension build not found. Run "npm run copy:firefox-extension" first.');
    process.exit(1);
  }
  
  // Remove existing package
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  
  // Create xpi package (which is just a zip with .xpi extension)
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Use PowerShell on Windows
    const command = `powershell -Command "Compress-Archive -Path '${firefoxBuildDir}\\*' -DestinationPath '${outputPath.replace('.xpi', '.zip')}'"`;
    execSync(command, { stdio: 'inherit' });
    
    // Rename .zip to .xpi
    fs.renameSync(outputPath.replace('.xpi', '.zip'), outputPath);
  } else {
    // Use zip command on Unix-like systems
    const command = `cd "${firefoxBuildDir}" && zip -r "${outputPath}" .`;
    execSync(command, { stdio: 'inherit' });
  }
  
  // Verify package was created
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log('✅ Firefox extension packaged successfully!');
    console.log(`📦 Package: ${outputPath}`);
    console.log(`📏 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Go to Firefox Add-on Developer Hub');
    console.log('2. Upload the .xpi file');
    console.log('3. Fill in listing information');
    console.log('4. Submit for review');
    console.log('');
    console.log('🔧 For testing:');
    console.log('1. Open Firefox');
    console.log('2. Go to about:debugging');
    console.log('3. Click "This Firefox"');
    console.log('4. Click "Load Temporary Add-on"');
    console.log('5. Select the .xpi file');
  } else {
    throw new Error('Package file was not created');
  }
  
} catch (error) {
  console.error('❌ Error packaging Firefox extension:', error);
  process.exit(1);
}