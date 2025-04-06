# Enhanced Sandbox Features Documentation

## Overview

The Manus Twin application has been enhanced with a powerful virtual Linux sandbox that includes internet access, credential management, and website authentication capabilities. These features allow the AI to browse websites, store and use login credentials, and perform authenticated actions on behalf of the user.

## Table of Contents

1. [Enhanced Sandbox Architecture](#enhanced-sandbox-architecture)
2. [Internet Access Capabilities](#internet-access-capabilities)
3. [Credential Management System](#credential-management-system)
4. [Website Authentication](#website-authentication)
5. [Security Considerations](#security-considerations)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)

## Enhanced Sandbox Architecture

The enhanced sandbox builds upon the base virtual Linux sandbox with the following additional components:

- **BrowserInstance**: Provides web browsing capabilities with cookie management
- **CredentialManager**: Securely stores and retrieves website credentials
- **WebsiteAuthenticationService**: Handles authentication with websites using stored credentials

These components work together to provide a seamless experience for accessing the internet and authenticated websites from within the sandbox environment.

## Internet Access Capabilities

The enhanced sandbox includes the following internet access features:

### Web Browsing

- Navigate to any URL
- Submit forms
- Handle cookies and sessions
- Process HTTP redirects
- Support for common HTTP methods (GET, POST)

### File Operations

- Download files from the internet
- Save files to the sandbox environment
- Upload files from the sandbox to websites

### Content Processing

- Extract text content from web pages
- Process HTML and other web content
- Handle different content types

## Credential Management System

The credential management system provides secure storage and retrieval of website credentials:

### Secure Storage

- Credentials are encrypted using AES-256-CBC encryption
- Encryption key is securely managed
- Credentials are stored in a dedicated, isolated location

### Credential Operations

- Store credentials for websites
- Retrieve credentials for websites
- List all websites with stored credentials
- Delete credentials when no longer needed

### Domain Normalization

- Website URLs are normalized to domains for consistent credential matching
- Subdomains are handled appropriately
- Protocol and path information is stripped for security

## Website Authentication

The website authentication system allows the AI to log into websites using stored credentials:

### Authentication Process

1. Retrieve credentials for the target website
2. Navigate to the login page
3. Fill in username and password fields
4. Submit the login form
5. Verify successful login
6. Maintain authenticated session

### Authenticated Actions

Once authenticated, the AI can perform various actions on behalf of the user:

- Navigate to protected pages
- Submit forms with authenticated session
- Download files that require authentication
- Interact with web applications as the authenticated user

## Security Considerations

The enhanced sandbox implements several security measures:

- **Encryption**: All credentials are encrypted at rest
- **Isolation**: The sandbox environment is isolated from the host system
- **Session Management**: Browser sessions are properly managed and can be terminated
- **Access Control**: API endpoints require proper authentication
- **Audit Logging**: All actions are logged for security auditing

## API Reference

### Sandbox Management

- `POST /api/sandbox/sandboxes`: Create a new sandbox
- `GET /api/sandbox/sandboxes/:sandboxId`: Get sandbox information
- `DELETE /api/sandbox/sandboxes/:sandboxId`: Delete a sandbox

### Command Execution

- `POST /api/sandbox/sandboxes/:sandboxId/exec`: Execute a command in the sandbox

### Credential Management

- `POST /api/sandbox/sandboxes/:sandboxId/credentials`: Store credentials for a website
- `GET /api/sandbox/sandboxes/:sandboxId/credentials`: Get credentials for a website
- `GET /api/sandbox/sandboxes/:sandboxId/credentials/list`: List all websites with stored credentials

### Browser Operations

- `POST /api/sandbox/sandboxes/:sandboxId/browser`: Create a browser instance
- `POST /api/sandbox/sandboxes/:sandboxId/browser/navigate`: Navigate to a URL
- `POST /api/sandbox/sandboxes/:sandboxId/browser/form`: Submit a form
- `POST /api/sandbox/sandboxes/:sandboxId/browser/login`: Login to a website
- `POST /api/sandbox/sandboxes/:sandboxId/browser/download`: Download a file

## Usage Examples

### Storing Website Credentials

```javascript
// Store credentials for a website
await axios.post(
  `/api/sandbox/sandboxes/${sandboxId}/credentials`,
  {
    website: 'example.com',
    username: 'user@example.com',
    password: 'securepassword'
  }
);
```

### Authenticating with a Website

```javascript
// Login to a website using stored credentials
await axios.post(
  `/api/sandbox/sandboxes/${sandboxId}/browser/login`,
  {
    url: 'https://example.com/login',
    usernameField: 'email',
    passwordField: 'password'
  }
);
```

### Performing Authenticated Actions

```javascript
// First login to the website
await axios.post(
  `/api/sandbox/sandboxes/${sandboxId}/browser/login`,
  {
    url: 'https://example.com/login'
  }
);

// Then navigate to a protected page
await axios.post(
  `/api/sandbox/sandboxes/${sandboxId}/browser/navigate`,
  {
    url: 'https://example.com/dashboard'
  }
);

// Download a file that requires authentication
await axios.post(
  `/api/sandbox/sandboxes/${sandboxId}/browser/download`,
  {
    url: 'https://example.com/protected-file.pdf',
    filePath: 'downloads/file.pdf'
  }
);
```
