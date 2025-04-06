import axios from 'axios';

/**
 * Test runner for the Manus Twin application
 * This script runs a series of tests to verify all components are working correctly
 */

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const GEMINI_API_KEY = 'AIzaSyAzzjOYjYXzdJIuGYadyvPi_p1Co-eJzzI';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

/**
 * Run a test and log the result
 */
async function runTest(name, testFn) {
  console.log(`\n----- Running test: ${name} -----`);
  testResults.total++;
  
  try {
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
    return true;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    testResults.failed++;
    return false;
  }
}

/**
 * Test system initialization
 */
async function testSystemInitialization() {
  const response = await axios.post(`${API_BASE_URL}/system/initialize`);
  
  if (!response.data.success) {
    throw new Error(`System initialization failed: ${response.data.message}`);
  }
  
  // Verify system status
  const statusResponse = await axios.get(`${API_BASE_URL}/system/status`);
  
  if (!statusResponse.data.initialized) {
    throw new Error('System status reports not initialized after initialization');
  }
  
  console.log('System initialized successfully');
}

/**
 * Test API key management
 */
async function testApiKeyManagement() {
  // Add Gemini API key
  const addResponse = await axios.post(`${API_BASE_URL}/apiManagement/keys`, {
    provider: 'gemini',
    key: GEMINI_API_KEY
  });
  
  if (!addResponse.data.success) {
    throw new Error(`Failed to add API key: ${addResponse.data.message}`);
  }
  
  // Verify API key
  const verifyResponse = await axios.post(`${API_BASE_URL}/apiManagement/verify`, {
    provider: 'gemini',
    key: GEMINI_API_KEY
  });
  
  if (!verifyResponse.data.valid) {
    throw new Error('API key verification failed');
  }
  
  console.log('API key management working correctly');
}

/**
 * Test model integration
 */
async function testModelIntegration() {
  // Get available models
  const modelsResponse = await axios.get(`${API_BASE_URL}/models`);
  
  if (!modelsResponse.data || !Array.isArray(modelsResponse.data) || modelsResponse.data.length === 0) {
    throw new Error('No models available');
  }
  
  // Test simple completion with Gemini
  const completionResponse = await axios.post(`${API_BASE_URL}/integration/complete`, {
    model: 'gemini-1.5-flash',
    prompt: 'Hello, my name is',
    maxTokens: 50
  });
  
  if (!completionResponse.data.success || !completionResponse.data.completion) {
    throw new Error('Model completion failed');
  }
  
  console.log(`Model completion result: "${completionResponse.data.completion.substring(0, 50)}..."`);
}

/**
 * Test enhanced sandbox
 */
async function testEnhancedSandbox() {
  // Test shell command execution
  const shellResponse = await axios.post(`${API_BASE_URL}/enhancedSandbox/shell`, {
    command: 'echo "Hello from sandbox"'
  });
  
  if (!shellResponse.data.success || !shellResponse.data.output.includes('Hello from sandbox')) {
    throw new Error('Sandbox shell execution failed');
  }
  
  // Test internet access
  const internetResponse = await axios.post(`${API_BASE_URL}/enhancedSandbox/fetch`, {
    url: 'https://httpbin.org/get'
  });
  
  if (!internetResponse.data.success) {
    throw new Error('Sandbox internet access failed');
  }
  
  console.log('Enhanced sandbox working correctly');
}

/**
 * Test multimodal understanding
 */
async function testMultimodalUnderstanding() {
  // This would normally use a real image, but for testing we'll use a placeholder
  const imageResponse = await axios.post(`${API_BASE_URL}/multimodal/analyze`, {
    imageUrl: 'https://via.placeholder.com/150',
    analysisType: 'description'
  });
  
  if (!imageResponse.data.success) {
    throw new Error('Multimodal image analysis failed');
  }
  
  console.log('Multimodal understanding working correctly');
}

/**
 * Test advanced reasoning
 */
async function testAdvancedReasoning() {
  const reasoningResponse = await axios.post(`${API_BASE_URL}/reasoning/solve`, {
    problem: 'If a train travels at 60 mph, how long will it take to travel 150 miles?',
    reasoningType: 'step-by-step'
  });
  
  if (!reasoningResponse.data.success || !reasoningResponse.data.solution) {
    throw new Error('Advanced reasoning failed');
  }
  
  console.log('Advanced reasoning working correctly');
}

/**
 * Test real-time learning
 */
async function testRealTimeLearning() {
  // Add feedback
  const feedbackResponse = await axios.post(`${API_BASE_URL}/learning/feedback`, {
    sessionId: 'test-session',
    feedback: 'This response was very helpful',
    rating: 5
  });
  
  if (!feedbackResponse.data.success) {
    throw new Error('Learning feedback submission failed');
  }
  
  console.log('Real-time learning working correctly');
}

/**
 * Test contextual awareness
 */
async function testContextualAwareness() {
  // Add context
  const contextResponse = await axios.post(`${API_BASE_URL}/context/add`, {
    type: 'user_preference',
    data: {
      theme: 'dark',
      language: 'English'
    }
  });
  
  if (!contextResponse.data.success) {
    throw new Error('Context addition failed');
  }
  
  // Retrieve context
  const retrieveResponse = await axios.get(`${API_BASE_URL}/context/get?type=user_preference`);
  
  if (!retrieveResponse.data.success || !retrieveResponse.data.context || retrieveResponse.data.context.theme !== 'dark') {
    throw new Error('Context retrieval failed');
  }
  
  console.log('Contextual awareness working correctly');
}

/**
 * Test specialized capabilities
 */
async function testSpecializedCapabilities() {
  // Test code generation
  const codeResponse = await axios.post(`${API_BASE_URL}/specialized/code`, {
    language: 'python',
    requirements: 'Create a function that calculates the factorial of a number'
  });
  
  if (!codeResponse.data.success || !codeResponse.data.result || !codeResponse.data.result.code) {
    throw new Error('Code generation failed');
  }
  
  console.log('Specialized capabilities working correctly');
}

/**
 * Test memory module
 */
async function testMemoryModule() {
  // Store memory
  const storeResponse = await axios.post(`${API_BASE_URL}/memory/store`, {
    key: 'test-memory',
    value: 'This is a test memory',
    ttl: 3600 // 1 hour
  });
  
  if (!storeResponse.data.success) {
    throw new Error('Memory storage failed');
  }
  
  // Retrieve memory
  const retrieveResponse = await axios.get(`${API_BASE_URL}/memory/retrieve?key=test-memory`);
  
  if (!retrieveResponse.data.success || retrieveResponse.data.value !== 'This is a test memory') {
    throw new Error('Memory retrieval failed');
  }
  
  console.log('Memory module working correctly');
}

/**
 * Test knowledge system
 */
async function testKnowledgeSystem() {
  // Add knowledge
  const addResponse = await axios.post(`${API_BASE_URL}/knowledge/add`, {
    name: 'test_knowledge',
    content: 'This is test knowledge content',
    use_when: 'When testing the knowledge system'
  });
  
  if (!addResponse.data.success) {
    throw new Error('Knowledge addition failed');
  }
  
  // Retrieve knowledge
  const retrieveResponse = await axios.get(`${API_BASE_URL}/knowledge/get?id=test_knowledge`);
  
  if (!retrieveResponse.data.success || !retrieveResponse.data.knowledge || retrieveResponse.data.knowledge.content !== 'This is test knowledge content') {
    throw new Error('Knowledge retrieval failed');
  }
  
  console.log('Knowledge system working correctly');
}

/**
 * Test workflow engine
 */
async function testWorkflowEngine() {
  const workflowResponse = await axios.post(`${API_BASE_URL}/workflow/execute`, {
    steps: [
      {
        type: 'model',
        action: 'complete',
        params: {
          model: 'gemini-1.5-flash',
          prompt: 'Write a haiku about testing',
          maxTokens: 50
        }
      },
      {
        type: 'memory',
        action: 'store',
        params: {
          key: 'haiku',
          ttl: 3600
        },
        useResultFrom: 0
      }
    ]
  });
  
  if (!workflowResponse.data.success || !workflowResponse.data.results || workflowResponse.data.results.length !== 2) {
    throw new Error('Workflow execution failed');
  }
  
  console.log('Workflow engine working correctly');
}

/**
 * Test system integration
 */
async function testSystemIntegration() {
  // Test system optimization
  const optimizeResponse = await axios.post(`${API_BASE_URL}/system/optimize`);
  
  if (!optimizeResponse.data.success) {
    throw new Error('System optimization failed');
  }
  
  console.log('System integration working correctly');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting Manus Twin application tests...');
  
  await runTest('System Initialization', testSystemInitialization);
  await runTest('API Key Management', testApiKeyManagement);
  await runTest('Model Integration', testModelIntegration);
  await runTest('Enhanced Sandbox', testEnhancedSandbox);
  await runTest('Multimodal Understanding', testMultimodalUnderstanding);
  await runTest('Advanced Reasoning', testAdvancedReasoning);
  await runTest('Real-time Learning', testRealTimeLearning);
  await runTest('Contextual Awareness', testContextualAwareness);
  await runTest('Specialized Capabilities', testSpecializedCapabilities);
  await runTest('Memory Module', testMemoryModule);
  await runTest('Knowledge System', testKnowledgeSystem);
  await runTest('Workflow Engine', testWorkflowEngine);
  await runTest('System Integration', testSystemIntegration);
  
  // Print test summary
  console.log('\n----- Test Summary -----');
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n✅ All tests passed! The Manus Twin application is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs for details.');
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('Test runner error:', error);
});
