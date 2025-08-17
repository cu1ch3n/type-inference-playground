# WASM Service Protocol Documentation

## Overview
The frontend communicates with the WASM service at `wasm.zoo.cuichen.cc` via HTTP REST API calls.

## Cross-Domain Configuration
Since the frontend (`zoo.cuichen.cc`) and WASM service (`wasm.zoo.cuichen.cc`) are on different subdomains, CORS is properly configured:

- **Mode**: `cors` is explicitly set in fetch requests
- **Headers**: Standard JSON content-type headers
- **Methods**: GET for health checks, POST for inference requests

## API Endpoints

### Health Check
**Endpoint**: `GET /health`
**Purpose**: Verify service availability
**Response**: 
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### Type Inference
**Endpoint**: `POST /inference`
**Purpose**: Run type inference algorithms

**Request Format**:
```json
{
  "algorithm": "hindley-milner" | "bidirectional" | "gradual",
  "expression": "\\x -> x + 1",
  "options": {
    "showSteps": true,
    "maxDepth": 100
  }
}
```

**Response Format**:
```json
{
  "success": true,
  "result": {
    "type": "Int -> Int",
    "environment": {...}
  },
  "steps": [
    {
      "step": 1,
      "rule": "T-Abs",
      "context": {...},
      "conclusion": {...}
    }
  ]
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Parse error: unexpected token"
}
```

## CORS Requirements for Your WASM Service

Your `wasm.zoo.cuichen.cc` service should include these headers:

```
Access-Control-Allow-Origin: https://zoo.cuichen.cc
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Access-Control-Max-Age: 86400
```

## Integration Flow

1. **Initialization**: Frontend calls `/health` to verify service availability
2. **Inference**: User triggers inference → Frontend sends POST to `/inference`
3. **Response**: WASM service processes and returns structured result
4. **Display**: Frontend renders derivation tree and typing rules

## Error Handling

- **Network errors**: Graceful fallback to mock inference
- **Parse errors**: Display user-friendly error messages
- **Timeout**: 10-second timeout with error recovery
- **CORS issues**: Clear error messaging for debugging

## Testing the Integration

1. Deploy your WASM service to `wasm.zoo.cuichen.cc`
2. Ensure CORS headers are properly set
3. Test health endpoint: `curl https://wasm.zoo.cuichen.cc/health`
4. Test inference with sample data
5. Monitor network tab for CORS and timing issues