const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');
const { generateClients, resolveInputUrl } = require('../generate-clients');

jest.mock('fs');
jest.mock('child_process');

// Mocking process.env for different test cases
beforeEach(() => {
  process.env = {}; // Reset env before each test
  fs.mkdirSync.mockReset();
  fs.readFileSync.mockReset();
  fs.writeFileSync.mockReset();
  fs.unlinkSync.mockReset();
  execSync.mockReset();
});

describe('Client Generation Script Tests', () => {
  // Test correct configuration with valid URL
  it('should resolve environment variables in the input URL', () => {
    process.env.API_URL = 'https://api.example.com/openapi.json'; // Mocking the env variable

    const input = '${API_URL}';
    const resolvedUrl = resolveInputUrl(input);

    expect(resolvedUrl).toBe('https://api.example.com/openapi.json');
  });

  // Test incorrect configuration where env variable is not defined
  it('should throw an error when env variable is not defined', () => {
    const input = '${NON_EXISTENT_VAR}';

    // Try running the script and check for any errors or behavior
    expect(() => resolveInputUrl(input)).toThrow();
  });

  // Test default client type (should be 'fetch' if not provided)
  it('should use the default client type "fetch" when not provided', () => {
    const config = {
      input: 'https://api.example.com',
      output: 'src/clients/client_1',
    };

    // Simulating the file read with mock content
    fs.readFileSync.mockReturnValue(yaml.dump({ client1: config }));

    // Here, we would run the code that processes this YAML and calls the execSync method
    generateClients();

    // Assert that fs.writeFileSync is called to create the config file
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith('npx @hey-api/openapi-ts', { stdio: 'inherit' });
  });

  // Test that the schema option is applied correctly when it's set
  it('should include schemas when configured', () => {
    const config = {
      input: 'https://api.example.com',
      output: 'src/clients/client_1',
      schemas: true,
    };

    fs.readFileSync.mockReturnValue(yaml.dump({ client1: config }));

    // Simulate script execution
    generateClients();

    // Verify that the schemas content is added to the generated config file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'openapi-ts.config.ts',
      expect.stringContaining('@hey-api/schemas')
    );
  });

  // Test that the client option is applied correctly when it's set
  it('should include client when configured', () => {
    const config = {
      input: 'https://api.example.com',
      output: 'src/clients/client_1',
      client: 'axios',
    };

    fs.readFileSync.mockReturnValue(yaml.dump({ client1: config }));

    // Simulate script execution
    generateClients();

    // Verify that the client axios is added to the generated config file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'openapi-ts.config.ts',
      expect.stringContaining('@hey-api/client-axios')
    );
  });

  // Test that the temporary config file is removed after execution
  it('should remove the temporary config file after execution', () => {
    const config = {
      input: 'https://api.example.com',
      output: 'src/clients/client_1',
    };

    fs.readFileSync.mockReturnValue(yaml.dump({ client1: config }));

    // Simulate script execution
    generateClients();

    // Ensure that the temporary config file is deleted
    expect(fs.unlinkSync).toHaveBeenCalledWith('openapi-ts.config.ts');
  });

  // Test incorrect YAML format or missing `input` field
  it('should handle missing input or invalid YAML gracefully', () => {
    // Simulating an invalid YAML file content
    fs.readFileSync.mockReturnValue('{}'); // Empty YAML or incorrect format

    // Try running the script and check for any errors or behavior
    expect(() => generateClients()).not.toThrow();
  });
});
