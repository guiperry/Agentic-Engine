import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the AgentCreationModal component
jest.mock('../components/modals/AgentCreationModal', () => {
  return jest.fn(({ isOpen, onClose, onAgentCreated }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="agent-creation-modal">
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onAgentCreated({ name: 'New Test Agent' })}>
          Create Agent
        </button>
      </div>
    );
  });
});

describe('Dashboard', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the dashboard with all sections', () => {
    renderDashboard();
    
    // Header
    expect(screen.getByText('Agent Command Center')).toBeInTheDocument();
    
    // Stats
    expect(screen.getByText('Active Agents')).toBeInTheDocument();
    expect(screen.getByText('Target Systems')).toBeInTheDocument();
    expect(screen.getByText('Inferences Today')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    
    // Recent Activity
    expect(screen.getByText('Recent Agent Activity')).toBeInTheDocument();
    
    // Target System Status
    expect(screen.getByText('Target System Status')).toBeInTheDocument();
    
    // Quick Actions
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Deploy New Agent')).toBeInTheDocument();
    expect(screen.getByText('Add Target System')).toBeInTheDocument();
    expect(screen.getByText('Install Capability')).toBeInTheDocument();
    expect(screen.getByText('Monitor Activity')).toBeInTheDocument();
  });

  test('should open agent creation modal when Deploy Agent button is clicked', () => {
    renderDashboard();
    
    // Click the Deploy Agent button in the header
    fireEvent.click(screen.getByText('Deploy Agent'));
    
    // Modal should be open
    expect(screen.getByTestId('agent-creation-modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('agent-creation-modal')).not.toBeInTheDocument();
  });

  test('should navigate to agents page when agent is created', () => {
    renderDashboard();
    
    // Open the modal
    fireEvent.click(screen.getByText('Deploy Agent'));
    
    // Create an agent
    fireEvent.click(screen.getByText('Create Agent'));
    
    // Should navigate to agents page
    expect(mockNavigate).toHaveBeenCalledWith('/agents');
  });

  test('should navigate to agents page when Deploy New Agent quick action is clicked', () => {
    renderDashboard();
    
    // Click the Deploy New Agent quick action
    fireEvent.click(screen.getByText('Deploy New Agent'));
    
    // Modal should be open
    expect(screen.getByTestId('agent-creation-modal')).toBeInTheDocument();
  });

  test('should navigate to targets page when Add Target System quick action is clicked', () => {
    renderDashboard();
    
    // Click the Add Target System quick action
    fireEvent.click(screen.getByText('Add Target System'));
    
    // Should navigate to targets page
    expect(mockNavigate).toHaveBeenCalledWith('/targets');
  });

  test('should navigate to capabilities page when Install Capability quick action is clicked', () => {
    renderDashboard();
    
    // Click the Install Capability quick action
    fireEvent.click(screen.getByText('Install Capability'));
    
    // Should navigate to capabilities page
    expect(mockNavigate).toHaveBeenCalledWith('/capabilities');
  });

  test('should navigate to orchestrator page when Monitor Activity quick action is clicked', () => {
    renderDashboard();
    
    // Click the Monitor Activity quick action
    fireEvent.click(screen.getByText('Monitor Activity'));
    
    // Should navigate to orchestrator page
    expect(mockNavigate).toHaveBeenCalledWith('/orchestrator');
  });

  test('should navigate to orchestrator page when View All button is clicked', () => {
    renderDashboard();
    
    // Click the View All button in Recent Agent Activity
    fireEvent.click(screen.getByText('View All'));
    
    // Should navigate to orchestrator page
    expect(mockNavigate).toHaveBeenCalledWith('/orchestrator');
  });
});