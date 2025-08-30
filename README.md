# Typ.How - An Interactive Type Inference Playground

[![Build Status](https://github.com/cu1ch3n/typ-how/actions/workflows/build.yml/badge.svg)](https://github.com/cu1ch3n/typ-how/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

A modern, extensible frontend playground for type inference algorithms available at [typ.how](https://typ.how/). This project serves as a general-purpose frontend that can work with different WebAssembly type inference engines. The default engine is [type-inference-zoo-wasm](https://github.com/cu1ch3n/type-inference-zoo-wasm), but you can easily switch to other WASM modules or even private implementations.

## Features

- **Flexible WASM Integration**: Support for multiple type inference engines via WebAssembly
- **Configurable Sources**: Switch between different WASM modules including private/authenticated sources
- **Interactive Playground**: Real-time type inference with step-by-step visualization
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Extensible Architecture**: Easy to add new algorithms

## WASM Engine Configuration

Typ.How is designed to work with any compatible WebAssembly type inference engine. By default, it uses [type-inference-zoo-wasm](https://github.com/cu1ch3n/type-inference-zoo-wasm), but you can easily configure it to use different engines.

### Adding Custom WASM Engines

You can add your own WASM engines (clicking the wasm button in the navbar):

1. **Public WASM Files**: Simply provide a URL to your WASM file
2. **Private/Authenticated Sources**: Configure authentication headers or tokens
3. **Local Development**: Upload WASM files directly from your machine, or you can serve your WASM files locally with some HTTP server

### Authentication Support

Typ.How supports various authentication methods for private WASM sources:

- **Bearer Token**: Standard OAuth/API token authentication
- **Custom Headers**: Any custom authentication headers
- **Pre-signed URLs**: For cloud storage with temporary access

### WASM Engine Requirements

Your WASM engine should implement the following command-line interface:

```bash
# Get metadata about available algorithms
wasm-exe --meta

# Run type inference
wasm-exe --typing <algorithm> [--variant <variant>] <expression>

# Run subtyping check
wasm-exe --subtyping <algorithm> [--variant <variant>] <type1> <type2>
```

The engine should output JSON responses for programmatic consumption.

### Sharing Configurations

You can share WASM configurations using subscription URLs. Typ.How supports `infer://` URLs (which is just base64-encoded data)

## Development

### Prerequisites

- Node.js 18+ 
- npm or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/cu1ch3n/typ-how.git
cd typ-how

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
