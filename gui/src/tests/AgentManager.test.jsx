import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AgentManager } from '../components/AgentManager';

// Mock the modal components
jest.mock('../components/modals/AgentCreationModal', () => {
  return jest.fn(({ isOpen, onClose, onAgentCreated }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="agent-creation-modal">
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onAgentCreated({ 
          name: 'New Test Agent', 
          collection: 'Test Collection',
          status: 'idle',
          capabilities: ['Test Capability'],
          targetTypes: ['Test Target']
        })}>
          Create Agent
        </button>
      </div>
    );
  });
});

jest.mock('../components/modals/AgentDeploymentModal', () => {
  return jest.fn(({ isOpen, onClose, agent, onAgentDeployed }) => {
    if (!isOpen || !agent) return null;
    return (
      <div data-testid="agent-deployment-modal">
        <div>Deploying: {agent.name}</div>
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onAgentDeployed({
          ...agent,
          status: 'active',
          currentTarget: 'Test Target',
          capability: 'Test Capability',
          deployedSince: 'just now'
        })}>
          Deploy
        </button>
      </div>
    );
  });
});

jest.mock('../components/modals/AgentConfigModal', () => {
  return jest.fn(({ isOpen, onClose, agent, onAgentUpdated }) => {
    if (!isOpen || !agent) return null;
    return (
      <div data-testid="agent-config-modal">
        <div>Configuring: {agent.name}</div>
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onAgentUpdated({
          ...agent,
          name: 'Updated ' + agent.name
        })}>
          Update
        </button>
      </div>
    );
  });
});

describe('AgentManager', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AgentManager />
      </BrowserRouter>
    );
  };

  test('should render the component with initial agents', () => {
    renderComponent();
    expect(screen.getByText('NFT-Agent Manager')).toBeInTheDocument();
    expect(screen.getByText('CyberPunk Agent #7804')).toBeInTheDocument();
    expect(screen.getByText('Data Miner #3749')).toBeInTheDocument();
  });

  test('should filter agents based on search term', () => {
    renderComponent();
    
    // Initially all agents should be visible
    expect(screen.getByText('CyberPunk Agent #7804')).toBeInTheDocument();
    expect(screen.getByText('Data Miner #3749')).toBeInTheDocument();
    
    // Search for "CyberPunk"
    fireEvent.change(screen.getByPlaceholderText('Search agents...'), {
      target: { value: 'CyberPunk' }
    });
    
    // Only CyberPunk agent should be visible
    expect(screen.getByText('CyberPunk Agent #7804')).toBeInTheDocument();
    expect(screen.queryByText('Data Miner #3749')).not.toBeInTheDocument();
  });

  test('should filter agents based on category', () => {
    renderComponent();
    
    // Initially all agents should be visible
    expect(screen.getByText('CyberPunk Agent #7804')).toBeInTheDocument();
    expect(screen.getByText('System Monitor #4523')).toBeInTheDocument();
    
    // Filter by "maintenance" category
    fireEvent.click(screen.getByText('Maintenance'));
    
    // Only maintenance agents should be visible
    expect(screen.queryByText('CyberPunk Agent #7804')).not.toBeInTheDocument();
    expect(screen.getByText('System Monitor #4523')).toBeInTheDocument();
  });

  test('should toggle between grid and list view', () => {
    renderComponent();
    
    // Default view should be grid
    expect(screen.getAllByText('Deploy').length).toBeGreaterThan(0);
    
    // Switch to list view
    fireEvent.click(screen.getByRole('button', { name: /list/i }));
    
    // List view should show table headers
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Current Target')).toBeInTheDocument();
    
    // Switch back to grid view
    fireEvent.click(screen.getByRole('button', { name: /grid/i }));
    
    // Grid view should show cards with Deploy buttons
    expect(screen.getAllByText('Deploy').length).toBeGreaterThan(0);
  });

  test('should open agent creation modal when Create Agent button is clicked', () => {
    renderComponent();
    
    // Click Create Agent button
    fireEvent.click(screen.getByText('Create Agent'));
    
    // Modal should be open
    expect(screen.getByTestId('agent-creation-modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('agent-creation-modal')).not.toBeInTheDocument();
  });

  test('should add a new agent when created through the modal', async () => {
    renderComponent();
    
    // Initial agent count
    const initialAgentCount = screen.getAllByText(/Agent #|Miner #|Monitor #|Processor #|Reviewer #|Guardian #/i).length;
    
    // Open creation modal
    fireEvent.click(screen.getByText('Create Agent'));
    
    // Create a new agent
    fireEvent.click(screen.getByText('Create Agent'));
    
    // Wait for the new agent to be added
    await waitFor(() => {
      const newAgentCount = screen.getAllByText(/Agent #|Miner #|Monitor #|Processor #|Reviewer #|Guardian #|New Test Agent/i).length;
      expect(newAgentCount).toBe(initialAgentCount + 1);
    });
    
    // Verify the new agent is in the list
    expect(screen.getByText('New Test Agent')).toBeInTheDocument();
  });

  test('should open deployment modal when Deploy button is clicked', () => {
    renderComponent();
    
    // Find an idle agent and click its Deploy button
    const deployButtons = screen.getAllByText('Deploy');
    fireEvent.click(deployButtons[0]);
    
    // Deployment modal should be open
    expect(screen.getByTestId('agent-deployment-modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('agent-deployment-modal')).not.toBeInTheDocument();
  });

  test('should update agent status when deployed through the modal', async () => {
    renderComponent();
    
    // Find an idle agent and click its Deploy button
    const deployButtons = screen.getAllByText('Deploy');
    fireEvent.click(deployButtons[0]);
    
    // Deploy the agent
    fireEvent.click(screen.getByText('Deploy'));
    
    // Wait for the agent to be updated
    await waitFor(() => {
      // The Stop button should now be visible for this agent
      expect(screen.getAllByText('Stop').length).toBeGreaterThan(0);
    });
  });

  test('should open configuration modal when Settings button is clicked', () => {
    renderComponent();
    
    // Find a Settings button and click it
    const settingsButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(settingsButtons[0]);
    
    // Config modal should be open
    expect(screen.getByTestId('agent-config-modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('agent-config-modal')).not.toBeInTheDocument();
  });

  test('should update agent when configured through the modal', async () => {
    renderComponent();
    
    // Find a Settings button and click it
    const settingsButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(settingsButtons[0]);
    
    // Update the agent
    fireEvent.click(screen.getByText('Update'));
    
    // Wait for the agent to be updated
    await waitFor(() => {
      expect(screen.getByText(/Updated CyberPunk Agent #7804|Updated Data Miner #3749/)).toBeInTheDocument();
    });
  });

  test('should stop an active agent when Stop button is clicked', async () => {
    renderComponent();
    
    // Find an active agent and click its Stop button
    const stopButtons = screen.getAllByText('Stop');
    const initialStopButtonCount = stopButtons.length;
    fireEvent.click(stopButtons[0]);
    
    // Wait for the agent to be stopped
    await waitFor(() => {
      // There should be one less Stop button
      const newStopButtonCount = screen.getAllByText('Stop').length;
      expect(newStopButtonCount).toBe(initialStopButtonCount - 1);
    });
  });
});