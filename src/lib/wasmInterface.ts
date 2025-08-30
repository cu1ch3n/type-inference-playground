// WASM Interface for Type Inference Engines using WASI
// This is a flexible interface that can work with different WASM modules
// Default: type-inference-zoo-wasm, but supports any compatible WASM engine
import { ConsoleStdout, WASI } from "@bjorn3/browser_wasi_shim";

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
  private wasmUrl: string;
  private isInitialized = false;
  private outputBuffer = '';
  
  constructor(wasmUrl = 'https://files.cuichen.cc/zoo.wasm') {
    this.wasmUrl = wasmUrl;
    // eslint-disable-next-line no-console
    console.log(`Type Inference Playground initialized with WASM: ${this.wasmUrl}`);
  }

  updateWasmUrl(newUrl: string) {
    if (this.wasmUrl !== newUrl) {
      this.wasmUrl = newUrl;
      // Reset initialization when URL changes
      this.wasmModule = null;
      this.isInitialized = false;
      // eslint-disable-next-line no-console
      console.log(`WASM engine switched to: ${this.wasmUrl}`);
    }
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Load WASM file directly
      const response = await fetch(this.wasmUrl, {
        mode: 'cors',
        cache: 'default'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.status}`);
      }
      
      const wasmBytes = await response.arrayBuffer();
      this.wasmModule = await WebAssembly.compile(wasmBytes);
      this.isInitialized = true;
      
      // eslint-disable-next-line no-console
      console.log(`✅ Type inference engine loaded: ${this.wasmUrl}`);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
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

  getWasmUrl(): string {
    return this.wasmUrl;
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