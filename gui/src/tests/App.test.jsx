import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the components
jest.mock('../components/Sidebar', () => ({
  Sidebar: jest.fn(({ activeView, setActiveView, isOpen, setIsOpen }) => (
    <div data-testid="sidebar">
      <button onClick={() => setActiveView('dashboard')}>Dashboard</button>
      <button onClick={() => setActiveView('agents')}>Agents</button>
      <button onClick={() => setIsOpen(false)}>Close Sidebar</button>
    </div>
  ))
}));

jest.mock('../components/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard Content</div>
}));

jest.mock('../components/AgentManager', () => ({
  AgentManager: () => <div data-testid="agent-manager">Agent Manager Content</div>
}));

jest.mock('../components/CapabilityStore', () => ({
  CapabilityStore: () => <div data-testid="capability-store">Capability Store Content</div>
}));

jest.mock('../components/TargetManager', () => ({
  TargetManager: () => <div data-testid="target-manager">Target Manager Content</div>
}));

jest.mock('../components/InferenceOrchestrator', () => ({
  InferenceOrchestrator: () => <div data-testid="inference-orchestrator">Inference Orchestrator Content</div>
}));

jest.mock('../components/Analytics', () => ({
  Analytics: () => <div data-testid="analytics">Analytics Content</div>
}));

jest.mock('../components/Settings', () => ({
  Settings: () => <div data-testid="settings">Settings Content</div>
}));

describe('App', () => {
  test('should render the App with Dashboard as default view', () => {
    render(<App />);
    
    // Sidebar should be rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Dashboard should be the default view
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('should navigate between views when sidebar links are clicked', () => {
    render(<App />);
    
    // Initially Dashboard should be visible
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    
    // Click Agents link
    fireEvent.click(screen.getByText('Agents'));
    
    // Agent Manager should now be visible
    expect(screen.getByTestId('agent-manager')).toBeInTheDocument();
    
    // Dashboard should no longer be visible
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  test('should toggle sidebar on mobile', () => {
    // Mock window.innerWidth to simulate mobile view
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(<App />);
    
    // Sidebar should be closed by default on mobile
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');
    
    // Click the mobile menu button to open sidebar
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    
    // Sidebar should now be open
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Click the close button to close sidebar
    fireEvent.click(screen.getByText('Close Sidebar'));
    
    // Sidebar should be closed again
    expect(sidebar).toHaveClass('-translate-x-full');
    
    // Reset window size
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });
});