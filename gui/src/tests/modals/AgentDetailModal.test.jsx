import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentDetailModal from '../../components/modals/AgentDetailModal';

describe('AgentDetailModal', () => {
  const mockOnClose = jest.fn();
  const mockOnDeploy = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnConfigure = jest.fn();
  
  const mockAgent = {
    id: 1,
    name: 'Test Agent',
    collection: 'Test Collection',
    image: 'https://example.com/image.jpg',
    status: 'active',
    currentTarget: 'Test Target',
    capability: 'Test Capability',
    deployedSince: '2 hours ago',
    totalInferences: 247,
    successRate: 98.7,
    lastActivity: '2 minutes ago',
    capabilities: ['Test Capability 1', 'Test Capability 2'],
    targetTypes: ['Test Target Type 1', 'Test Target Type 2'],
    createdAt: '2023-12-15T10:30:00Z',
    owner: 'Test Owner'
  };
  
  const renderModal = (isOpen = true, agent = mockAgent) => {
    return render(
      <AgentDetailModal 
        isOpen={isOpen} 
        onClose={mockOnClose} 
        agent={agent} 
        onDeploy={mockOnDeploy}
        onStop={mockOnStop}
        onConfigure={mockOnConfigure}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should not render when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText(mockAgent.name)).not.toBeInTheDocument();
  });

  test('should not render when agent is null', () => {
    renderModal(true, null);
    expect(screen.queryByText('Agent Information')).not.toBeInTheDocument();
  });

  test('should render with agent information when isOpen is true and agent is provided', () => {
    renderModal();
    
    // Initially should show loading state
    expect(screen.getByText('Loading agent details...')).toBeInTheDocument();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Should now show agent information
    expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.collection)).toBeInTheDocument();
    expect(screen.getByText('Agent Information')).toBeInTheDocument();
  });

  test('should show tabs and allow switching between them', async () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Default tab should be Overview
    expect(screen.getByText('Agent Information')).toBeInTheDocument();
    
    // Click on Activity tab
    fireEvent.click(screen.getByText('Activity'));
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    
    // Click on Performance tab
    fireEvent.click(screen.getByText('Performance'));
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    
    // Click back to Overview tab
    fireEvent.click(screen.getByText('Overview'));
    expect(screen.getByText('Agent Information')).toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should call onDeploy when deploy button is clicked', () => {
    // Render with idle agent
    const idleAgent = { ...mockAgent, status: 'idle', currentTarget: null, capability: null, deployedSince: null };
    renderModal(true, idleAgent);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Find and click the Deploy button
    fireEvent.click(screen.getByText('Deploy Agent'));
    expect(mockOnDeploy).toHaveBeenCalledTimes(1);
    expect(mockOnDeploy).toHaveBeenCalledWith(idleAgent);
  });

  test('should call onStop when stop button is clicked', () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Find and click the Stop button
    fireEvent.click(screen.getByText('Stop Agent'));
    expect(mockOnStop).toHaveBeenCalledTimes(1);
    expect(mockOnStop).toHaveBeenCalledWith(mockAgent);
  });

  test('should call onConfigure when configure button is clicked', () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Find and click the Configure button
    fireEvent.click(screen.getByText('Configure'));
    expect(mockOnConfigure).toHaveBeenCalledTimes(1);
    expect(mockOnConfigure).toHaveBeenCalledWith(mockAgent);
  });

  test('should display activity data in the Activity tab', () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Switch to Activity tab
    fireEvent.click(screen.getByText('Activity'));
    
    // Should show activity table with headers
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    
    // Should show activity data (mocked)
    expect(screen.getByText('Extracted 247 data points from target website')).toBeInTheDocument();
  });

  test('should display performance metrics in the Performance tab', () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Switch to Performance tab
    fireEvent.click(screen.getByText('Performance'));
    
    // Should show performance metrics
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Daily Usage')).toBeInTheDocument();
    
    // Should show detailed metrics section
    expect(screen.getByText('Detailed Metrics')).toBeInTheDocument();
    expect(screen.getByText('Total Inferences')).toBeInTheDocument();
    
    // Should show usage by target section
    expect(screen.getByText('Usage by Target')).toBeInTheDocument();
  });

  test('should display capabilities and target types in the Overview tab', () => {
    renderModal();
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    // Should show capabilities section
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
    mockAgent.capabilities.forEach(capability => {
      expect(screen.getByText(capability)).toBeInTheDocument();
    });
    
    // Should show target types section
    expect(screen.getByText('Target Types')).toBeInTheDocument();
    mockAgent.targetTypes.forEach(targetType => {
      expect(screen.getByText(targetType)).toBeInTheDocument();
    });
  });
});