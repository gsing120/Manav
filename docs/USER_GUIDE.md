# Manus Twin - User Guide

This guide provides detailed instructions for using the Manus Twin application after installation.

## Getting Started

### Launching the Application

1. Start Manus Twin using one of the following methods:
   - Click the desktop shortcut
   - Select from the Start menu
   - Run `manus-twin.exe` from the installation directory
   - Run `start.bat` if using the portable version

2. The application will open to the Dashboard page, showing:
   - Available AI models
   - System status
   - Recent conversations

### Setting Up API Keys

Before using AI models, you need to configure your API keys:

1. Navigate to the Settings page
2. Click on "API Keys" in the sidebar
3. Enter your API keys:
   - For Gemini: Enter your Google API key (e.g., AIzaSyAzzjOYjYXzdJIuGYadyvPi_p1Co-eJzzI)
   - For Claude: Enter your Anthropic API key
   - For custom providers: Enter both the API key and endpoint URL

### Selecting an AI Model

1. From the Dashboard or Chat page, use the model selector dropdown
2. Choose from available models:
   - Gemini models (1.5 Flash, 2.0 experimental, etc.)
   - Claude models (3.7, etc.)
   - Any custom models you've configured

## Using the Chat Interface

### Starting a New Conversation

1. Click "New Chat" from the Dashboard or sidebar
2. Select your preferred AI model
3. Type your message in the input field
4. Press Enter or click the Send button

### Continuing Existing Conversations

1. From the Dashboard, click on any previous conversation
2. The chat history will load
3. Continue the conversation by typing new messages

### Chat Features

- **Attachments**: Click the paperclip icon to attach files
- **Voice Input**: Click the microphone icon for voice input
- **Code Blocks**: The AI will format code in syntax-highlighted blocks
- **Markdown Support**: Format using markdown in your messages

## Using the Virtual Linux Sandbox

The virtual Linux sandbox allows the AI to execute commands and run code in a secure environment.

### Executing Commands

1. In the chat, ask the AI to perform a task requiring command execution
   - Example: "Create a Python script that calculates prime numbers"
   - Example: "Check the disk usage on the system"

2. The AI will:
   - Create a sandbox environment
   - Execute the necessary commands
   - Return the results in the chat

### File Operations

You can ask the AI to:
- Create files
- Read file contents
- Modify files
- Delete files
- List directory contents

Example: "Create a simple HTML webpage with a form"

### Running Code

The sandbox supports multiple programming languages:
- Python
- JavaScript/Node.js
- Shell scripts
- And more

Example: "Write and run a Python script that generates a Fibonacci sequence"

## Working with Memory and Knowledge

### Using the Memory System

The memory system allows the AI to maintain context across sessions:

1. Previous conversations are automatically stored in memory
2. The AI can reference past interactions when responding
3. You can explicitly ask the AI to recall information from previous conversations

### Managing Knowledge Entries

The knowledge system allows you to store information for the AI to reference:

1. Navigate to Settings > Knowledge
2. Click "Add Knowledge Entry"
3. Provide:
   - Name: A descriptive title
   - Content: The information to store
   - Tags: Optional keywords for easier retrieval

4. Use knowledge in conversations:
   - The AI will automatically reference relevant knowledge
   - You can explicitly ask about stored knowledge

### Knowledge Capacity

Manus Twin supports up to 100 knowledge entries (compared to 20 in Manus), allowing for more extensive context.

## Advanced Features

### Custom Functions

Manus Twin supports custom functions that extend the AI's capabilities:

1. Navigate to Settings > Functions
2. Click "Add Function"
3. Define the function:
   - Name
   - Description
   - Parameters
   - Implementation

4. The AI can then use these functions in conversations

### Windows Integration

Manus Twin integrates with Windows in several ways:

- **File System Access**: Access local files (with permission)
- **Desktop Notifications**: Receive alerts when tasks complete
- **System Information**: Get information about your Windows system

### Customizing the Interface

1. Navigate to Settings > Appearance
2. Customize:
   - Theme (Light/Dark)
   - Font size
   - Layout options
   - Color scheme

## Troubleshooting

### Common Issues

#### Slow Responses
- Try a different AI model
- Check your internet connection
- Reduce the complexity of your queries

#### Model Errors
- Verify your API key is correct and active
- Check if you've exceeded API rate limits
- Try a different model if one is unavailable

#### Application Not Responding
- Restart the application
- Check system resources (CPU, memory)
- Update to the latest version

### Getting Help

If you encounter issues not covered in this guide:

1. Check the Troubleshooting section in README.md
2. Look for error messages in the application logs
3. Contact support or open an issue on GitHub

## Tips for Effective Use

1. **Be Specific**: Clear, specific requests get better results
2. **Use Context**: Reference previous messages when needed
3. **Leverage Knowledge**: Add important information to the knowledge system
4. **Try Different Models**: Different AI models have different strengths
5. **Use the Sandbox**: For complex tasks, let the AI use the sandbox

## Next Steps

After becoming familiar with basic usage, explore:
- API integration with other applications
- Custom model configurations
- Advanced sandbox usage
- Contributing to the project
