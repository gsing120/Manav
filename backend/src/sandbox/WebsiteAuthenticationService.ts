import { EnhancedVirtualLinuxSandbox } from '../sandbox/EnhancedVirtualLinuxSandbox';

/**
 * WebsiteAuthenticationService provides methods for authenticating with websites
 * using stored credentials in the enhanced sandbox environment
 */
export class WebsiteAuthenticationService {
  private sandbox: EnhancedVirtualLinuxSandbox;
  
  constructor() {
    this.sandbox = new EnhancedVirtualLinuxSandbox();
  }
  
  /**
   * Authenticate with a website using stored credentials
   * 
   * @param sandboxId The ID of the sandbox to use
   * @param website The website URL to authenticate with
   * @param loginFormSelector Optional CSS selector for the login form
   * @param usernameField Optional name of the username field
   * @param passwordField Optional name of the password field
   * @param submitButtonSelector Optional CSS selector for the submit button
   * @returns Result of the authentication attempt
   */
  async authenticateWithWebsite(
    sandboxId: string,
    website: string,
    loginFormSelector?: string,
    usernameField?: string,
    passwordField?: string,
    submitButtonSelector?: string
  ): Promise<AuthenticationResult> {
    try {
      // Get the sandbox instance
      const sandboxInstance = this.sandbox.getSandbox(sandboxId);
      
      if (!sandboxInstance) {
        return {
          success: false,
          error: `Sandbox with ID ${sandboxId} not found`
        };
      }
      
      // Get or create browser instance
      let browser = sandboxInstance.getBrowserInstance();
      if (!browser) {
        browser = sandboxInstance.createBrowserInstance();
      }
      
      // Check if we have credentials for this website
      const credentials = sandboxInstance.getCredentials(website);
      
      if (!credentials) {
        return {
          success: false,
          error: `No credentials found for ${website}`
        };
      }
      
      // Login to the website
      const response = await browser.loginToWebsite(
        website,
        usernameField || 'username',
        passwordField || 'password',
        submitButtonSelector || ''
      );
      
      // Check if login was successful
      const success = !response.error && response.status >= 200 && response.status < 400;
      
      // Return result
      return {
        success,
        url: response.url,
        status: response.status,
        error: response.error
      };
    } catch (error) {
      console.error(`Error authenticating with website ${website}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Store credentials for a website
   * 
   * @param sandboxId The ID of the sandbox to use
   * @param website The website URL
   * @param username The username
   * @param password The password
   * @returns Whether the credentials were stored successfully
   */
  storeWebsiteCredentials(
    sandboxId: string,
    website: string,
    username: string,
    password: string
  ): boolean {
    try {
      // Get the sandbox instance
      const sandboxInstance = this.sandbox.getSandbox(sandboxId);
      
      if (!sandboxInstance) {
        return false;
      }
      
      // Store credentials
      return sandboxInstance.storeCredentials(website, username, password);
    } catch (error) {
      console.error(`Error storing credentials for website ${website}:`, error);
      return false;
    }
  }
  
  /**
   * Get credentials for a website
   * 
   * @param sandboxId The ID of the sandbox to use
   * @param website The website URL
   * @returns The stored credentials, or null if none exist
   */
  getWebsiteCredentials(
    sandboxId: string,
    website: string
  ): Credential | null {
    try {
      // Get the sandbox instance
      const sandboxInstance = this.sandbox.getSandbox(sandboxId);
      
      if (!sandboxInstance) {
        return null;
      }
      
      // Get credentials
      return sandboxInstance.getCredentials(website);
    } catch (error) {
      console.error(`Error getting credentials for website ${website}:`, error);
      return null;
    }
  }
  
  /**
   * List all websites with stored credentials
   * 
   * @param sandboxId The ID of the sandbox to use
   * @returns Array of website URLs with stored credentials
   */
  listWebsitesWithCredentials(sandboxId: string): string[] {
    try {
      // Get the sandbox instance
      const sandboxInstance = this.sandbox.getSandbox(sandboxId);
      
      if (!sandboxInstance) {
        return [];
      }
      
      // List credentials
      return sandboxInstance.listCredentials();
    } catch (error) {
      console.error(`Error listing websites with credentials:`, error);
      return [];
    }
  }
  
  /**
   * Perform an authenticated action on a website
   * 
   * @param sandboxId The ID of the sandbox to use
   * @param website The website URL
   * @param action The action to perform (navigate, submit form, etc.)
   * @param actionParams Parameters for the action
   * @returns Result of the action
   */
  async performAuthenticatedAction(
    sandboxId: string,
    website: string,
    action: 'navigate' | 'submitForm' | 'downloadFile',
    actionParams: any
  ): Promise<AuthenticatedActionResult> {
    try {
      // Get the sandbox instance
      const sandboxInstance = this.sandbox.getSandbox(sandboxId);
      
      if (!sandboxInstance) {
        return {
          success: false,
          error: `Sandbox with ID ${sandboxId} not found`
        };
      }
      
      // Get or create browser instance
      let browser = sandboxInstance.getBrowserInstance();
      if (!browser) {
        browser = sandboxInstance.createBrowserInstance();
      }
      
      // First authenticate with the website
      const authResult = await this.authenticateWithWebsite(sandboxId, website);
      
      if (!authResult.success) {
        return {
          success: false,
          error: `Authentication failed: ${authResult.error}`
        };
      }
      
      // Perform the requested action
      let actionResult;
      
      switch (action) {
        case 'navigate':
          actionResult = await browser.navigateTo(actionParams.url);
          break;
          
        case 'submitForm':
          actionResult = await browser.submitForm(
            actionParams.url,
            actionParams.formData,
            actionParams.method
          );
          break;
          
        case 'downloadFile':
          const filePath = await browser.downloadFile(
            actionParams.url,
            actionParams.filePath
          );
          actionResult = { filePath };
          break;
          
        default:
          return {
            success: false,
            error: `Unknown action: ${action}`
          };
      }
      
      // Return result
      return {
        success: true,
        result: actionResult
      };
    } catch (error) {
      console.error(`Error performing authenticated action on website ${website}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Result of an authentication attempt
 */
export interface AuthenticationResult {
  success: boolean;
  url?: string;
  status?: number;
  error?: string;
}

/**
 * Result of an authenticated action
 */
export interface AuthenticatedActionResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Credential for a website
 */
export interface Credential {
  username: string;
  password: string;
}
