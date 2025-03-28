# 🚀 Generate TypeScript Clients from OpenAPI

## 📜 Description

This package generates TypeScript API clients from OpenAPI specifications. It reads configuration from a YAML file, dynamically generates an `openapi-ts.config.js` file for each client, and then runs the `@hey-api/openapi-ts` generator to create the client.

Some fields and options can be configured within a YAML configuration file:

- `input`: The URL of the OpenAPI specification. This can be a URL or an environment variable.
- `output`: The output directory for the generated client.
- `schemas`: Whether to generate schemas for the client. This option takes a boolean value (`true` or `false`).
- `client`: The client library to use. This option can be set to whatever client is supported by `@hey-api/openapi-ts`. Check documentation [here](https://heyapi.dev/openapi-ts/clients) for more details.

---

## ✨ Features

- Generate TypeScript clients from OpenAPI specifications.
- Support for multiple clients via configuration file.
- Support for single client generation using application arguments.

---

## 📦 Installation

### 🌍 Global Install

To install the package globally, run the following command:

```bash
npm install -g generate-openapi-ts-clients
```

### 🏡 Local Install

To install the package locally in your project, run:

```bash
npm install generate-openapi-ts-clients
```

---

## 🧑‍💻 Usage

### 📝 Configuration (`config.yaml`)

The configuration file, `config.yaml`, should be structured as follows:

```yaml
service_A:
  input: '${SERVICE_A_OPENAPI_URL}'
  output: 'src/clients/service_A'
  schemas: true
  client: 'axios'
service_B:
  input: 'https://service_B.io/openapi.json'
  output: 'src/clients/service_B'
  schemas: false
  client: 'fetch'
```

The `input` field could be a URL or an environment variable. If an environment variable is used, the value will be resolved at runtime. The developer should provide the environment variable as part of the deployment process.
For testing purposes, you can set it up as `export SERVICE_A_OPENAPI_URL="https://service_A.io/openapi.json"` in the terminal.

The `output` field is the path to the output directory for the generated client.

If the `schemas` value is not provided, the default value is `false`.

If the `client` value is not provided, the default value is `fetch`.

### ⚙️ Running the Script

Once installed, you can run the client generation with the following command:

```bash
generate-openapi-ts-clients -c/--config config.yaml
```

This will:

1. Read the `config.yaml` file. 📖
2. Create the `openapi-ts.config.js` file for each client. 📁
3. Run the OpenAPI generator for each client. 🔄
4. Clean up the temporary config files after generating the clients. 🧹

You can also run the script without installation using `npx`:

```bash
npx generate-openapi-ts-clients -c/--config config.yaml
```

### 🎯 Running with Arguments

The script also supports additional arguments for more control for creating a client:

- -i/--input (_required_): The URL of the OpenAPI specification.
- -o/--output (_required_): The output directory for the generated client.
- -s/--schemas (_optional_): If present, the client will be generated with schemas.
- -t/--type (_optional_): The client library to use. This option can be set to whatever client is supported by `@hey-api/openapi-ts`. Check documentation [here](https://heyapi.dev/openapi-ts/clients) for more details.

- Generate a specific client:

  ```bash
  npx generate-openapi-ts-clients -i https://somapiurl.com/openapi.json -o ./scr/client1 -s -t axios
  ```

This command will generate an axios client from the input url into the ./src/client folder with schemas.

These arguments help customize the execution based on specific needs.

---

## 🤝 Contributors

A big thank you to everyone who contributed to this project! 💖

<a href="https://github.com/maekind/generate-openapi-clients/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=maekind/generate-openapi-clients" alt="Contributors" />
</a>

---

## 📧 Contact

(c) 2025, Created with ❤️ by [Marco Espinosa](mailto:marco@marcoespinosa.com)
