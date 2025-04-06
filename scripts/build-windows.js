const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to build and package the Manus Twin application for Windows
 */
async function buildWindowsApplication() {
  console.log('Building Manus Twin for Windows...');
  
  // Define directories
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  try {
    // Build the application
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Build Windows executable
    console.log('Building Windows executable...');
    execSync('npm run build:win', { stdio: 'inherit' });
    
    // Create portable version
    console.log('Creating portable version...');
    execSync('npm run build:portable', { stdio: 'inherit' });
    
    console.log('Windows application built successfully!');
    console.log(`Installer: ${path.join(distDir, 'manus-twin-setup.exe')}`);
    console.log(`Portable: ${path.join(rootDir, 'manus-twin-portable.zip')}`);
    
  } catch (error) {
    console.error('Error building Windows application:', error);
    process.exit(1);
  }
}

// Execute the script
buildWindowsApplication();
