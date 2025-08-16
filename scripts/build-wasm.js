#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WASM_INTERFACE_PATH = path.join(__dirname, '../src/lib/wasmInterface.ts');

function enableWasmInterface() {
  let content = fs.readFileSync(WASM_INTERFACE_PATH, 'utf8');
  
  // Uncomment the initialization code
  content = content.replace(
    /\/\* UNCOMMENT TO ENABLE WASM[\s\S]*?\*\//g,
    (match) => {
      return match
        .replace(/\/\* UNCOMMENT TO ENABLE WASM\n/, '')
        .replace(/\n\*\//, '')
        .replace(/^\/\/ /gm, '');
    }
  );
  
  fs.writeFileSync(WASM_INTERFACE_PATH, content);
  console.log('✅ WASM interface enabled');
}

function disableWasmInterface() {
  let content = fs.readFileSync(WASM_INTERFACE_PATH, 'utf8');
  
  // Comment out the initialization code
  const wasmInitStart = content.indexOf('let wasmModule: any = null;');
  const wasmInitEnd = content.indexOf('export { initializeWasm, getWasmModule };');
  
  if (wasmInitStart !== -1 && wasmInitEnd !== -1) {
    const beforeWasm = content.substring(0, wasmInitStart);
    const wasmSection = content.substring(wasmInitStart, wasmInitEnd + 'export { initializeWasm, getWasmModule };'.length);
    const afterWasm = content.substring(wasmInitEnd + 'export { initializeWasm, getWasmModule };'.length);
    
    const commentedWasm = '/* UNCOMMENT TO ENABLE WASM\n' + 
      wasmSection.replace(/^/gm, '// ') + 
      '\n*/';
    
    content = beforeWasm + commentedWasm + afterWasm;
    fs.writeFileSync(WASM_INTERFACE_PATH, content);
  }
  
  console.log('✅ WASM interface disabled');
}

const command = process.argv[2];

switch (command) {
  case 'enable':
    enableWasmInterface();
    console.log('🚀 Run `npm run dev` to start with WASM support');
    break;
  case 'disable':
    disableWasmInterface();
    console.log('🚀 Run `npm run dev` to start without WASM support');
    break;
  case 'build':
    enableWasmInterface();
    console.log('🔧 Building with WASM support...');
    execSync('npm run build', { stdio: 'inherit' });
    break;
  default:
    console.log(`
Usage: node scripts/build-wasm.js <command>

Commands:
  enable   - Enable WASM interface for development
  disable  - Disable WASM interface (pure frontend)
  build    - Build production version with WASM support

Examples:
  npm run wasm:enable    # Enable WASM
  npm run wasm:disable   # Disable WASM  
  npm run wasm:build     # Build with WASM
`);
}