import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MCPCapabilityManager } from '../components/MCPCapabilityManager';

// Mock the modal components
jest.mock('../components/modals/MCPServerModal', () => {
  return jest.fn(({ isOpen, onClose, server, onServerSaved }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mcp-server-modal">
        <h2>{server ? 'Edit MCP Server' : 'Add MCP Server'}</h2>
        <div>Server: {server ? server.name : 'New Server'}</div>
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onServerSaved({
          id: server ? server.id : Date.now(),
          name: server ? `Updated ${server.name}` : 'New Test Server',
          type: server ? server.type : 'llm',
          status: 'connected',
          version: '1.0.0',
          lastSync: 'just now',
          description: 'Test description',
          endpoint: 'https://test.example.com',
          capabilities: server ? server.capabilities : [],
          health: {
            status: 'healthy',
            uptime: '100%',
            latency: '50ms',
            lastChecked: 'just now'
          },
          icon: () => <div>Icon</div>
        })}>
          Save Server
        </button>
      </div>
    );
  });
});

jest.mock('../components/modals/MCPCapabilityModal', () => {
  return jest.fn(({ isOpen, onClose, server, capability, onCapabilitySaved }) => {
    if (!isOpen || !server) return null;
    return (
      <div data-testid="mcp-capability-modal">
        <h2>{capability ? 'Edit Capability' : 'Add Capability'}</h2>
        <div>Server: {server.name}</div>
        <div>Capability: {capability ? capability.name : 'New Capability'}</div>
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onCapabilitySaved({
          id: capability ? capability.id : `test-${Date.now()}`,
          name: capability ? `Updated ${capability.name}` : 'New Test Capability',
          type: capability ? capability.type : 'text',
          status: 'active',
          serverId: server.id,
          serverName: server.name,
          serverStatus: server.status,
          serverType: server.type
        })}>
          Save Capability
        </button>
      </div>
    );
  });
});

describe('MCPCapabilityManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the component with initial servers and capabilities', () => {
    render(<MCPCapabilityManager />);
    expect(screen.getByRole('heading', { name: /MCP Server Manager/i })).toBeInTheDocument();
    expect(screen.getByText('OpenAI MCP Server')).toBeInTheDocument();
    expect(screen.getByText('Anthropic MCP Server')).toBeInTheDocument();
    expect(screen.getByText('GPT-4 Vision')).toBeInTheDocument();
  });

  test('should filter servers based on search term', () => {
    render(<MCPCapabilityManager />);
    
    // Initially all servers should be visible
    expect(screen.getByText('OpenAI MCP Server')).toBeInTheDocument();
    expect(screen.getByText('Anthropic MCP Server')).toBeInTheDocument();
    
    // Search for "OpenAI"
    fireEvent.change(screen.getByPlaceholderText('Search MCP servers...'), {
      target: { value: 'OpenAI' }
    });
    
    // Only OpenAI server should be visible
    expect(screen.getByText('OpenAI MCP Server')).toBeInTheDocument();
    expect(screen.queryByText('Anthropic MCP Server')).not.toBeInTheDocument();
  });

  test('should filter servers based on category', () => {
    render(<MCPCapabilityManager />);
    
    // Initially all servers should be visible
    expect(screen.getByText('OpenAI MCP Server')).toBeInTheDocument();
    expect(screen.getByText('Browser MCP Server')).toBeInTheDocument();
    
    // Filter by "tool" category
    fireEvent.click(screen.getByText('Tool Providers'));
    
    // Only Tool servers should be visible
    expect(screen.queryByText('OpenAI MCP Server')).not.toBeInTheDocument();
    expect(screen.getByText('Browser MCP Server')).toBeInTheDocument();
  });

  test('should open server modal when Add MCP Server button is clicked', () => {
    render(<MCPCapabilityManager />);
    
    // Click Add MCP Server button
    fireEvent.click(screen.getByText('Add MCP Server'));
    
    // Modal should be open
    expect(screen.getByTestId('mcp-server-modal')).toBeInTheDocument();
    expect(screen.getByText('Add MCP Server')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('mcp-server-modal')).not.toBeInTheDocument();
  });

  test('should open server modal with server data when Edit button is clicked', () => {
    render(<MCPCapabilityManager />);
    
    // Find the Settings button (Edit) for OpenAI MCP Server and click it
    const editButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(editButtons[0]); // First edit button should be for OpenAI MCP Server
    
    // Modal should be open with server data
    expect(screen.getByTestId('mcp-server-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit MCP Server')).toBeInTheDocument();
    expect(screen.getByText('Server: OpenAI MCP Server')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('mcp-server-modal')).not.toBeInTheDocument();
  });

  test('should add a new server when created through the modal', async () => {
    render(<MCPCapabilityManager />);
    
    // Initial server count
    const initialServerCount = screen.getAllByText(/MCP Server/).length;
    
    // Open creation modal
    fireEvent.click(screen.getByText('Add MCP Server'));
    
    // Create a new server
    fireEvent.click(screen.getByText('Save Server'));
    
    // Wait for the new server to be added
    await waitFor(() => {
      const newServerCount = screen.getAllByText(/MCP Server|New Test Server/).length;
      expect(newServerCount).toBe(initialServerCount + 1);
    });
    
    // Verify the new server is in the list
    expect(screen.getByText('New Test Server')).toBeInTheDocument();
  });

  test('should update an existing server when edited through the modal', async () => {
    render(<MCPCapabilityManager />);
    
    // Find the Settings button (Edit) for OpenAI MCP Server and click it
    const editButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(editButtons[0]); // First edit button should be for OpenAI MCP Server
    
    // Edit the server
    fireEvent.click(screen.getByText('Save Server'));
    
    // Wait for the server to be updated
    await waitFor(() => {
      expect(screen.getByText('Updated OpenAI MCP Server')).toBeInTheDocument();
    });
  });

  test('should open capability modal when Add button is clicked for capabilities', () => {
    render(<MCPCapabilityManager />);
    
    // Find the Add button for capabilities and click it
    const addButtons = screen.getAllByText('Add');
    fireEvent.click(addButtons[0]); // First add button should be for OpenAI MCP Server capabilities
    
    // Modal should be open
    expect(screen.getByTestId('mcp-capability-modal')).toBeInTheDocument();
    expect(screen.getByText('Add Capability')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('mcp-capability-modal')).not.toBeInTheDocument();
  });

  test('should open capability modal with capability data when clicked', () => {
    render(<MCPCapabilityManager />);
    
    // Find the GPT-4 Vision capability and click it using more specific selector
    const capabilityItem = screen.getAllByRole('button', { name: /capability/i }).find(
      btn => btn.textContent.includes('GPT-4 Vision')
    );
    fireEvent.click(capabilityItem);
    
    // Modal should be open with capability data
    expect(screen.getByTestId('mcp-capability-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Capability')).toBeInTheDocument();
    expect(screen.getByText('Capability: GPT-4 Vision')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('mcp-capability-modal')).not.toBeInTheDocument();
  });

  test('should add a new capability when created through the modal', async () => {
    render(<MCPCapabilityManager />);
    
    // Initial capability count for OpenAI server
    const initialCapabilityCount = screen.getAllByText(/GPT-4 Vision|CLIP Embeddings|DALL-E 3/).length;
    
    // Open capability creation modal
    const addButtons = screen.getAllByText('Add');
    fireEvent.click(addButtons[0]); // First add button should be for OpenAI MCP Server capabilities
    
    // Create a new capability
    fireEvent.click(screen.getByText('Save Capability'));
    
    // Wait for the new capability to be added
    await waitFor(() => {
      const newCapabilityCount = screen.getAllByText(/GPT-4 Vision|CLIP Embeddings|DALL-E 3|New Test Capability/).length;
      expect(newCapabilityCount).toBe(initialCapabilityCount + 1);
    });
    
    // Verify the new capability is in the list
    expect(screen.getByText('New Test Capability')).toBeInTheDocument();
  });

  test('should update an existing capability when edited through the modal', async () => {
    render(<MCPCapabilityManager />);
    
    // Find the GPT-4 Vision capability and click it
    fireEvent.click(screen.getByText('GPT-4 Vision'));
    
    // Edit the capability
    fireEvent.click(screen.getByText('Save Capability'));
    
    // Wait for the capability to be updated
    await waitFor(() => {
      expect(screen.getByText('Updated GPT-4 Vision')).toBeInTheDocument();
    });
  });

  test('should toggle server connection status when Connect/Disconnect button is clicked', async () => {
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
    
    render(<MCPCapabilityManager />);
    
    // Find a connected server using more specific selector
    const serverCards = screen.getAllByTestId('server-card');
    const openaiServer = serverCards.find(card =>
      card.textContent.includes('OpenAI MCP Server')
    );
    const disconnectButton = within(openaiServer).getByText('Disconnect');
    
    // Click Disconnect button
    fireEvent.click(disconnectButton);
    
    // Should show connecting state
    expect(screen.getByText('Disconnecting...')).toBeInTheDocument();
    
    // Fast-forward timers
    jest.advanceTimersByTime(1500);
    
    // Server should now be disconnected
    expect(within(openaiServer).getByText('disconnected')).toBeInTheDocument();
    expect(within(openaiServer).getByText('Connect')).toBeInTheDocument();
    
    // Click Connect button
    const connectButton = within(openaiServer).getByText('Connect');
    fireEvent.click(connectButton);
    
    // Should show connecting state
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    
    // Fast-forward timers
    jest.advanceTimersByTime(1500);
    
    // Server should now be connected again
    expect(within(openaiServer).getByText('connected')).toBeInTheDocument();
    expect(within(openaiServer).getByText('Disconnect')).toBeInTheDocument();
    
    // Restore timers
    jest.useRealTimers();
  });

  test('should refresh server when Refresh button is clicked', async () => {
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
    
    render(<MCPCapabilityManager />);
    
    // Find the Refresh button for OpenAI MCP Server and click it
    const serverCards = screen.getAllByTestId('server-card');
    const openaiServer = serverCards.find(card =>
      card.textContent.includes('OpenAI MCP Server')
    );
    const refreshButton = within(openaiServer).getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Should show refreshing state (spinner)
    expect(refreshButton.querySelector('svg')).toHaveClass('animate-spin');
    
    // Fast-forward timers (give more time for animation to complete)
    jest.advanceTimersByTime(1500);
    
    // Refresh should be complete
    expect(refreshButton.querySelector('svg')).not.toHaveClass('animate-spin');
    
    // Restore timers
    jest.useRealTimers();
  });
});