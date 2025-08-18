// WASM Interface for Type Inference Engines using WASI
// Based on your type-inference-zoo implementation
import { ConsoleStdout, WASI } from "@bjorn3/browser_wasi_shim";

export interface InferenceRequest {
  algorithm: string;
  expression: string;
  options?: {
    showSteps?: boolean;
    maxDepth?: number;
  };
}

export interface InferenceResponse {
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
  
  constructor(wasmUrl = '/bin.wasm') {
    this.wasmUrl = wasmUrl;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`WASM configured for: ${this.wasmUrl}`);
    }
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Create AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      
      // Load WASM file directly
      const response = await fetch(this.wasmUrl, {
        mode: 'cors',
        cache: 'default',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.status}`);
      }
      
      const wasmBytes = await response.arrayBuffer();
      
      // Basic integrity check - ensure we got a valid WASM file
      if (wasmBytes.byteLength < 8) {
        throw new Error('Invalid WASM file: too small');
      }
      
      // Check WASM magic number (0x6d736100)
      const magicNumber = new Uint32Array(wasmBytes.slice(0, 4))[0];
      if (magicNumber !== 0x6d736100) {
        throw new Error('Invalid WASM file: incorrect magic number');
      }
      
      this.wasmModule = await WebAssembly.compile(wasmBytes);
      this.isInitialized = true;
      
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`✅ WASM module loaded: ${this.wasmUrl}`);
      }
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Failed to load WASM module:', error);
      }
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
      const args = ['infer', '--alg', request.algorithm, request.expression];
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

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(output);
      }
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
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('WASM inference error:', error);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown WASM error',
      };
    }
  }

  destroy() {
    this.wasmModule = null;
    this.isInitialized = false;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('WASM module unloaded');
    }
  }
}

/* UNCOMMENT TO ENABLE WASM
// Global WASM interface - uncommented when WASM is enabled
let wasmModule: Record<string, unknown> | null = null;
let wasmWorker: Worker | null = null;

export async function initializeWasm(): Promise<boolean> {
  try {
    wasmWorker = new Worker('/wasm/inference-worker.js');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      
      wasmWorker?.addEventListener('message', (event) => {
        if (event.data.type === 'wasm_ready') {
          clearTimeout(timeout);
          wasmModule = event.data.module;
          // eslint-disable-next-line no-console
          console.log('✅ WASM module initialized successfully');
          resolve(true);
        }
      });
      
      wasmWorker?.postMessage({ type: 'init' });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize WASM:', error);
    return false;
  }
}

export function getWasmModule() {
  return wasmModule;
}

export { initializeWasm, getWasmModule };
*/

// Global instance (disabled by default)
export const wasmInference = new WasmTypeInference();