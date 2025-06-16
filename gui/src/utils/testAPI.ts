// Test script for ADK Agent-to-Agent API integration
import {
  discoverAgents,
  sendAgentMessage,
  getAgentTask,
  updateAgentCapabilities
} from './api';

export async function testADKIntegration() {
  try {
    console.log('Testing ADK Agent-to-Agent API integration...');

    // Test agent discovery
    console.log('\nTesting discoverAgents():');
    const agents = await discoverAgents();
    console.log('Discovered agents:', agents);

    if (agents.length > 0) {
      const testAgentId = agents[0].id;

      // Test sending message
      console.log('\nTesting sendAgentMessage():');
      const message = await sendAgentMessage(
        testAgentId,
        'Test message from integration test',
        { test: true }
      );
      console.log('Message sent:', message);

      // Test getting task (if available)
      if (message.metadata?.task_id) {
        console.log('\nTesting getAgentTask():');
        const task = await getAgentTask(message.metadata.task_id);
        console.log('Task retrieved:', task);
      }

      // Test updating capabilities
      console.log('\nTesting updateAgentCapabilities():');
      const capabilities = await updateAgentCapabilities(
        testAgentId,
        ['test-capability']
      );
      console.log('Capabilities updated:', capabilities);
    }

    console.log('\nADK API integration tests completed successfully');
  } catch (error) {
    console.error('ADK API integration test failed:', error);
  }
}

// Run tests when imported
testADKIntegration();