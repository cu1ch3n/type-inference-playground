# Cloudflare R2 Private WASM Hosting Guide

## Overview
This guide covers different methods to host private WASM files on Cloudflare R2 with various authentication mechanisms.

## Authentication Methods

### 1. Pre-signed URLs (Recommended for most cases)
**Best for**: Time-limited access, simple implementation
**Pros**: Secure, no additional headers needed, works with CORS
**Cons**: URLs expire, need to regenerate periodically

```javascript
// Generate pre-signed URL (backend/edge function)
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

const command = new GetObjectCommand({
  Bucket: 'your-bucket',
  Key: 'path/to/your.wasm',
});

const signedUrl = await getSignedUrl(s3Client, command, { 
  expiresIn: 3600 // 1 hour
});
```

### 2. Cloudflare Access (Enterprise)
**Best for**: Enterprise customers, fine-grained access control
**Pros**: Integrates with identity providers, very secure
**Cons**: Requires Cloudflare Access subscription

Set up Cloudflare Access rules for your R2 custom domain and use JWT tokens.

### 3. Custom Authorization Headers
**Best for**: API-key based access, simple token validation
**Pros**: Simple to implement, long-lived tokens
**Cons**: Need to handle CORS properly

```javascript
// Cloudflare Worker to validate custom headers
export default {
  async fetch(request) {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey || apiKey !== EXPECTED_API_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Proxy to R2
    const r2Response = await fetch(R2_URL, request);
    
    // Add CORS headers
    const response = new Response(r2Response.body, r2Response);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'X-API-Key');
    
    return response;
  }
};
```

### 4. Bearer Token Authentication
**Best for**: OAuth-style authentication, integration with existing auth systems
**Pros**: Standard, works with many auth systems
**Cons**: More complex setup

```javascript
// Cloudflare Worker with Bearer token validation
export default {
  async fetch(request) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Validate token (could be JWT, database lookup, etc.)
    if (!await validateToken(token)) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Proxy to R2 with CORS headers
    const r2Response = await fetch(R2_URL, request);
    const response = new Response(r2Response.body, r2Response);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization');
    
    return response;
  }
};
```

## Implementation Steps

### 1. Set up R2 Bucket
```bash
# Create bucket
wrangler r2 bucket create your-wasm-bucket

# Upload WASM files
wrangler r2 object put your-wasm-bucket/module.wasm --file ./module.wasm
```

### 2. Configure Custom Domain (Optional but recommended)
```toml
# wrangler.toml
[[r2_buckets]]
binding = "WASM_BUCKET"
bucket_name = "your-wasm-bucket"
```

### 3. Create Cloudflare Worker for Authentication
```javascript
// worker.js
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Authorization, X-API-Key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Your authentication logic here
    
    // Proxy to R2
    const objectKey = new URL(request.url).pathname.substring(1);
    const object = await env.WASM_BUCKET.get(objectKey);
    
    if (!object) {
      return new Response('Not Found', { status: 404 });
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/wasm',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
};
```

## Security Considerations

1. **CORS Configuration**: Ensure proper CORS headers for browser access
2. **Token Rotation**: Regularly rotate API keys and tokens
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Logging**: Log access attempts for security monitoring
5. **HTTPS Only**: Always use HTTPS for token transmission

## Cost Optimization

1. **Caching**: Set appropriate cache headers to reduce R2 requests
2. **CDN**: Use Cloudflare CDN to cache WASM files globally
3. **Compression**: Consider compressing WASM files if supported by your loader

## Example Usage in Your App

```typescript
// In your WASM settings modal
const addCloudflareR2Source = () => {
  const source = {
    name: 'My Private WASM',
    url: 'https://your-worker.your-domain.workers.dev/module.wasm',
    authType: 'bearer', // or 'header' or 'presigned'
    authToken: 'your-bearer-token', // if using bearer
    authHeader: 'X-API-Key: your-api-key', // if using custom header
  };
  
  // Add to your sources list
};
```

## Recommendations

1. **For development**: Use pre-signed URLs for simplicity
2. **For production**: Use Cloudflare Access if available, otherwise custom headers
3. **For public APIs**: Consider rate-limited public access with API keys
4. **For sensitive modules**: Use short-lived pre-signed URLs with refresh mechanism