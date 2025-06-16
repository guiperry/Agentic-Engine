import { testADKIntegration } from '../../utils/testAPI';

describe('ADK API Integration', () => {
  it('should successfully test all ADK endpoints', async () => {
    // Mock console.log to capture output
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
    const mockError = jest.spyOn(console, 'error').mockImplementation();

    await testADKIntegration();

    // Verify no errors were logged
    expect(mockError).not.toHaveBeenCalled();

    // Verify expected logs were produced
    expect(mockLog).toHaveBeenCalledWith('Testing ADK Agent-to-Agent API integration...');
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('ADK API integration tests completed'));

    // Clean up mocks
    mockLog.mockRestore();
    mockError.mockRestore();
  }, 10000); // 10s timeout for API calls
});