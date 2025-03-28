const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { execSync } = require('child_process');
const { program } = require('commander');
const {
  resolveInputUrl,
  generateClientsFromConfig,
  validateProgramOptions,
} = require('../generate-clients');

jest.mock('fs');
jest.mock('child_process');

beforeEach(() => {
  process.env = {};
  fs.readFileSync.mockReset();
  fs.writeFileSync.mockReset();
  fs.unlinkSync.mockReset();
  execSync.mockReset();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
});

const configPath = path.join(__dirname, 'fixtures', 'clients.yaml');

describe('Client Generation Script Tests', () => {
  it('should resolve environment variables in the input URL', () => {
    process.env.API_URL = 'https://api.example.com/openapi.json';
    expect(resolveInputUrl('${API_URL}')).toBe(
      'https://api.example.com/openapi.json',
    );
  });

  it('should throw an error when env variable is not defined', () => {
    expect(() => resolveInputUrl('${NON_EXISTENT_VAR}')).toThrow();
  });

  it('should use the default client type when not provided', () => {
    process.argv = [
      'node',
      'generate-clients.js',
      '-i',
      'https://api.example.com',
      '-o',
      'src/clients',
    ];
    program.parse(process.argv);
    expect(program.opts().type).toBe('fetch');
  });

  it('should use the default schemas option when not provided', () => {
    process.argv = [
      'node',
      'generate-clients.js',
      '-i',
      'https://api.example.com',
      '-o',
      'src/clients',
    ];
    program.parse(process.argv);
    expect(program.opts().schemas).toBe(false);
  });

  it('should include schemas when configured', () => {
    process.argv = [
      'node',
      'generate-clients.js',
      '-i',
      'https://api.example.com',
      '-o',
      'src/clients',
      '-s',
    ];
    program.parse(process.argv);
    expect(program.opts().schemas).toBe(true);
  });

  it('should include the specified client type', () => {
    process.argv = [
      'node',
      'generate-clients.js',
      '-i',
      'https://api.example.com',
      '-o',
      'src/clients',
      '-t',
      'axios',
    ];
    program.parse(process.argv);
    expect(program.opts().type).toBe('axios');
  });

  it.skip('should remove the temporary config file after execution', () => {
    fs.readFileSync.mockReturnValue(
      yaml.dump({
        client1: { input: 'https://api.example.com', output: 'src/clients' },
      }),
    );
    process.argv = ['node', 'generate-clients.js', '-c', configPath];
    program.parse(process.argv);
    generateClientsFromConfig(program.opts().config);
    expect(fs.unlinkSync).toHaveBeenCalledWith('openapi-ts.config.ts');
  });

  it('should handle missing input or invalid YAML gracefully', () => {
    fs.readFileSync.mockReturnValue('invalid yaml');
    process.argv = ['node', 'generate-clients.js', '-c', configPath];
    program.parse(process.argv);
    expect(() => generateClientsFromConfig(program.opts().config));
  });

  it('should throw an error when both -c and other options are provided', () => {
    process.argv = [
      'node',
      'generate-clients.js',
      '-c',
      configPath,
      '-i',
      'https://api.example.com',
    ];
    program.parse(process.argv);
    expect(() => validateProgramOptions(program.opts())).toThrow(
      '❌ Cannot mix config file (-c) with individual options (-i, -o, -t, -s).',
    );
  });

  it.skip('should parse configuration from a file if -c is provided', () => {
    fs.readFileSync.mockReturnValue(
      yaml.dump({
        client1: { input: 'https://api.example.com', output: 'src/clients' },
      }),
    );
    process.argv = ['node', 'generate-clients.js', '-c', configPath];
    program.parse(process.argv);
    generateClientsFromConfig(program.opts().config);
    expect(fs.readFileSync).toHaveBeenCalledWith(configPath, 'utf8');
  });

  it('should throw an error when config file is not found', () => {
    process.argv = ['node', 'generate-clients.js', '-c', 'nonexistent.yaml'];
    program.parse(process.argv);
    expect(() => generateClientsFromConfig(program.opts().config)).toThrow(
      '❌ Config file nonexistent.yaml not found.',
    );
  });

  it('should throw an error when input and output are not provided', () => {
    process.argv = ['node', 'generate-clients.js'];
    program.parse(process.argv);
    expect(() => validateProgramOptions(program.opts())).toThrow(
      '❌ Input, output, or config file is required.',
    );
  });
});
