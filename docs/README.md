# Manus Twin Documentation

## Overview

Manus Twin is a local Windows application that replicates the architecture and functionality of Manus.im. It provides a powerful AI assistant interface that supports multiple AI models including Gemini and Claude, with the ability to add custom API keys. The application includes a virtual Linux sandbox, memory modules for longer context, and an enhanced knowledge system supporting up to 100 knowledge entries.

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Development](#development)

## Architecture

Manus Twin follows a modular architecture with the following key components:

### Backend Components

- **Server**: Express.js server that handles API requests and serves the frontend
- **Model Integration**: Interface for interacting with different AI models
- **API Management**: System for securely storing and managing API keys
- **Workflow Engine**: Orchestrates the execution of tasks and function calls
- **Memory Module**: Maintains conversation history and context across sessions
- **Knowledge System**: Stores and retrieves knowledge entries for context
- **Virtual Linux Sandbox**: Provides a secure environment for executing commands
- **Windows Compatibility Layer**: Ensures the application runs smoothly on Windows

### Frontend Components

- **Dashboard**: Main interface for interacting with the AI assistant
- **Chat Interface**: Where conversations with the AI take place
- **Settings**: Configuration options for the application
- **Model Selection**: Interface for choosing which AI model to use

### Data Flow

1. User inputs a message through the chat interface
2. The message is sent to the backend server
3. The workflow engine processes the message and determines the appropriate action
4. If needed, the memory module provides context from previous conversations
5. If relevant, the knowledge system provides additional context
6. The model integration sends the message to the selected AI model
7. The AI model generates a response
8. The response is returned to the frontend and displayed to the user

## Features

### Multiple AI Model Support

- **Gemini Models**: Support for various Gemini models including 1.5 Flash and 2.0 experimental
- **Claude Models**: Support for Claude 3.7 and other Claude models
- **Custom API Integration**: Ability to add custom API endpoints for other AI models

### Memory and Knowledge

- **Long-term Memory**: Maintains context across sessions
- **Enhanced Knowledge System**: Supports up to 100 knowledge entries (compared to 20 in Manus)
- **Context-aware Responses**: AI responses take into account previous conversations and stored knowledge

### Virtual Linux Sandbox

- **Command Execution**: Run Linux commands in a secure sandbox environment
- **File Operations**: Create, read, update, and delete files within the sandbox
- **Shell Sessions**: Interactive shell sessions for complex operations

### Windows Integration

- **Local Deployment**: Runs locally on Windows computers
- **Desktop Integration**: Creates shortcuts and registers with Windows
- **Portable Version**: Option to create a portable version of the application

## Installation

### System Requirements

- Windows 10 or later
- 8GB RAM minimum (16GB recommended)
- 2GB free disk space
- Internet connection for AI model access

### Installation Methods

#### Installer

1. Download the installer from the releases page
2. Run the installer and follow the on-screen instructions
3. Launch the application from the Start menu or desktop shortcut

#### Portable Version

1. Download the portable version from the releases page
2. Extract the ZIP file to a location of your choice
3. Run the `start.bat` file to launch the application

## Configuration

### API Keys

1. Open the application and navigate to the Settings page
2. Click on "API Keys" in the sidebar
3. Enter your API keys for the models you want to use:
   - For Gemini: Enter your Google API key
   - For Claude: Enter your Anthropic API key
   - For custom providers: Enter the API key and endpoint URL

### Application Settings

- **Theme**: Choose between light and dark mode
- **Memory Retention**: Configure how long conversations are stored
- **Knowledge Management**: Add, edit, or remove knowledge entries
- **Sandbox Configuration**: Configure the virtual Linux sandbox environment

## Usage

### Starting a Conversation

1. Launch the application
2. Select the AI model you want to use from the dropdown menu
3. Type your message in the input field and press Enter or click Send
4. The AI will respond based on the selected model and your input

### Using the Virtual Linux Sandbox

1. In the chat interface, ask the AI to perform a task that requires the sandbox
2. The AI will execute the necessary commands in the sandbox environment
3. Results will be displayed in the chat interface

### Managing Knowledge

1. Navigate to the Settings page
2. Click on "Knowledge" in the sidebar
3. Add new knowledge entries with a name, content, and optional tags
4. Activate or deactivate knowledge entries as needed

## API Reference

### REST API Endpoints

- `/api/models`: Manage AI models
- `/api/functions`: Register and execute functions
- `/api/settings`: Configure application settings
- `/api/integration`: Interact with AI models
- `/api/management`: Manage API keys
- `/api/workflow`: Control the workflow engine
- `/api/memory`: Access the memory module
- `/api/knowledge`: Manage knowledge entries
- `/api/sandbox`: Interact with the virtual Linux sandbox
- `/api/platform`: Access platform-specific functionality
- `/api/deployment`: Manage application deployment

### WebSocket API

- `/ws`: Real-time communication for streaming responses

## Troubleshooting

### Common Issues

#### API Key Issues

- **Error**: "Invalid API key"
  - **Solution**: Verify that you've entered the correct API key in the Settings page

#### Model Availability

- **Error**: "Model not available"
  - **Solution**: Some models may be deprecated or renamed. Try using a different model or check the provider's documentation for the latest model names.

#### Application Performance

- **Issue**: Slow response times
  - **Solution**: Close other resource-intensive applications, ensure you have a stable internet connection, or try a different AI model that may be more efficient.

## Development

### Building from Source

1. Clone the repository
2. Install dependencies with `npm install`
3. Build the application with `npm run build`
4. Start the application with `npm start`

### Project Structure

- `/backend`: Server-side code
  - `/src`: Source code
    - `/api`: API routes
    - `/models`: Model integration
    - `/workflow`: Workflow engine
    - `/memory`: Memory module
    - `/knowledge`: Knowledge system
    - `/sandbox`: Virtual Linux sandbox
    - `/platform`: Platform-specific code
- `/frontend`: Client-side code
  - `/src`: Source code
    - `/components`: React components
    - `/pages`: Page layouts
    - `/utils`: Utility functions

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
