# Pure WASM Integration Documentation

## Overview
The frontend loads a pure WASM module directly from `wasm.zoo.cuichen.cc/inference.wasm` and calls its exported functions like a command-line tool.

## WASM File Loading
- **URL**: `https://files.cuichen.cc/infer.wasm`
- **Method**: Direct WebAssembly.instantiate() 
- **Memory**: 256-512 pages allocated for WASM module
- **Status Indicator**: Shows connection status (disconnected/connecting/connected/error)

## Expected WASM Exports
Your WASM module should export these functions:

```wasm
// Required exports in your WASM module
export function run_inference(algorithm: string, expression: string) -> string;
```

## Function Interface
**`run_inference(algorithm, expression)`**
- **Input**: Algorithm name (e.g., "hindley-milner") and expression string
- **Output**: JSON string with inference result
- **Memory**: Uses provided linear memory for string handling

## Integration Flow
1. **Load**: Frontend fetches `inference.wasm` file  
2. **Instantiate**: WebAssembly.instantiate() with memory allocation
3. **Call**: Direct function calls to `run_inference()`
4. **Status**: Live indicator shows connection state
5. **Fallback**: Falls back to mock inference if WASM unavailable

## WASM Module Requirements
- **Memory**: Expects `env.memory` import (256-512 pages)
- **String Handling**: Should handle UTF-8 string conversion
- **Error Handling**: Return JSON with `{"success": false, "error": "message"}`
- **CORS**: Your CDN should allow cross-origin requests from the frontend domain

## Example WASM Output
```json
{
  "success": true,
  "result": {"type": "Int -> Int"},
  "steps": [{"rule": "T-Abs", "conclusion": "..."}]
}
```

## Status Indicator
The green/yellow/red dot shows:
- 🟢 **Connected**: WASM loaded successfully
- 🟡 **Connecting**: Loading WASM file  
- 🔴 **Error**: Failed to load or CORS issue
- ⚫ **Disconnected**: Initial state

## Testing
1. Upload your `infer.wasm` to `files.cuichen.cc/`
2. Ensure proper CORS headers for cross-origin loading
3. Test function exports match expected interface
4. Verify memory allocation works correctly