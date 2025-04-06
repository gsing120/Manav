const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to create a portable version of the Manus Twin application
 */
async function createPortableVersion() {
  console.log('Creating portable version of Manus Twin...');
  
  // Define directories
  const rootDir = process.cwd();
  const portableDir = path.join(rootDir, 'portable');
  const backendDir = path.join(rootDir, 'backend');
  const frontendDir = path.join(rootDir, 'frontend');
  const docsDir = path.join(rootDir, 'docs');
  
  // Create portable directory if it doesn't exist
  if (!fs.existsSync(portableDir)) {
    fs.mkdirSync(portableDir, { recursive: true });
  }
  
  try {
    // Build the application
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create directory structure
    console.log('Creating directory structure...');
    fs.mkdirSync(path.join(portableDir, 'backend'), { recursive: true });
    fs.mkdirSync(path.join(portableDir, 'frontend'), { recursive: true });
    fs.mkdirSync(path.join(portableDir, 'docs'), { recursive: true });
    
    // Copy backend files
    console.log('Copying backend files...');
    copyDirectory(
      path.join(backendDir, 'dist'),
      path.join(portableDir, 'backend', 'dist')
    );
    
    // Copy frontend files
    console.log('Copying frontend files...');
    copyDirectory(
      path.join(frontendDir, 'dist'),
      path.join(portableDir, 'frontend', 'dist')
    );
    
    // Copy documentation
    console.log('Copying documentation...');
    copyDirectory(
      docsDir,
      path.join(portableDir, 'docs')
    );
    
    // Copy package.json
    console.log('Copying package.json...');
    fs.copyFileSync(
      path.join(rootDir, 'package.json'),
      path.join(portableDir, 'package.json')
    );
    
    // Create start scripts
    console.log('Creating start scripts...');
    
    // Windows batch file
    const batchScript = '@echo off\r\n' +
      'echo Starting Manus Twin...\r\n' +
      'npm start\r\n' +
      'pause';
    
    fs.writeFileSync(
      path.join(portableDir, 'start.bat'),
      batchScript
    );
    
    // Shell script for non-Windows platforms
    const shellScript = '#!/bin/bash\n' +
      'echo "Starting Manus Twin..."\n' +
      'npm start\n';
    
    fs.writeFileSync(
      path.join(portableDir, 'start.sh'),
      shellScript
    );
    
    // Make shell script executable
    try {
      execSync(`chmod +x "${path.join(portableDir, 'start.sh')}"`);
    } catch (error) {
      console.warn('Could not make start.sh executable. This is expected on Windows.');
    }
    
    // Create README for portable version
    const portableReadme = '# Manus Twin - Portable Version\n\n' +
      'This is the portable version of Manus Twin.\n\n' +
      '## Starting the Application\n\n' +
      '- On Windows: Double-click `start.bat`\n' +
      '- On macOS/Linux: Run `./start.sh`\n\n' +
      '## Documentation\n\n' +
      'See the `docs` folder for complete documentation:\n\n' +
      '- `README.md`: Overview and general information\n' +
      '- `INSTALLATION.md`: Installation instructions\n' +
      '- `USER_GUIDE.md`: Usage instructions\n';
    
    fs.writeFileSync(
      path.join(portableDir, 'README.md'),
      portableReadme
    );
    
    // Create ZIP archive
    console.log('Creating ZIP archive...');
    const zipFileName = 'manus-twin-portable.zip';
    
    try {
      if (process.platform === 'win32') {
        // Use PowerShell on Windows
        execSync(
          `powershell -Command "Compress-Archive -Path '${portableDir}\\*' -DestinationPath '${path.join(rootDir, zipFileName)}' -Force"`,
          { stdio: 'inherit' }
        );
      } else {
        // Use zip on Unix-like systems
        execSync(
          `zip -r "${path.join(rootDir, zipFileName)}" "${portableDir}"`,
          { stdio: 'inherit' }
        );
      }
      
      console.log(`Portable version created successfully: ${zipFileName}`);
    } catch (error) {
      console.error('Error creating ZIP archive:', error);
      console.log('Portable version created successfully in directory:', portableDir);
    }
    
  } catch (error) {
    console.error('Error creating portable version:', error);
    process.exit(1);
  }
}

/**
 * Copy a directory recursively
 */
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Get all files and directories in source
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Copy each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDirectory(sourcePath, destinationPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

// Execute the script
createPortableVersion();
