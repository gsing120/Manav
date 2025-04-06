# Manus Twin - Installation Guide

This guide provides detailed instructions for installing and setting up the Manus Twin application on a Windows computer.

## Prerequisites

Before installing Manus Twin, ensure your system meets the following requirements:

- **Operating System**: Windows 10 or later
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 2GB free space
- **Node.js**: Version 18.x or later
- **Internet Connection**: Required for AI model access

## Installation Methods

### Method 1: Using the Windows Installer

1. **Download the Installer**
   - Go to the releases page on GitHub
   - Download the latest `manus-twin-setup.exe` file

2. **Run the Installer**
   - Double-click the downloaded installer
   - If prompted by Windows Defender or UAC, click "Yes" to allow the installation
   - Follow the on-screen instructions
   - Choose your installation directory (default is `C:\Program Files\Manus Twin`)
   - Select whether to create a desktop shortcut

3. **Launch the Application**
   - Once installation is complete, launch Manus Twin from:
     - The desktop shortcut (if created)
     - The Start menu under "Manus Twin"
     - The installation directory by running `manus-twin.exe`

### Method 2: Using the Portable Version

1. **Download the Portable Version**
   - Go to the releases page on GitHub
   - Download the latest `manus-twin-portable.zip` file

2. **Extract the Files**
   - Right-click the downloaded ZIP file and select "Extract All..."
   - Choose a destination folder
   - Click "Extract"

3. **Launch the Application**
   - Navigate to the extracted folder
   - Run `start.bat` to launch the application

### Method 3: Building from Source

1. **Clone the Repository**
   ```
   git clone https://github.com/yourusername/manus-twin.git
   cd manus-twin
   ```

2. **Install Dependencies**
   ```
   npm install
   ```

3. **Build the Application**
   ```
   npm run build
   ```

4. **Start the Application**
   ```
   npm start
   ```

## Post-Installation Setup

### API Key Configuration

1. Launch Manus Twin
2. Navigate to the Settings page
3. Click on "API Keys" in the sidebar
4. Enter your API keys:
   - **Gemini**: Enter your Google API key
   - **Claude**: Enter your Anthropic API key
   - **Custom Providers**: Enter the API key and endpoint URL

### First-Time Configuration

1. **Select Default Model**
   - Choose your preferred default AI model from the dropdown menu

2. **Configure Memory Settings**
   - Set how long conversations should be retained

3. **Configure Knowledge System**
   - Add initial knowledge entries if desired

## Troubleshooting Installation Issues

### Common Installation Problems

#### Windows Defender Blocking Installation
- Temporarily disable Windows Defender
- Add an exception for the installer
- Use the portable version instead

#### Missing Dependencies
- Ensure Node.js is installed correctly
- Run `npm install` again to ensure all dependencies are installed

#### Port Conflicts
- If you see an error about port 3000 being in use:
  - Close other applications that might be using this port
  - Change the port in the configuration file

## Updating Manus Twin

### Using the Installer
- Download the latest installer
- Run it to update your existing installation

### Using the Portable Version
- Download the latest portable version
- Extract it to a new location
- Copy your settings from the old version if needed

### From Source
- Pull the latest changes from the repository
- Install any new dependencies
- Rebuild the application

## Uninstalling

### Windows Installer Version
- Go to Control Panel > Programs > Uninstall a program
- Select "Manus Twin" and click "Uninstall"
- Follow the on-screen instructions

### Portable Version
- Simply delete the folder containing the portable version

## Next Steps

After installation, refer to the main README.md file for:
- Detailed usage instructions
- Feature documentation
- API reference
- Advanced configuration options
