const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_FILE = 'clients.yaml'; // YAML file containing all clients

/**
 * Resolves environment variables inside the input URL field.
 * Example: "${API_URL}" → process.env.API_URL
 */
function resolveInputUrl(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  const envVarMatch = input.match(/\${(.+?)}/);
  if (envVarMatch) {
    const envVar = envVarMatch[1];
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not defined`);
    }
    return process.env[envVar];
  }
  return input;
}

function generateClients() {
  // Read YAML content and parse as JSON
  const clients = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'));

  // Iterate over each client configuration
  Object.entries(clients).forEach(([client, config]) => {
    const inputUrl = resolveInputUrl(config.input);
    const outputPath = config.output;
    const schemas = config.schemas || false;
    const clientType = config.client || "fetch";

    console.log(`🚀 Generating API client for: ${client}`);
    console.log(`🛠️  Configured options: client type=${clientType}, generate schemas=${schemas}`);
    
    const schemasContent = `
      {
        name: '@hey-api/schemas',
        type: 'json', 
      },
    `;

    // Create a temporary config file
    const configContent = `
    import { defineConfig } from '@hey-api/openapi-ts';

    export default defineConfig({
      input: '${inputUrl}',
      output: '${outputPath}',
      plugins: [
        {
          name: "@hey-api/sdk",
          asClass: true,
          operationId: true,
          methodNameBuilder: (operation) => {
            // @ts-ignore
            const summary: string = operation.summary
            // @ts-ignore
            let name: string = summary.split(" ").join("") || operation.operationId
            // @ts-ignore
            const service: string = operation.service

            if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
              name = name.slice(service.length)
            }

            return name.charAt(0).toLowerCase() + name.slice(1)
          },
        },
        {
          name: "@hey-api/client-${clientType}",
        },
        ${schemas ? schemasContent : ''}
      ]
    });
    `;

    fs.writeFileSync('openapi-ts.config.ts', configContent);

    // Run the OpenAPI generator
    execSync('npx @hey-api/openapi-ts', { stdio: 'inherit' });

    // Remove the temporary config file
    fs.unlinkSync('openapi-ts.config.ts');

    console.log(`✅ API client generated for: ${client}`);
  });

  console.log('🎉 All API clients generated successfully!');
}

// Export the `resolveInputUrl` function for testing purposes
module.exports = { resolveInputUrl, generateClients };

// If this script is executed directly, run the generateClients function
if (require.main === module) {
  generateClients();
}
