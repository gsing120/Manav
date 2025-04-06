import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test script for the enhanced sandbox features
 * 
 * This script tests:
 * 1. Creating a sandbox
 * 2. Storing website credentials
 * 3. Browsing the web
 * 4. Authenticating with websites
 * 5. Downloading files
 */
async function testEnhancedSandboxFeatures() {
  console.log('Testing Enhanced Sandbox Features');
  console.log('=================================');
  
  try {
    // Base URL for API
    const baseUrl = 'http://localhost:3000/api';
    
    // Step 1: Create a sandbox
    console.log('\n1. Creating a sandbox...');
    const createSandboxResponse = await axios.post(`${baseUrl}/sandbox/sandboxes`, {
      name: 'test-sandbox'
    });
    
    const sandboxId = createSandboxResponse.data.id;
    console.log(`Sandbox created with ID: ${sandboxId}`);
    
    // Step 2: Store website credentials
    console.log('\n2. Storing website credentials...');
    const storeCredentialsResponse = await axios.post(
      `${baseUrl}/sandbox/sandboxes/${sandboxId}/credentials`,
      {
        website: 'example.com',
        username: 'testuser',
        password: 'testpassword123'
      }
    );
    
    console.log('Credentials stored:', storeCredentialsResponse.data.success);
    
    // Step 3: List stored credentials
    console.log('\n3. Listing stored credentials...');
    const listCredentialsResponse = await axios.get(
      `${baseUrl}/sandbox/sandboxes/${sandboxId}/credentials/list`
    );
    
    console.log('Websites with stored credentials:', listCredentialsResponse.data.websites);
    
    // Step 4: Create a browser instance
    console.log('\n4. Creating a browser instance...');
    const createBrowserResponse = await axios.post(
      `${baseUrl}/sandbox/sandboxes/${sandboxId}/browser`
    );
    
    console.log('Browser instance created:', createBrowserResponse.data);
    
    // Step 5: Navigate to a website
    console.log('\n5. Navigating to a website...');
    const navigateResponse = await axios.post(
      `${baseUrl}/sandbox/sandboxes/${sandboxId}/browser/navigate`,
      {
        url: 'https://example.com'
      }
    );
    
    console.log(`Navigation status: ${navigateResponse.data.status}`);
    console.log(`Page title: ${extractTitle(navigateResponse.data.content)}`);
    
    // Step 6: Test login to a website
    console.log('\n6. Testing login to a website...');
    try {
      const loginResponse = await axios.post(
        `${baseUrl}/sandbox/sandboxes/${sandboxId}/browser/login`,
        {
          url: 'https://example.com',
          usernameField: 'username',
          passwordField: 'password'
        }
      );
      
      console.log('Login attempt result:', loginResponse.data);
    } catch (error) {
      console.log('Login test expected to fail on example.com (no login form):', error.message);
    }
    
    // Step 7: Download a file
    console.log('\n7. Downloading a file...');
    const downloadResponse = await axios.post(
      `${baseUrl}/sandbox/sandboxes/${sandboxId}/browser/download`,
      {
        url: 'https://example.com/favicon.ico',
        filePath: 'downloads/favicon.ico'
      }
    );
    
    console.log('File download result:', downloadResponse.data);
    
    // Step 8: Execute a command in the sandbox
    console.log('\n8. Executing a command in the sandbox...');
    const execResponse = await axios.post(
      `${baseUrl}/sandbox/sandboxes/${sandboxId}/exec`,
      {
        command: 'ls -la'
      }
    );
    
    console.log('Command execution result:');
    console.log(execResponse.data.output);
    
    console.log('\nAll tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Extract title from HTML content
 */
function extractTitle(htmlContent) {
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : 'No title found';
}

// Run the tests
testEnhancedSandboxFeatures();
