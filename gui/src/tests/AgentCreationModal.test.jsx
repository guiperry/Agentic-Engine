import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentCreationModal from '../components/modals/AgentCreationModal';

// Mock the image URLs to avoid network requests during tests
jest.mock('../utils/imageUrls', () => ({
  sampleAgentImages: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ]
}));

describe('AgentCreationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnAgentCreated = jest.fn();
  
  const renderModal = (isOpen = true) => {
    return render(
      <AgentCreationModal 
        isOpen={isOpen} 
        onClose={mockOnClose} 
        onAgentCreated={mockOnAgentCreated} 
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText('Create New NFT-Agent')).not.toBeInTheDocument();
  });

  test('should render when isOpen is true', () => {
    renderModal();
    expect(screen.getByText('Create New NFT-Agent')).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Agent Image')).toBeInTheDocument();
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Target Types')).toBeInTheDocument();
  });

  test('should call onClose when cancel button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should call onClose when X button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should show validation errors when form is submitted with empty fields', async () => {
    renderModal();
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByText('Create Agent'));
    
    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('Agent name is required')).toBeInTheDocument();
      expect(screen.getByText('Collection name is required')).toBeInTheDocument();
      expect(screen.getByText('Please select an image for your agent')).toBeInTheDocument();
      expect(screen.getByText('Select at least one capability')).toBeInTheDocument();
      expect(screen.getByText('Select at least one target type')).toBeInTheDocument();
    });
    
    // Ensure onAgentCreated was not called
    expect(mockOnAgentCreated).not.toHaveBeenCalled();
  });

  test('should successfully create agent when form is valid', async () => {
    renderModal();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Agent Name/i), {
      target: { value: 'Test Agent' }
    });
    
    fireEvent.change(screen.getByLabelText(/Collection/i), {
      target: { value: 'Test Collection' }
    });
    
    // Select an image
    const images = screen.getAllByAltText(/Agent image option/i);
    fireEvent.click(images[0]);
    
    // Select a capability
    const capabilities = screen.getAllByText(/Web Analysis|Data Extraction|File Analysis/i);
    fireEvent.click(capabilities[0]);
    
    // Select a target type
    const targetTypes = screen.getAllByText(/Browser|File System|Applications/i);
    fireEvent.click(targetTypes[0]);
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Agent'));
    
    // Mock the async operation
    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
    
    // Wait for success message and callback
    await waitFor(() => {
      expect(mockOnAgentCreated).toHaveBeenCalledTimes(1);
      expect(mockOnAgentCreated).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Agent',
        collection: 'Test Collection',
        status: 'idle'
      }));
    });
  });
});