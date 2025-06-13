import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebConnectionsManager } from '../components/WebConnectionsManager';

// Mock the modal components
jest.mock('../components/modals/WebConnectionModal', () => {
  return jest.fn(({ isOpen, onClose, connection, onConnectionSaved }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="web-connection-modal">
        <h2>{connection ? 'Edit Connection' : 'Add Connection'}</h2>
        <div>Connection: {connection ? connection.name : 'New Connection'}</div>
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onConnectionSaved({
          id: connection ? connection.id : Date.now(),
          name: connection ? `Updated ${connection.name}` : 'New Test Connection',
          type: connection ? connection.type : 'oauth',
          provider: connection ? connection.provider : 'Test Provider',
          status: 'inactive',
          description: 'Test description',
          icon: 'https://example.com/icon.png',
          lastUsed: 'Never',
          expiresAt: null,
          scopes: ['test:scope'],
          createdAt: new Date().toISOString(),
          createdBy: 'Test User',
          connectionDetails: {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            redirectUri: 'https://app.picaos.com/authkit/callback',
            tokenEndpoint: 'https://example.com/token',
            authEndpoint: 'https://example.com/auth'
          }
        })}>
          Save Connection
        </button>
      </div>
    );
  });
});

jest.mock('../components/modals/AdvancedFilterModal', () => {
  return jest.fn(({ isOpen, onClose, onApplyFilters, initialFilters, filterOptions }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="advanced-filter-modal">
        <div>Advanced Filters</div>
        <button onClick={() => onClose()}>Close</button>
        <button onClick={() => onApplyFilters([
          { id: 1, field: 'status', operator: 'equals', value: 'active' }
        ])}>
          Apply Filters
        </button>
      </div>
    );
  });
});

describe('WebConnectionsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should render the component with initial connections', () => {
    render(<WebConnectionsManager />);
    expect(screen.getByRole('heading', { name: /Web Connections/i })).toBeInTheDocument();
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  test('should filter connections based on search term', () => {
    render(<WebConnectionsManager />);
    
    // Initially all connections should be visible
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    
    // Search for "Google"
    fireEvent.change(screen.getByPlaceholderText('Search connections...'), {
      target: { value: 'Google' }
    });
    
    // Only Google Drive should be visible
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
  });

  test('should filter connections based on category', () => {
    render(<WebConnectionsManager />);
    
    // Initially all connections should be visible
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('Slack Workspace')).toBeInTheDocument();
    
    // Filter by "inactive" category
    fireEvent.click(screen.getByText('Inactive'));
    
    // Only inactive connections should be visible
    expect(screen.queryByText('Google Drive')).not.toBeInTheDocument();
    expect(screen.getByText('Slack Workspace')).toBeInTheDocument();
  });

  test('should open modal when Add Connection button is clicked', () => {
    render(<WebConnectionsManager />);
    
    // Click Add Connection button
    fireEvent.click(screen.getByText('Add Connection'));
    
    // Modal should be open
    expect(screen.getByTestId('web-connection-modal')).toBeInTheDocument();
    expect(screen.getByText('Add Connection')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('web-connection-modal')).not.toBeInTheDocument();
  });

  test('should open modal with connection data when Edit button is clicked', () => {
    render(<WebConnectionsManager />);
    
    // Find the Settings button (Edit) for Google Drive and click it
    const editButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(editButtons[0]); // First edit button should be for Google Drive
    
    // Modal should be open with connection data
    expect(screen.getByTestId('web-connection-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Connection')).toBeInTheDocument();
    expect(screen.getByText('Connection: Google Drive')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('web-connection-modal')).not.toBeInTheDocument();
  });

  test('should add a new connection when created through the modal', async () => {
    render(<WebConnectionsManager />);
    
    // Initial connection count
    const initialConnectionCount = screen.getAllByText(/Drive|GitHub|OpenAI|Slack|AWS|Salesforce/).length;
    
    // Open creation modal
    fireEvent.click(screen.getByText('Add Connection'));
    
    // Create a new connection
    fireEvent.click(screen.getByText('Save Connection'));
    
    // Wait for the new connection to be added
    await waitFor(() => {
      const newConnectionCount = screen.getAllByText(/Drive|GitHub|OpenAI|Slack|AWS|Salesforce|New Test Connection/).length;
      expect(newConnectionCount).toBe(initialConnectionCount + 1);
    });
    
    // Verify the new connection is in the list
    expect(screen.getByText('New Test Connection')).toBeInTheDocument();
  });

  test('should update an existing connection when edited through the modal', async () => {
    render(<WebConnectionsManager />);
    
    // Find the Settings button (Edit) for Google Drive and click it
    const editButtons = screen.getAllByRole('button', { name: /settings/i });
    fireEvent.click(editButtons[0]); // First edit button should be for Google Drive
    
    // Edit the connection
    fireEvent.click(screen.getByText('Save Connection'));
    
    // Wait for the connection to be updated
    await waitFor(() => {
      expect(screen.getByText('Updated Google Drive')).toBeInTheDocument();
    });
  });

  test('should delete a connection when delete button is clicked', () => {
    render(<WebConnectionsManager />);
    
    // Find the delete button for Google Drive and click it
    const deleteButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(deleteButtons[0]); // First delete button should be for Google Drive
    
    // Google Drive should be removed
    expect(screen.queryByText('Google Drive')).not.toBeInTheDocument();
  });

  test('should toggle connection status when Activate/Deactivate button is clicked', async () => {
    render(<WebConnectionsManager />);
    
    // Find an active connection
    const googleDriveConnection = screen.getByText('Google Drive').closest('div[role="article"]');
    const deactivateButton = within(googleDriveConnection).getByText('Deactivate');
    
    // Click Deactivate button
    fireEvent.click(deactivateButton);
    
    // Should show deactivating state
    expect(screen.getByText('Deactivating...')).toBeInTheDocument();
    
    // Fast-forward timers
    jest.advanceTimersByTime(1000);
    
    // Connection should now be inactive
    expect(within(googleDriveConnection).getByText('inactive')).toBeInTheDocument();
    expect(within(googleDriveConnection).getByText('Activate')).toBeInTheDocument();
    
    // Click Activate button
    const activateButton = within(googleDriveConnection).getByText('Activate');
    fireEvent.click(activateButton);
    
    // Should show activating state
    expect(screen.getByText('Activating...')).toBeInTheDocument();
    
    // Fast-forward timers
    jest.advanceTimersByTime(1000);
    
    // Connection should now be active again
    expect(within(googleDriveConnection).getByText('active')).toBeInTheDocument();
    expect(within(googleDriveConnection).getByText('Deactivate')).toBeInTheDocument();
  });

  test('should refresh OAuth token when refresh button is clicked', async () => {
    render(<WebConnectionsManager />);
    
    // Find the refresh button for Google Drive and click it
    const googleDriveConnection = screen.getByText('Google Drive').closest('div[role="article"]');
    const refreshButton = within(googleDriveConnection).getByRole('button', { name: /refresh/i });
    
    // Click refresh button
    fireEvent.click(refreshButton);
    
    // Should show refreshing state (spinner)
    expect(refreshButton.querySelector('svg')).toHaveClass('animate-spin');
    
    // Fast-forward timers
    jest.advanceTimersByTime(1500);
    
    // Refresh should be complete
    expect(refreshButton.querySelector('svg')).not.toHaveClass('animate-spin');
    
    // Last used should be updated
    expect(within(googleDriveConnection).getByText('just now')).toBeInTheDocument();
  });

  test('should toggle secret visibility when show/hide button is clicked', () => {
    render(<WebConnectionsManager />);
    
    // Find the show/hide button for a connection and click it
    const showButton = screen.getByText('Show');
    fireEvent.click(showButton);
    
    // Should now show the secret
    expect(screen.getByText('Hide')).toBeInTheDocument();
    
    // Click hide button
    const hideButton = screen.getByText('Hide');
    fireEvent.click(hideButton);
    
    // Should hide the secret again
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  test('should open advanced filter modal when Filter button is clicked', () => {
    render(<WebConnectionsManager />);
    
    // Click Filter button
    fireEvent.click(screen.getByText('Filter'));
    
    // Modal should be open
    expect(screen.getByTestId('advanced-filter-modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should be closed
    expect(screen.queryByTestId('advanced-filter-modal')).not.toBeInTheDocument();
  });

  test('should apply filters when applied through the modal', async () => {
    render(<WebConnectionsManager />);
    
    // Initially all connections should be visible
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('Slack Workspace')).toBeInTheDocument();
    
    // Open filter modal
    fireEvent.click(screen.getByText('Filter'));
    
    // Apply a filter for active connections
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Wait for filters to be applied
    await waitFor(() => {
      // Should show active connections and hide inactive connections
      expect(screen.getByText('Google Drive')).toBeInTheDocument();
      expect(screen.queryByText('Slack Workspace')).not.toBeInTheDocument();
    });
    
    // Should show active filters display
    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Status Equals active')).toBeInTheDocument();
  });

  test('should clear filters when Clear button is clicked', async () => {
    render(<WebConnectionsManager />);
    
    // Open filter modal
    fireEvent.click(screen.getByText('Filter'));
    
    // Apply a filter
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Wait for filters to be applied
    await waitFor(() => {
      expect(screen.getByText('Active filters:')).toBeInTheDocument();
    });
    
    // Clear filters
    fireEvent.click(screen.getByText('Clear'));
    
    // All connections should be visible again
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('Slack Workspace')).toBeInTheDocument();
    
    // Active filters display should be gone
    expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
  });

  test('should show empty state when no connections match filters', async () => {
    render(<WebConnectionsManager />);
    
    // Search for a non-existent connection
    fireEvent.change(screen.getByPlaceholderText('Search connections...'), {
      target: { value: 'NonExistentConnection' }
    });
    
    // Should show empty state
    expect(screen.getByText('No connections found')).toBeInTheDocument();
    expect(screen.getByText('No connections match your current filters. Try adjusting your search or filters.')).toBeInTheDocument();
  });
});