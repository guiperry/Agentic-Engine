import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentDeploymentModal from '../components/modals/AgentDeploymentModal';

describe('AgentDeploymentModal', () => {
  const mockOnClose = jest.fn();
  const mockOnAgentDeployed = jest.fn();
  
  const mockAgent = {
    id: 1,
    name: 'Test Agent',
    collection: 'Test Collection',
    image: 'https://example.com/image.jpg',
    status: 'idle',
    capabilities: ['Web Analysis', 'Data Extraction'],
    targetTypes: ['Browser', 'File System']
  };
  
  const renderModal = (isOpen = true, agent = mockAgent) => {
    return render(
      <AgentDeploymentModal 
        isOpen={isOpen} 
        onClose={mockOnClose} 
        agent={agent} 
        onAgentDeployed={mockOnAgentDeployed} 
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText('Deploy Agent')).not.toBeInTheDocument();
  });

  test('should not render when agent is null', () => {
    renderModal(true, null);
    expect(screen.queryByText('Deploy Agent')).not.toBeInTheDocument();
  });

  test('should render when isOpen is true and agent is provided', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: /Deploy Agent/i })).toBeInTheDocument();
    expect(screen.getByText('Select Target System')).toBeInTheDocument();
    expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
  });

  test('should call onClose when cancel button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should call onClose when X button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should show validation errors when trying to deploy without selecting target and capability', async () => {
    renderModal();
    
    // Try to deploy without selecting target and capability
    fireEvent.click(screen.getByRole('button', { name: /Deploy Agent/i }));
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText('Please select a target system')).toBeInTheDocument();
      expect(screen.getByText('Please select a capability')).toBeInTheDocument();
    });
    
    // Ensure onAgentDeployed was not called
    expect(mockOnAgentDeployed).not.toHaveBeenCalled();
  });

  test('should successfully deploy agent when target and capability are selected', async () => {
    renderModal();
    
    // Select a target system
    const targets = screen.getAllByText(/Chrome Browser|Local File System/i);
    fireEvent.click(targets[0]);
    
    // Wait for capabilities to load based on selected target
    await waitFor(() => {
      expect(screen.getByText('Select Capability')).toBeInTheDocument();
    });
    
    // Select a capability
    const capabilities = screen.getAllByText(/Web Analysis|Data Extraction/i);
    fireEvent.click(capabilities[0]);
    
    // Verify deployment summary appears
    await waitFor(() => {
      expect(screen.getByText('Deployment Summary')).toBeInTheDocument();
    });
    
    // Deploy the agent
    fireEvent.click(screen.getByRole('button', { name: /Deploy Agent/i }));
    
    // Verify deployment status updates
    await waitFor(() => {
      expect(screen.getByText('Deploying Agent...')).toBeInTheDocument();
    });
    
    // Wait for success message and callback
    await waitFor(() => {
      expect(screen.getByText('Deployment Successful!')).toBeInTheDocument();
      expect(mockOnAgentDeployed).toHaveBeenCalledTimes(1);
      expect(mockOnAgentDeployed).toHaveBeenCalledWith(expect.objectContaining({
        id: mockAgent.id,
        status: 'active'
      }));
    });
  });

  test('should handle no compatible capabilities scenario', async () => {
    // Create an agent with capabilities that don't match any target
    const incompatibleAgent = {
      ...mockAgent,
      capabilities: ['Unique Capability That No Target Has']
    };
    
    renderModal(true, incompatibleAgent);
    
    // Select a target system
    const targets = screen.getAllByText(/Chrome Browser|Local File System/i);
    fireEvent.click(targets[0]);
    
    // Wait for no compatible capabilities message
    await waitFor(() => {
      expect(screen.getByText('No compatible capabilities')).toBeInTheDocument();
    });
  });
});