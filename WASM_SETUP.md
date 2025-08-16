# WASM Build Configuration

This project supports switching between pure frontend and WASM-enabled builds using the provided scripts.

## Setup Instructions

### 1. Add npm scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "wasm:enable": "node scripts/build-wasm.js enable",
    "wasm:disable": "node scripts/build-wasm.js disable", 
    "wasm:build": "node scripts/build-wasm.js build"
  }
}
```

### 2. Available Commands

- **`npm run wasm:enable`** - Enable WASM interface for development
- **`npm run wasm:disable`** - Disable WASM interface (pure frontend mode)
- **`npm run wasm:build`** - Build production version with WASM support

### 3. Development Workflow

```bash
# Start with pure frontend (default)
npm run dev

# Switch to WASM mode
npm run wasm:enable
npm run dev

# Switch back to pure frontend
npm run wasm:disable
npm run dev

# Build production with WASM
npm run wasm:build
```

### 4. What the scripts do

- **Enable**: Uncomments WASM initialization code in `src/lib/wasmInterface.ts`
- **Disable**: Comments out WASM initialization code, falls back to mock inference
- **Build**: Enables WASM and runs production build

### 5. Error Format Removed

The complex error format with location tracking has been removed to keep the interface simple:

```typescript
// ❌ Removed support for this format:
{
  "type": "error", 
  "data": {
    "message": "Type error: Cannot unify Int with Bool",
    "location": { "line": 1, "column": 5 }
  }
}

// ✅ Simple error handling used instead
{
  "success": false,
  "error": "Type error: Cannot unify Int with Bool"
}
```

### 6. Next Steps

1. Implement your WASM modules following `docs/WASM_INTEGRATION.md`
2. Place WASM files in `public/wasm/` directory
3. Test switching between modes during development