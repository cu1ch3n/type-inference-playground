// WASM Interface for Type Inference Engines
// Configured for wasm.zoo.cuichen.cc external service

export interface WasmMessage {
  type: 'inference_request' | 'inference_response' | 'error';
  data: InferenceRequest | InferenceResponse | { message: string };
}

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
  private wasmServiceUrl: string;
  private isInitialized = false;
  
  constructor(serviceUrl = 'https://wasm.zoo.cuichen.cc') {
    this.wasmServiceUrl = serviceUrl;
    // eslint-disable-next-line no-console
    console.log(`WASM service configured for: ${this.wasmServiceUrl}`);
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Test connection to WASM service
      const response = await fetch(`${this.wasmServiceUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        this.isInitialized = true;
        // eslint-disable-next-line no-console
        console.log(`✅ WASM service connected: ${this.wasmServiceUrl}`);
        return true;
      } else {
        // eslint-disable-next-line no-console
        console.warn(`WASM service not available: ${response.status}`);
        return false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to connect to WASM service:', error);
      return false;
    }
  }

  async runInference(request: InferenceRequest): Promise<InferenceResponse> {
    if (!this.isInitialized) {
      // Try to initialize if not already done
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('WASM service not available');
      }
    }

    try {
      const response = await fetch(`${this.wasmServiceUrl}/inference`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: InferenceResponse = await response.json();
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WASM inference error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  destroy() {
    this.isInitialized = false;
    // eslint-disable-next-line no-console
    console.log('WASM service connection closed');
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