# Type Inference Playground

[![Build Status](https://github.com/cu1ch3n/type-inference-playground/actions/workflows/build.yml/badge.svg)](https://github.com/cu1ch3n/type-inference-playground/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

A modern, extensible frontend playground for type inference algorithms. This project serves as a general-purpose frontend that can work with different WebAssembly type inference engines. The default engine is [type-inference-zoo-wasm](https://github.com/cu1ch3n/type-inference-zoo-wasm), but you can easily switch to other WASM modules or even private implementations.

## Features

- **Flexible WASM Integration**: Support for multiple type inference engines via WebAssembly
- **Configurable Sources**: Switch between different WASM modules including private/authenticated sources
- **Interactive Playground**: Real-time type inference with step-by-step visualization
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Extensible Architecture**: Easy to add new algorithms

## WASM Engine Configuration

The Type Inference Playground is designed to work with any compatible WebAssembly type inference engine. By default, it uses [type-inference-zoo-wasm](https://github.com/cu1ch3n/type-inference-zoo-wasm), but you can easily configure it to use different engines.

### Adding Custom WASM Engines

You can add your own WASM engines through the Settings modal (⚙️ icon in the navbar):

1. **Public WASM Files**: Simply provide a URL to your WASM file
2. **Private/Authenticated Sources**: Configure authentication headers or tokens
3. **Local Development**: Upload WASM files directly from your machine, or you can serve your WASM files locally with some HTTP server

### Authentication Support

The playground supports various authentication methods for private WASM sources:

- **Bearer Token**: Standard OAuth/API token authentication
- **Custom Headers**: Any custom authentication headers
- **Pre-signed URLs**: For cloud storage with temporary access

### WASM Engine Requirements

Your WASM engine should implement the following command-line interface:

```bash
# Get metadata about available algorithms
your-wasm --meta

# Run type inference
your-wasm --typing <algorithm> [--variant <variant>] <expression>

# Run subtyping check
your-wasm --subtyping <algorithm> [--variant <variant>] <type1> <type2>
```

The engine should output JSON responses for programmatic consumption.

### Sharing Configurations

You can share WASM configurations using subscription URLs. The playground supports:
- `infer://` protocol URLs
- URLs with base64-encoded configuration data

## Development

### Prerequisites

- Node.js 18+ 
- npm or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/cu1ch3n/type-inference-playground.git
cd type-inference-playground

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```
