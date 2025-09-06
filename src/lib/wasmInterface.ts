// WASM Interface for Type Inference Engines using WASI
// This is a flexible interface that can work with different WASM modules
// Default: type-inference-zoo-wasm, but supports any compatible WASM engine
import { ConsoleStdout, WASI } from "@bjorn3/browser_wasi_shim";

interface WasmSource {
  id: string;
  name: string;
  url: string;
  authType?: 'none' | 'bearer' | 'basic' | 'header' | 'presigned';
  authToken?: string;
  authHeader?: string;
  authUsername?: string;
  authPassword?: string;
  isLocal?: boolean;
  createdAt: number;
}

export interface InferenceRequest {
  algorithm: string;
  variant?: string;
  expression: string;
  options?: {
    showSteps?: boolean;
    maxDepth?: number;
  };
}

export interface SubtypingRequest {
  algorithm: string;
  variant: string;
  leftType: string;
  rightType: string;
  options?: {
    showSteps?: boolean;
    maxDepth?: number;
  };
}

export interface MetadataRequest {
  command: "--meta";
}

export interface InferenceResponse {
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  steps?: Array<Record<string, unknown>>;
}

export interface SubtypingResponse {
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  steps?: Array<Record<string, unknown>>;
}

export class WasmTypeInference {
  private wasmModule: WebAssembly.Module | null = null;
  private wasmSource: WasmSource;
  private isInitialized = false;
  private outputBuffer = '';
  
  constructor(wasmUrl = 'https://files.typ.how/zoo.wasm') {
    this.wasmSource = {
      id: 'default',
      name: 'Default WASM',
      url: wasmUrl,
      authType: 'none',
      isLocal: false,
      createdAt: Date.now()
    };
    // eslint-disable-next-line no-console
    console.log(`Type Inference Playground initialized with WASM: ${this.wasmSource.url}`);
  }

  updateWasmUrl(newUrl: string) {
    if (this.wasmSource.url !== newUrl) {
      this.wasmSource = {
        ...this.wasmSource,
        url: newUrl,
        id: Date.now().toString(),
        createdAt: Date.now()
      };
      // Reset initialization when URL changes
      this.wasmModule = null;
      this.isInitialized = false;
      // eslint-disable-next-line no-console
      console.log(`WASM engine switched to: ${this.wasmSource.url}`);
    }
  }

  updateWasmSource(newSource: WasmSource) {
    if (this.wasmSource.url !== newSource.url || 
        this.wasmSource.authType !== newSource.authType ||
        this.wasmSource.authToken !== newSource.authToken ||
        this.wasmSource.authHeader !== newSource.authHeader ||
        this.wasmSource.authUsername !== newSource.authUsername ||
        this.wasmSource.authPassword !== newSource.authPassword) {
      this.wasmSource = { ...newSource };
      // Reset initialization when source changes
      this.wasmModule = null;
      this.isInitialized = false;
      // eslint-disable-next-line no-console
      console.log(`WASM engine switched to: ${this.wasmSource.name} (${this.wasmSource.url})`);
    }
  }

  getWasmUrl(): string {
    return this.wasmSource.url;
  }

  getWasmSource(): WasmSource {
    return { ...this.wasmSource };
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Load WASM file with authentication support
      const headers: Record<string, string> = {
        'Accept': 'application/wasm',
      };
      
      // Add authentication headers based on auth type
      switch (this.wasmSource.authType) {
        case 'bearer':
          if (this.wasmSource.authToken) {
            headers['Authorization'] = `Bearer ${this.wasmSource.authToken}`;
          }
          break;
        case 'basic':
          if (this.wasmSource.authUsername && this.wasmSource.authPassword) {
            const credentials = btoa(`${this.wasmSource.authUsername}:${this.wasmSource.authPassword}`);
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'header':
          if (this.wasmSource.authHeader) {
            const [key, value] = this.wasmSource.authHeader.split(': ', 2);
            if (key && value) {
              headers[key.trim()] = value.trim();
            }
          }
          break;
        case 'presigned':
          // For pre-signed URLs, no additional headers needed
          break;
        default:
          // No authentication
          break;
      }

      console.log(`Loading WASM from: ${this.wasmSource.name} (${this.wasmSource.url})`);
      
      const response = await fetch(this.wasmSource.url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'omit', // Don't send cookies for CORS
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`);
      }
      
      const wasmBytes = await response.arrayBuffer();
      this.wasmModule = await WebAssembly.compile(wasmBytes);
      this.isInitialized = true;
      
      console.log(`✅ Type inference engine loaded: ${this.wasmSource.url} (${wasmBytes.byteLength} bytes)`);
      return true;
    } catch (error) {
      console.error('Failed to load WASM module:', error);
      return false;
    }
  }

  async runInference(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('WASM module not available');
      }
    }

    try {
      if (!this.wasmModule) {
        throw new Error('WASM module not loaded');
      }

      // Reset output buffer
      this.outputBuffer = '';

      // Prepare command line arguments exactly like your original implementation
      const args = request.variant 
        ? ['infer', '--typing', request.algorithm, '--variant', request.variant, request.expression]
        : ['infer', '--typing', request.algorithm, request.expression];
      const env: string[] = [];
      
      const fds = [
        null, // stdin
        ConsoleStdout.lineBuffered((msg) => {
          this.outputBuffer += `${msg}\n`;
        }),
      ];

      const wasi = new WASI(args, env, fds);
      const instance = await WebAssembly.instantiate(this.wasmModule, {
        wasi_snapshot_preview1: wasi.wasiImport,
      });

      wasi.start(instance as any);

      // Parse output as JSON or return as text
      const output = this.outputBuffer.trim();

      console.log(output);
      try {
        const result = JSON.parse(output);
        return {
          success: true,
          result,
          steps: result.steps || []
        };
      } catch {
        // If not JSON, return as text result
        return {
          success: true,
          result: { type: output },
          steps: []
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WASM inference error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown WASM error',
      };
    }
  }

  async runSubtyping(request: SubtypingRequest): Promise<SubtypingResponse> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('WASM module not available');
      }
    }

    try {
      if (!this.wasmModule) {
        throw new Error('WASM module not loaded');
      }

      // Reset output buffer
      this.outputBuffer = '';

      // Prepare command line arguments for subtyping
      const args = request.variant  
        ? ['infer', '--subtyping', request.algorithm, '--variant', request.variant, request.leftType, request.rightType]
        : ['infer', '--subtyping', request.algorithm, request.leftType, request.rightType];
      const env: string[] = [];
      
      const fds = [
        null, // stdin
        ConsoleStdout.lineBuffered((msg) => {
          this.outputBuffer += `${msg}\n`;
        }),
      ];

      const wasi = new WASI(args, env, fds);
      const instance = await WebAssembly.instantiate(this.wasmModule, {
        wasi_snapshot_preview1: wasi.wasiImport,
      });

      wasi.start(instance as any);

      // Parse output as JSON or return as text
      const output = this.outputBuffer.trim();

      console.log(output);
      try {
        const result = JSON.parse(output);
        return {
          success: true,
          result,
          steps: result.steps || []
        };
      } catch {
        // If not JSON, return as text result
        return {
          success: true,
          result: { type: output },
          steps: []
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WASM subtyping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown WASM error',
      };
    }
  }


  async getMetadata(): Promise<import('@/types/inference').TypeInferenceAlgorithm[]> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('WASM module not available');
      }
    }

    try {
      if (!this.wasmModule) {
        throw new Error('WASM module not loaded');
      }

      // Reset output buffer
      this.outputBuffer = '';

      // Prepare command line arguments for metadata
      const args = ['infer', '--meta'];
      const env: string[] = [];
      
      const fds = [
        null, // stdin
        ConsoleStdout.lineBuffered((msg) => {
          this.outputBuffer += `${msg}\n`;
        }),
      ];

      const wasi = new WASI(args, env, fds);
      const instance = await WebAssembly.instantiate(this.wasmModule, {
        wasi_snapshot_preview1: wasi.wasiImport,
      });

      wasi.start(instance as any);

      // Parse output as JSON
      const output = this.outputBuffer.trim();
      
      try {
        return JSON.parse(output);
      } catch {
        throw new Error('Failed to parse metadata JSON from WASM');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WASM metadata error:', error);
      throw error;
    }
  }

  destroy() {
    this.wasmModule = null;
    this.isInitialized = false;
    // eslint-disable-next-line no-console
    console.log('Type inference engine unloaded');
  }
}

// Global instance - defaults to type-inference-zoo-wasm
// Can be reconfigured to use different WASM engines via settings
export const wasmInference = new WasmTypeInference();