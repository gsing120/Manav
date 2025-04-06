// Test script for Gemini API integration
import axios from 'axios';

// Gemini API key from the user's requirements
const GEMINI_API_KEY = 'AIzaSyAzzjOYjYXzdJIuGYadyvPi_p1Co-eJzzI';

// Test the Gemini API directly
async function testGeminiAPIDirectly() {
  console.log('Testing Gemini API directly...');
  
  try {
    // First, check if the API key is valid by listing available models
    const modelsResponse = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    console.log('Available models:');
    console.log(modelsResponse.data);
    
    // Test generating content with Gemini
    const generateResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: "Hello, I'm testing the Manus Twin application with Gemini integration. Please respond with a brief greeting."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      }
    );
    
    console.log('\nGemini API direct test response:');
    console.log(JSON.stringify(generateResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error testing Gemini API directly:', error.response?.data || error.message);
    return false;
  }
}

// Test the Gemini API through our application
async function testGeminiAPIThroughApp() {
  console.log('\nTesting Gemini API through Manus Twin application...');
  
  try {
    // 1. Set the API key in our application
    await axios.post('http://localhost:3000/api/management/keys', {
      provider: 'google',
      apiKey: GEMINI_API_KEY
    });
    
    console.log('API key set in application');
    
    // 2. Create a conversation
    const conversationResponse = await axios.post('http://localhost:3000/api/integration/conversations', {
      initialMessages: []
    });
    
    const conversationId = conversationResponse.data.conversationId;
    console.log(`Conversation created with ID: ${conversationId}`);
    
    // 3. Send a message using Gemini
    const messageResponse = await axios.post('http://localhost:3000/api/integration/messages', {
      conversationId,
      message: "Hello, I'm testing the Manus Twin application with Gemini integration. Please respond with a brief greeting.",
      modelId: 'gemini-pro',
      options: {}
    });
    
    console.log('\nGemini API through app test response:');
    console.log(JSON.stringify(messageResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error testing Gemini API through app:', error.response?.data || error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting Gemini API integration tests...');
  
  // Test directly first
  const directTestResult = await testGeminiAPIDirectly();
  
  if (directTestResult) {
    console.log('\n✅ Direct Gemini API test successful');
  } else {
    console.log('\n❌ Direct Gemini API test failed');
    return;
  }
  
  // Then test through our application
  const appTestResult = await testGeminiAPIThroughApp();
  
  if (appTestResult) {
    console.log('\n✅ Gemini API through app test successful');
  } else {
    console.log('\n❌ Gemini API through app test failed');
  }
  
  console.log('\nTests completed.');
}

// Execute the tests
runTests();
