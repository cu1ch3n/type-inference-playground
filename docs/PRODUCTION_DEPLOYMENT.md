# Production Deployment Guide

This guide provides comprehensive instructions for deploying the Type Inference Playground in a production environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security Considerations](#security-considerations)
- [CDN Configuration](#cdn-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 18+ or Docker
- 2GB+ RAM
- 10GB+ disk space
- SSL certificate for HTTPS

### Dependencies
```bash
# Install production dependencies
npm ci --only=production

# Or use package managers
yarn install --production
pnpm install --prod
```

## Build Configuration

### 1. Environment Variables

Create a `.env.production` file:

```env
# Application
VITE_APP_TITLE="Type Inference Playground"
VITE_APP_DESCRIPTION="Interactive type inference learning tool"
VITE_APP_VERSION="1.0.0"

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
VITE_POSTHOG_KEY="your-posthog-key"

# WASM Configuration
VITE_WASM_ENABLED="true"
VITE_WASM_PATH="/wasm"

# Error Reporting
VITE_SENTRY_DSN="your-sentry-dsn"

# Performance
VITE_ENABLE_SW="true"
VITE_ENABLE_COMPRESSION="true"
```

### 2. Build Scripts

Update `package.json` with production scripts:

```json
{
  "scripts": {
    "build:prod": "npm run wasm:build && vite build",
    "build:docker": "docker build -t type-inference-playground .",
    "preview:prod": "vite preview --host",
    "analyze": "npm run build:prod && npx vite-bundle-analyzer dist"
  }
}
```

### 3. Production Build

```bash
# Standard build
npm run build:prod

# With bundle analysis
npm run analyze

# Docker build
npm run build:docker
```

## Environment Setup

### Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          katex: ['katex'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
});
```

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build application
RUN npm run build:prod

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy WASM files
COPY --from=builder /app/public/wasm /usr/share/nginx/html/wasm

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration (`nginx.conf`)

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        application/javascript
        application/json
        application/wasm
        text/css
        text/javascript
        text/xml
        text/plain;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # WASM files
        location ~* \.wasm$ {
            add_header Content-Type application/wasm;
            add_header Cross-Origin-Embedder-Policy require-corp;
            add_header Cross-Origin-Opener-Policy same-origin;
            expires 1y;
        }

        # Static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Docker Compose

```yaml
version: '3.8'

services:
  type-inference-playground:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Cloud Deployment

### AWS Deployment

#### Using AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Using AWS S3 + CloudFront

```bash
# Build application
npm run build:prod

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/wasm/(.*)",
      "headers": {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Netlify Deployment

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build:prod"

[[headers]]
  for = "/wasm/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Performance Optimization

### 1. Code Splitting

```typescript
// src/utils/lazyLoading.ts
import { lazy } from 'react';

export const AlgorithmSelector = lazy(() => import('../components/AlgorithmSelector'));
export const DerivationViewer = lazy(() => import('../components/DerivationViewer'));
```

### 2. Service Worker

```typescript
// src/sw.ts
const CACHE_NAME = 'type-inference-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/wasm/haskell-inference.wasm'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### 3. Bundle Optimization

```bash
# Analyze bundle
npm run analyze

# Tree-shake unused code
npm install -D vite-plugin-windicss

# Preload critical resources
npm install -D vite-plugin-preload
```

## Monitoring & Analytics

### Error Monitoring with Sentry

```typescript
// src/utils/monitoring.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});

export { Sentry };
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  static measureInference(algorithm: string, expression: string) {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        
        // Log to analytics
        if (window.gtag) {
          window.gtag('event', 'inference_completed', {
            algorithm,
            duration,
            expression_length: expression.length
          });
        }
        
        return duration;
      }
    };
  }
}
```

## Security Considerations

### 1. Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.github.com;
  worker-src 'self' blob:;
">
```

### 2. WASM Security

```typescript
// src/utils/wasmSecurity.ts
export class WasmSecurity {
  static validateWasmModule(module: WebAssembly.Module): boolean {
    try {
      // Basic validation
      const exports = WebAssembly.Module.exports(module);
      const requiredExports = ['run_inference', 'memory'];
      
      return requiredExports.every(exportName => 
        exports.some(exp => exp.name === exportName)
      );
    } catch {
      return false;
    }
  }
}
```

## CDN Configuration

### CloudFlare Configuration

```javascript
// cloudflare-workers.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Cache WASM files for 1 year
  if (url.pathname.endsWith('.wasm')) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000');
    newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    
    return newResponse;
  }
  
  return fetch(request);
}
```

## Troubleshooting

### Common Issues

1. **WASM Loading Failures**
   ```bash
   # Check MIME types
   curl -I https://yoursite.com/wasm/inference.wasm
   
   # Verify headers
   curl -H "Origin: https://yoursite.com" -I https://yoursite.com/wasm/inference.wasm
   ```

2. **Performance Issues**
   ```bash
   # Lighthouse audit
   npm install -g lighthouse
   lighthouse https://yoursite.com --view
   ```

3. **Memory Issues**
   ```javascript
   // Monitor memory usage
   if (performance.memory) {
     console.log('Memory:', performance.memory);
   }
   ```

### Debugging Production

```typescript
// src/utils/debug.ts
export class ProductionDebug {
  static enable() {
    if (import.meta.env.PROD && location.search.includes('debug=true')) {
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = { onCommitFiberRoot: () => {} };
      localStorage.setItem('debug', 'true');
    }
  }
}
```

### Health Checks

```typescript
// src/utils/healthcheck.ts
export async function healthCheck(): Promise<boolean> {
  try {
    // Check WASM availability
    const wasmSupported = typeof WebAssembly === 'object';
    
    // Check critical resources
    const criticalResources = await Promise.all([
      fetch('/wasm/inference.wasm').then(r => r.ok),
      // Add other critical checks
    ]);
    
    return wasmSupported && criticalResources.every(Boolean);
  } catch {
    return false;
  }
}
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] WASM files properly served with correct MIME types
- [ ] CORS headers configured for WASM
- [ ] SSL certificate installed
- [ ] Gzip compression enabled
- [ ] Cache headers configured
- [ ] Security headers implemented
- [ ] Error monitoring setup
- [ ] Performance monitoring configured
- [ ] Health checks implemented
- [ ] Backup strategy in place
- [ ] Rollback plan prepared

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Monitor Performance**
   ```bash
   lighthouse https://yoursite.com --output json > performance.json
   ```

3. **Check Logs**
   ```bash
   docker logs type-inference-playground
   ```

4. **Security Scans**
   ```bash
   npm audit --audit-level moderate
   ```

This deployment guide ensures your Type Inference Playground runs efficiently and securely in production while maintaining optimal performance for educational use.