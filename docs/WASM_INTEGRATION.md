# WASM Integration Guide

This document describes how to integrate WebAssembly (WASM) modules for type inference algorithms.

## Overview

The type inference playground supports WASM modules for performance-critical type inference algorithms. The WASM modules communicate with the frontend through JSON messages via Web Workers.

## Message Protocol

### Request Format
```json
{
  "type": "inference_request",
  "data": {
    "algorithm": "AlgW",
    "expression": "\\x. x",
    "options": {
      "showSteps": true,
      "maxDepth": 100
    }
  }
}
```

### Response Format
```json
{
  "type": "inference_response", 
  "data": {
    "success": true,
    "result": {
      "finalType": "a -> a",
      "derivation": [...],
      "constraints": [...]
    },
    "steps": [...]
  }
}
```

### Error Format
```json
{
  "type": "error",
  "data": {
    "message": "Type error: Cannot unify Int with Bool",
    "location": { "line": 1, "column": 5 }
  }
}
```

## Implementation Steps

### 1. Setup WASM Module

Create your WASM module in Rust/C++/AssemblyScript:

```rust
// Example Rust implementation
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct InferenceRequest {
    algorithm: String,
    expression: String,
    options: Option<InferenceOptions>,
}

#[derive(Deserialize)]
struct InferenceOptions {
    show_steps: Option<bool>,
    max_depth: Option<u32>,
}

#[derive(Serialize)]
struct InferenceResponse {
    success: bool,
    result: Option<InferenceResult>,
    error: Option<String>,
    steps: Option<Vec<DerivationStep>>,
}

#[wasm_bindgen]
pub fn run_inference(request_json: &str) -> String {
    let request: InferenceRequest = serde_json::from_str(request_json).unwrap();
    
    // Your type inference logic here
    let response = match request.algorithm.as_str() {
        "AlgW" => run_algorithm_w(&request.expression),
        "bidirectional" => run_bidirectional(&request.expression),
        _ => InferenceResponse {
            success: false,
            error: Some("Unsupported algorithm".to_string()),
            result: None,
            steps: None,
        }
    };
    
    serde_json::to_string(&response).unwrap()
}
```

### 2. Build WASM Module

```bash
# For Rust with wasm-pack
wasm-pack build --target web --out-dir public/wasm

# For C++ with Emscripten  
emcc -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["ccall"]' \
     -s EXPORTED_FUNCTIONS='["_run_inference"]' \
     src/inference.cpp -o public/wasm/inference.js
```

### 3. Create Web Worker

Create `public/wasm/inference-worker.js`:

```javascript
// Web Worker for WASM type inference
let wasmModule = null;

async function initWasm() {
  try {
    // For wasm-pack generated modules
    const wasm = await import('./inference.js');
    await wasm.default();
    wasmModule = wasm;
    
    // Or for Emscripten modules
    // importScripts('./inference.js');
    // wasmModule = Module;
    
    console.log('WASM module initialized');
  } catch (error) {
    console.error('Failed to initialize WASM:', error);
    postMessage({
      type: 'error',
      data: { message: 'WASM initialization failed' }
    });
  }
}

self.onmessage = async function(event) {
  const { type, data } = event.data;
  
  if (type === 'inference_request') {
    try {
      if (!wasmModule) {
        await initWasm();
      }
      
      const requestJson = JSON.stringify(data);
      const responseJson = wasmModule.run_inference(requestJson);
      const response = JSON.parse(responseJson);
      
      postMessage({
        type: 'inference_response',
        data: response
      });
    } catch (error) {
      postMessage({
        type: 'error',
        data: { message: error.message }
      });
    }
  }
};

// Initialize WASM module on worker startup
initWasm();
```

### 4. Enable WASM Interface

In `src/lib/wasmInterface.ts`, uncomment the initialization code:

```typescript
async initialize(): Promise<boolean> {
  if (this.isInitialized) return true;
  
  try {
    this.worker = new Worker('/wasm/inference-worker.js');
    await this.setupWorkerListeners();
    this.isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize WASM module:', error);
    return false;
  }
}
```

### 5. Update Inference Service

Modify `src/lib/mockInference.ts` to use WASM when available:

```typescript
import { wasmInference } from './wasmInterface';

export const runInference = async (algorithm: string, expression: string): Promise<InferenceResult> => {
  // Try WASM first if available
  if (await wasmInference.initialize()) {
    try {
      const response = await wasmInference.runInference({
        algorithm,
        expression,
        options: { showSteps: true }
      });
      
      if (response.success) {
        return response.result;
      }
    } catch (error) {
      console.warn('WASM inference failed, falling back to mock:', error);
    }
  }
  
  // Fallback to mock implementation
  return runMockInference(algorithm, expression);
};
```

## Testing

1. **Unit Tests**: Test WASM modules independently
2. **Integration Tests**: Test worker communication
3. **Performance Tests**: Compare WASM vs JavaScript performance

```bash
# Example test commands
npm run test:wasm
npm run benchmark:inference
```

## Performance Considerations

- **Memory Management**: Properly manage WASM memory allocation
- **Message Serialization**: Minimize JSON serialization overhead
- **Worker Pooling**: Use multiple workers for parallel inference
- **Caching**: Cache compiled WASM modules

## Debugging

1. **Browser DevTools**: Use WebAssembly debugging features
2. **Console Logging**: Add logging in worker and WASM code
3. **Source Maps**: Generate source maps for debugging

## Security

- **Sandbox**: WASM runs in a sandboxed environment
- **Input Validation**: Validate all inputs before WASM calls
- **Resource Limits**: Set timeouts and memory limits

## Future Enhancements

- Support for multiple inference algorithms in single WASM module
- Streaming inference for large expressions
- Real-time collaboration with shared WASM instances
- Integration with theorem provers

## Troubleshooting

**Common Issues:**

1. **WASM not loading**: Check file paths and CORS settings
2. **Worker errors**: Verify worker script syntax
3. **Memory issues**: Monitor WASM memory usage
4. **Performance**: Profile critical paths

**Debug Steps:**

1. Check browser console for errors
2. Verify WASM file is accessible
3. Test worker independently
4. Validate JSON message format