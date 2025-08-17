# WASI Integration Documentation

## Overview
The frontend loads a WASI (WebAssembly System Interface) module from `files.cuichen.cc/bin.wasm` and runs it like a command-line tool, following your type-inference-zoo implementation.

## WASM File Loading
- **URL**: `https://files.cuichen.cc/bin.wasm`
- **Type**: WASI module (wasm32-wasi target)
- **Method**: WebAssembly.compile() + instantiate with WASI imports
- **Status Indicator**: Shows connection status (disconnected/connecting/connected/error)

## WASI Interface
Your WASM module should be compiled with WASI support and expect:

### Command Line Arguments
```bash
infer --alg <algorithm> <expression>
```

### Supported Algorithms
- `W` - Algorithm W
- `DK` - Complete and Easy Bidirectional Typechecking
- `Worklist` - Higher-Ranked Polymorphic Type Inference
- `Elementary` - Elementary Type Inference
- `R` - Fully Grounding Type Inference
- `Bounded` - Greedy Implicit Bounded Quantification
- `Contextual` - Contextual Typing
- `IU` - Bidirectional with Intersection and Union Types

### Output Format
Your WASI module should output to stdout in JSON format matching the InferenceResult interface:

**Required JSON Structure:**
```json
{
  "success": boolean,
  "finalType": "string (optional, the inferred type)",
  "derivation": [
    {
      "id": "string (unique identifier)",
      "ruleId": "string (typing rule name)",
      "expression": "string (KaTeX expression)",
      "children": "DerivationStep[] (optional, for tree view)"
    }
  ],
  "error": "string (optional)"
}
```

**Tree View Example (Algorithm W):**
```json
{
  "success": true,
  "finalType": "a \\to a",
  "derivation": [
    {
      "id": "1",
      "ruleId": "Abs",
      "expression": "\\vdash \\lambda x.~x : a \\to a",
      "children": [
        {
          "id": "2",
          "ruleId": "Var",
          "expression": "x: a \\vdash x : a"
        }
      ]
    }
  ]
}
```

**Linear View Example (Worklist DK):**
```json
{
  "success": true,
  "finalType": "\\text{Int}",
  "derivation": [
    {
      "id": "1",
      "ruleId": "InfAnn",
      "expression": "\\cdot \\vdash (\\lambda x.~x)~1 : \\text{Int} \\Rightarrow_a \\text{Out}(a)"
    },
    {
      "id": "2", 
      "ruleId": "ChkSub",
      "expression": "\\cdot \\vdash \\text{Out}(\\text{Int}) \\vdash (\\lambda x.~x)~1 \\Leftarrow \\text{Int}"
    }
  ]
}
```

**Error Example:**
```json
{
  "success": false,
  "error": "Cannot unify a with a \\to b (occurs check)",
  "derivation": []
}
```

## Integration Flow
1. **Load**: Frontend fetches `bin.wasm` file
2. **Compile**: WebAssembly.compile() creates module
3. **Run**: Instantiate with WASI imports and call `_start()`
4. **Capture**: stdout is captured and parsed
5. **Status**: Live indicator shows connection state
6. **Fallback**: Falls back to mock inference if WASM unavailable

## WASI Requirements
Your GHC wasm32-wasi compilation should provide:
- **Main function**: Entry point via `_start` export
- **WASI imports**: `wasi_snapshot_preview1` imports
- **Argument parsing**: Handle command line args via WASI
- **Output**: Write results to stdout (fd 1)

## GHC WASM Build Example
Based on your build.yml:
```bash
ghc -O2 -threaded --make Main.hs -o bin.wasm
```

## Status Indicator
The colored dot shows:
- 🟢 **Connected**: WASM loaded and ready
- 🟡 **Connecting**: Loading WASM file
- 🔴 **Error**: Failed to load or CORS issue
- ⚫ **Disconnected**: Initial state

## CORS Configuration
Ensure `files.cuichen.cc` serves the WASM file with proper headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Content-Type: application/wasm
```

## Testing
1. Upload your `bin.wasm` to `files.cuichen.cc/`
2. Ensure proper CORS headers for cross-origin loading
3. Test with command: `infer --alg W "(\x. x) 1"`
4. Verify stdout output format