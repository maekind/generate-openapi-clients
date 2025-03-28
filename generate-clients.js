const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');
const { program } = require('commander');

// CLI setup
program
  .option('-c, --config <file>', 'Path to config file')
  .option('-t, --type <clientType>', 'Client type', 'fetch')
  .option('-i, --input <input>', 'Input URL or file')
  .option('-o, --output <output>', 'Output folder')
  .option('-s, --schemas', 'Generate schemas', false);

program.parse(process.argv);
const options = program.opts();

function resolveInputUrl(input) {
  const envVarMatch = input.match(/\${(.+?)}/);
  if (envVarMatch) {
    const envVar = envVarMatch[1];
    if (!process.env[envVar]) {
      throw new Error('❌ Environment variable ' + envVar + ' is not defined');
    }
    return process.env[envVar];
  }
  return input;
}

function generateClientsFromConfig(configFile) {
  if (!fs.existsSync(configFile)) {
    throw new Error(`❌ Config file ${configFile} not found.`);
  }
  const clients = yaml.load(fs.readFileSync(configFile, 'utf8'));

  Object.entries(clients).forEach(([client, config]) => {
    generateClient(
      config.client || 'fetch',
      resolveInputUrl(config.input),
      config.output,
      config.schemas || false,
      client,
    );
  });

  console.log('🎉 All API clients generated successfully!');
}

function generateClient(
  clientType,
  input,
  output,
  schemas,
  clientName = 'custom',
) {
  if (!input || !output) {
    throw new Error('❌ Input and output are required for client generation.');
  }

  console.log(`🚀 Generating API client for: ${clientName}`);
  console.log(
    `🛠️  Configured options: client type=${clientType}, generate schemas=${schemas}`,
  );

  const schemasContent = schemas
    ? `
    {
      name: '@hey-api/schemas',
      type: 'json', 
    },
  `
    : '';

  const configContent = `
  import { defineConfig } from '@hey-api/openapi-ts';
  export default defineConfig({
    input: '${input}',
    output: '${output}',
    plugins: [
      {
        name: "@hey-api/sdk",
        asClass: true,
        operationId: true,
        methodNameBuilder: (operation) => {
          const summary = operation.summary || operation.operationId;
          let name = summary.split(" ").join("");
          const service = operation.service;

          if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
            name = name.slice(service.length);
          }

          return name.charAt(0).toLowerCase() + name.slice(1);
        },
      },
      {
        name: "@hey-api/client-${clientType}",
      },
      ${schemasContent}
    ]
  });
  `;

  fs.writeFileSync('openapi-ts.config.ts', configContent);
  execSync('npx @hey-api/openapi-ts', { stdio: 'inherit' });
  fs.unlinkSync('openapi-ts.config.ts');

  console.log(`✅ API client generated for: ${clientName}`);
}

// This function check for program options
function validateProgramOptions(options) {
  if ((options.input || options.output) && options.config) {
    throw new Error(
      '❌ Cannot mix config file (-c) with individual options (-i, -o, -t, -s).',
    );
  }

  if (!options.input && !options.config && !options.output) {
    throw new Error('❌ Input, output, or config file is required.');
  }
}

if (require.main === module) {
  validateProgramOptions(options);

  if (options.input && options.output) {
    generateClient(
      options.type,
      resolveInputUrl(options.input),
      options.output,
      options.schemas,
    );
  } else {
    generateClientsFromConfig(options.config);
  }
}

module.exports = {
  resolveInputUrl,
  generateClientsFromConfig,
  validateProgramOptions,
};
