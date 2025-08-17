# Haskell WASM Integration Guide

This guide provides comprehensive instructions for integrating Haskell-based type inference algorithms as WebAssembly modules in the Type Inference Playground.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setting up the Haskell Environment](#setting-up-the-haskell-environment)
- [Creating the Haskell Type Inference Module](#creating-the-haskell-type-inference-module)
- [Compiling to WebAssembly](#compiling-to-webassembly)
- [JavaScript Interface](#javascript-interface)
- [Integration with the Playground](#integration-with-the-playground)
- [Testing and Debugging](#testing-and-debugging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

This integration allows you to run sophisticated Haskell type inference algorithms directly in the browser using WebAssembly, providing:

- Native Haskell performance
- Access to advanced type system features
- Seamless integration with the web interface
- Real-time type inference feedback

## Prerequisites

### System Requirements
- GHC 9.2+ with WASM backend support
- Node.js 18+
- Emscripten SDK
- wasm-pack (for alternative Rust integration)

### Installation

```bash
# Install GHC with WASM support
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
ghcup install ghc 9.6.3
ghcup install wasm32-wasi-ghc 9.6.3

# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Install additional tools
npm install -g wasm-pack
```

## Setting up the Haskell Environment

### Project Structure

```
haskell-inference/
├── src/
│   ├── TypeInference/
│   │   ├── AlgorithmW.hs
│   │   ├── Worklist.hs
│   │   ├── Unification.hs
│   │   └── Types.hs
│   ├── Parser/
│   │   ├── Lambda.hs
│   │   └── Pretty.hs
│   ├── FFI/
│   │   └── Interface.hs
│   └── Main.hs
├── wasm/
│   └── inference-worker.js
├── package.yaml
├── stack.yaml
└── Makefile
```

### Stack Configuration (`stack.yaml`)

```yaml
resolver: lts-21.22

packages:
- .

extra-deps:
- wasm32-wasi-ghc-9.6.3

ghc-options:
  "$locals": -Wall -Wcompat -Widentities -Wincomplete-record-updates
  
flags:
  wasm: true

compiler: wasm32-wasi-ghc-9.6.3
compiler-check: newer-minor
```

### Package Configuration (`package.yaml`)

```yaml
name: haskell-type-inference
version: 1.0.0
description: Haskell type inference algorithms compiled to WASM

dependencies:
- base >= 4.16
- containers >= 0.6
- text >= 1.2
- aeson >= 2.0
- bytestring >= 0.11
- mtl >= 2.3

when:
  - condition: flag(wasm)
    dependencies:
    - wasm-compat
    ghc-options:
    - -no-hs-main
    - -optl-Wl,--export=run_inference
    - -optl-Wl,--export=malloc
    - -optl-Wl,--export=free

library:
  source-dirs: src
  exposed-modules:
  - TypeInference.AlgorithmW
  - TypeInference.Worklist
  - FFI.Interface

executables:
  haskell-inference:
    main: Main.hs
    source-dirs: src
    dependencies:
    - haskell-type-inference
```

## Creating the Haskell Type Inference Module

### Core Types (`src/TypeInference/Types.hs`)

```haskell
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}

module TypeInference.Types where

import Data.Aeson
import Data.Map (Map)
import qualified Data.Map as Map
import Data.Set (Set)
import qualified Data.Set as Set
import Data.Text (Text)
import GHC.Generics

-- Lambda calculus expressions
data Expr
  = Var Text
  | Lam Text Expr
  | App Expr Expr
  | Let Text Expr Expr
  | Ann Expr Type
  deriving (Show, Eq, Generic)

instance ToJSON Expr
instance FromJSON Expr

-- Type system
data Type
  = TVar Text
  | TFun Type Type
  | TCon Text
  | TForall Text Type
  deriving (Show, Eq, Generic)

instance ToJSON Type
instance FromJSON Type

-- Type schemes (for let-polymorphism)
data Scheme = Forall [Text] Type
  deriving (Show, Eq, Generic)

instance ToJSON Scheme
instance FromJSON Scheme

-- Type environment
type TypeEnv = Map Text Scheme

-- Substitutions
type Subst = Map Text Type

-- Inference result
data InferenceResult = InferenceResult
  { success :: Bool
  , finalType :: Maybe Type
  , derivation :: [DerivationStep]
  , errors :: [TypeError]
  , metadata :: ResultMetadata
  } deriving (Show, Generic)

instance ToJSON InferenceResult
instance FromJSON InferenceResult

data DerivationStep = DerivationStep
  { stepId :: Text
  , ruleId :: Text
  , expression :: Expr
  , inferredType :: Maybe Type
  , children :: [DerivationStep]
  , explanation :: Maybe Text
  } deriving (Show, Generic)

instance ToJSON DerivationStep
instance FromJSON DerivationStep

data TypeError = TypeError
  { errorType :: Text
  , errorMessage :: Text
  , errorLocation :: Maybe SourceLocation
  , suggestions :: [Text]
  } deriving (Show, Generic)

instance ToJSON TypeError
instance FromJSON TypeError

data SourceLocation = SourceLocation
  { line :: Int
  , column :: Int
  , length :: Maybe Int
  } deriving (Show, Generic)

instance ToJSON SourceLocation
instance FromJSON SourceLocation

data ResultMetadata = ResultMetadata
  { algorithm :: Text
  , duration :: Double
  , steps :: Int
  , wasmUsed :: Bool
  } deriving (Show, Generic)

instance ToJSON ResultMetadata
instance FromJSON ResultMetadata
```

### Algorithm W Implementation (`src/TypeInference/AlgorithmW.hs`)

```haskell
{-# LANGUAGE OverloadedStrings #-}

module TypeInference.AlgorithmW where

import Control.Monad.State
import Control.Monad.Except
import Data.Map (Map)
import qualified Data.Map as Map
import Data.Set (Set)
import qualified Data.Set as Set
import Data.Text (Text)
import qualified Data.Text as T

import TypeInference.Types

-- Inference monad
type Infer a = ExceptT TypeError (State InferState) a

data InferState = InferState
  { inferSupply :: Int
  , inferSubst :: Subst
  , inferSteps :: [DerivationStep]
  } deriving Show

-- Run inference
runInfer :: Infer a -> Either TypeError (a, InferState)
runInfer m = runState (runExceptT m) initInfer
  where
    initInfer = InferState { inferSupply = 0, inferSubst = Map.empty, inferSteps = [] }

-- Generate fresh type variables
fresh :: Infer Type
fresh = do
  s <- get
  put s { inferSupply = inferSupply s + 1 }
  return $ TVar $ "t" <> T.pack (show $ inferSupply s)

-- Apply substitution to types
class Substitutable a where
  apply :: Subst -> a -> a
  ftv :: a -> Set Text

instance Substitutable Type where
  apply s (TVar a) = Map.findWithDefault (TVar a) a s
  apply s (TFun t1 t2) = TFun (apply s t1) (apply s t2)
  apply s (TCon a) = TCon a
  apply s (TForall a t) = TForall a (apply (Map.delete a s) t)

  ftv (TVar a) = Set.singleton a
  ftv (TFun t1 t2) = ftv t1 `Set.union` ftv t2
  ftv (TCon _) = Set.empty
  ftv (TForall a t) = Set.delete a (ftv t)

instance Substitutable Scheme where
  apply s (Forall as t) = Forall as $ apply (foldr Map.delete s as) t
  ftv (Forall as t) = ftv t `Set.difference` Set.fromList as

instance Substitutable TypeEnv where
  apply s = Map.map (apply s)
  ftv env = foldr (Set.union . ftv) Set.empty (Map.elems env)

-- Unification
unify :: Type -> Type -> Infer Subst
unify (TFun l r) (TFun l' r') = do
  s1 <- unify l l'
  s2 <- unify (apply s1 r) (apply s1 r')
  return $ s2 `compose` s1

unify (TVar a) t = bind a t
unify t (TVar a) = bind a t
unify (TCon a) (TCon b) | a == b = return Map.empty
unify t1 t2 = throwError $ TypeError
  { errorType = "unification_error"
  , errorMessage = "Cannot unify " <> T.pack (show t1) <> " with " <> T.pack (show t2)
  , errorLocation = Nothing
  , suggestions = ["Check type annotations", "Verify function applications"]
  }

bind :: Text -> Type -> Infer Subst
bind a t
  | t == TVar a = return Map.empty
  | a `Set.member` ftv t = throwError $ TypeError
      { errorType = "occurs_check"
      , errorMessage = "Occurs check fails: " <> a <> " occurs in " <> T.pack (show t)
      , errorLocation = Nothing
      , suggestions = ["Check for infinite types", "Simplify recursive definitions"]
      }
  | otherwise = return $ Map.singleton a t

compose :: Subst -> Subst -> Subst
compose s1 s2 = Map.map (apply s1) s2 `Map.union` s1

-- Generalization and instantiation
generalize :: TypeEnv -> Type -> Scheme
generalize env t = Forall as t
  where as = Set.toList $ ftv t `Set.difference` ftv env

instantiate :: Scheme -> Infer Type
instantiate (Forall as t) = do
  as' <- mapM (const fresh) as
  let s = Map.fromList $ zip as as'
  return $ apply s t

-- Type inference
infer :: TypeEnv -> Expr -> Infer (Subst, Type)
infer env expr = case expr of
  Var x -> do
    addStep "Var" expr Nothing []
    case Map.lookup x env of
      Nothing -> throwError $ TypeError
        { errorType = "scope_error"
        , errorMessage = "Unbound variable: " <> x
        , errorLocation = Nothing
        , suggestions = ["Check variable spelling", "Ensure variable is in scope"]
        }
      Just scheme -> do
        t <- instantiate scheme
        return (Map.empty, t)

  Lam x e -> do
    tv <- fresh
    let env' = Map.insert x (Forall [] tv) env
    (s1, t1) <- infer env' e
    let resultType = TFun (apply s1 tv) t1
    addStep "Abs" expr (Just resultType) []
    return (s1, resultType)

  App e1 e2 -> do
    tv <- fresh
    (s1, t1) <- infer env e1
    (s2, t2) <- infer (apply s1 env) e2
    s3 <- unify (apply s2 t1) (TFun t2 tv)
    let resultType = apply s3 tv
    addStep "App" expr (Just resultType) []
    return (s3 `compose` s2 `compose` s1, resultType)

  Let x e1 e2 -> do
    (s1, t1) <- infer env e1
    let env' = apply s1 env
        t' = generalize env' t1
        env'' = Map.insert x t' env'
    (s2, t2) <- infer env'' e2
    addStep "Let" expr (Just t2) []
    return (s2 `compose` s1, t2)

  Ann e t -> do
    (s, t') <- infer env e
    s' <- unify t' t
    return (s' `compose` s, apply s' t)

addStep :: Text -> Expr -> Maybe Type -> [DerivationStep] -> Infer ()
addStep ruleId expr mType children = do
  s <- get
  let stepId = "step-" <> T.pack (show $ length $ inferSteps s)
      step = DerivationStep
        { stepId = stepId
        , ruleId = ruleId
        , expression = expr
        , inferredType = mType
        , children = children
        , explanation = Nothing
        }
  put s { inferSteps = step : inferSteps s }

-- Main inference function
algorithmW :: TypeEnv -> Expr -> InferenceResult
algorithmW env expr = case runInfer (infer env expr) of
  Left err -> InferenceResult
    { success = False
    , finalType = Nothing
    , derivation = []
    , errors = [err]
    , metadata = ResultMetadata "AlgW" 0 0 True
    }
  Right ((subst, typ), state) -> InferenceResult
    { success = True
    , finalType = Just $ apply subst typ
    , derivation = reverse $ inferSteps state
    , errors = []
    , metadata = ResultMetadata "AlgW" 0 (length $ inferSteps state) True
    }
```

### Worklist Algorithm (`src/TypeInference/Worklist.hs`)

```haskell
{-# LANGUAGE OverloadedStrings #-}

module TypeInference.Worklist where

import Control.Monad.State
import Control.Monad.Except
import Data.Map (Map)
import qualified Data.Map as Map
import Data.Text (Text)
import qualified Data.Text as T

import TypeInference.Types

-- Worklist-based inference (simplified version)
data Constraint
  = CEqual Type Type
  | CInstance Type Scheme
  | CGen TypeEnv Type Type
  deriving (Show, Eq)

type Worklist = [Constraint]

data WorklistState = WorklistState
  { wlSupply :: Int
  , wlSubst :: Subst
  , wlSteps :: [DerivationStep]
  } deriving Show

type WorklistM a = ExceptT TypeError (State WorklistState) a

runWorklist :: WorklistM a -> Either TypeError (a, WorklistState)
runWorklist m = runState (runExceptT m) initState
  where
    initState = WorklistState { wlSupply = 0, wlSubst = Map.empty, wlSteps = [] }

worklistInference :: TypeEnv -> Expr -> InferenceResult
worklistInference env expr = case runWorklist (generateConstraints env expr >>= solveConstraints) of
  Left err -> InferenceResult
    { success = False
    , finalType = Nothing
    , derivation = []
    , errors = [err]
    , metadata = ResultMetadata "WorklistDK" 0 0 True
    }
  Right (typ, state) -> InferenceResult
    { success = True
    , finalType = Just typ
    , derivation = reverse $ wlSteps state
    , errors = []
    , metadata = ResultMetadata "WorklistDK" 0 (length $ wlSteps state) True
    }

generateConstraints :: TypeEnv -> Expr -> WorklistM (Type, Worklist)
generateConstraints env expr = do
  -- Implementation details for constraint generation
  tv <- freshVar
  return (tv, [])  -- Simplified

solveConstraints :: (Type, Worklist) -> WorklistM Type
solveConstraints (typ, constraints) = do
  -- Implementation details for constraint solving
  return typ  -- Simplified

freshVar :: WorklistM Type
freshVar = do
  s <- get
  put s { wlSupply = wlSupply s + 1 }
  return $ TVar $ "α" <> T.pack (show $ wlSupply s)
```

### FFI Interface (`src/FFI/Interface.hs`)

```haskell
{-# LANGUAGE ForeignFunctionInterface #-}
{-# LANGUAGE OverloadedStrings #-}

module FFI.Interface where

import Data.Aeson
import Data.ByteString.Lazy (ByteString)
import qualified Data.ByteString.Lazy as L
import qualified Data.ByteString.Lazy.Char8 as L8
import Data.Text (Text)
import qualified Data.Text as T
import Foreign.C.String
import Foreign.C.Types
import Foreign.Marshal.Alloc
import Foreign.Ptr
import Foreign.Storable

import TypeInference.AlgorithmW
import TypeInference.Worklist
import TypeInference.Types
import Parser.Lambda

-- Request/Response types
data InferenceRequest = InferenceRequest
  { reqAlgorithm :: Text
  , reqExpression :: Text
  , reqOptions :: Maybe RequestOptions
  } deriving (Show, Generic)

instance FromJSON InferenceRequest

data RequestOptions = RequestOptions
  { optShowSteps :: Maybe Bool
  , optMaxDepth :: Maybe Int
  } deriving (Show, Generic)

instance FromJSON RequestOptions

-- Main inference function called from JavaScript
foreign export ccall "run_inference" runInference :: CString -> IO CString

runInference :: CString -> IO CString
runInference cstr = do
  input <- peekCString cstr
  let result = processInference input
  newCString $ L8.unpack $ encode result

processInference :: String -> InferenceResult
processInference input = case decode (L8.pack input) of
  Nothing -> InferenceResult
    { success = False
    , finalType = Nothing
    , derivation = []
    , errors = [TypeError "parsing_error" "Invalid JSON input" Nothing []]
    , metadata = ResultMetadata "unknown" 0 0 True
    }
  Just req -> case parseExpression (reqExpression req) of
    Left parseErr -> InferenceResult
      { success = False
      , finalType = Nothing
      , derivation = []
      , errors = [parseErr]
      , metadata = ResultMetadata (reqAlgorithm req) 0 0 True
      }
    Right expr -> runAlgorithm (reqAlgorithm req) expr

runAlgorithm :: Text -> Expr -> InferenceResult
runAlgorithm "AlgW" expr = algorithmW baseEnv expr
runAlgorithm "WorklistDK" expr = worklistInference baseEnv expr
runAlgorithm alg _ = InferenceResult
  { success = False
  , finalType = Nothing
  , derivation = []
  , errors = [TypeError "unsupported_feature" ("Unknown algorithm: " <> alg) Nothing []]
  , metadata = ResultMetadata alg 0 0 True
  }

baseEnv :: TypeEnv
baseEnv = Map.fromList
  [ ("true", Forall [] (TCon "Bool"))
  , ("false", Forall [] (TCon "Bool"))
  , ("unit", Forall [] (TCon "Unit"))
  ]

-- Memory management
foreign export ccall "malloc" c_malloc :: CSize -> IO (Ptr a)
foreign export ccall "free" c_free :: Ptr a -> IO ()

c_malloc :: CSize -> IO (Ptr a)
c_malloc size = mallocBytes (fromIntegral size)

c_free :: Ptr a -> IO ()
c_free = free
```

### Parser (`src/Parser/Lambda.hs`)

```haskell
{-# LANGUAGE OverloadedStrings #-}

module Parser.Lambda where

import Control.Applicative
import Data.Char
import Data.Text (Text)
import qualified Data.Text as T

import TypeInference.Types

-- Simple parser for lambda calculus expressions
parseExpression :: Text -> Either TypeError Expr
parseExpression input = case runParser pExpr (T.unpack input) of
  Left err -> Left $ TypeError
    { errorType = "parsing_error"
    , errorMessage = T.pack err
    , errorLocation = Nothing
    , suggestions = ["Check syntax", "Balance parentheses"]
    }
  Right (expr, "") -> Right expr
  Right (_, remaining) -> Left $ TypeError
    { errorType = "parsing_error"
    , errorMessage = "Unexpected input: " <> T.pack remaining
    , errorLocation = Nothing
    , suggestions = ["Check for extra characters"]
    }

newtype Parser a = Parser (String -> Either String (a, String))

runParser :: Parser a -> String -> Either String (a, String)
runParser (Parser p) = p

instance Functor Parser where
  fmap f (Parser p) = Parser $ \input -> do
    (result, remaining) <- p input
    return (f result, remaining)

instance Applicative Parser where
  pure a = Parser $ \input -> Right (a, input)
  Parser pf <*> Parser pa = Parser $ \input -> do
    (f, remaining1) <- pf input
    (a, remaining2) <- pa remaining1
    return (f a, remaining2)

instance Alternative Parser where
  empty = Parser $ \_ -> Left "empty"
  Parser p1 <|> Parser p2 = Parser $ \input ->
    case p1 input of
      Left _ -> p2 input
      Right result -> Right result

-- Basic parsers
pChar :: Char -> Parser Char
pChar c = Parser $ \input ->
  case input of
    (x:xs) | x == c -> Right (c, xs)
    _ -> Left $ "Expected " ++ [c]

pAnyChar :: Parser Char
pAnyChar = Parser $ \input ->
  case input of
    (x:xs) -> Right (x, xs)
    [] -> Left "Unexpected end of input"

pSatisfy :: (Char -> Bool) -> Parser Char
pSatisfy pred = Parser $ \input ->
  case input of
    (x:xs) | pred x -> Right (x, xs)
    _ -> Left "Character doesn't satisfy predicate"

-- Whitespace
pSpaces :: Parser ()
pSpaces = Parser $ \input -> Right ((), dropWhile isSpace input)

-- Identifiers
pIdentifier :: Parser Text
pIdentifier = do
  pSpaces
  first <- pSatisfy isAlpha
  rest <- many (pSatisfy isAlphaNum)
  return $ T.pack (first : rest)

-- Expressions
pExpr :: Parser Expr
pExpr = pApplication

pApplication :: Parser Expr
pApplication = do
  first <- pAtom
  rest <- many pAtom
  return $ foldl App first rest

pAtom :: Parser Expr
pAtom = pVar <|> pLambda <|> pParens

pVar :: Parser Expr
pVar = Var <$> pIdentifier

pLambda :: Parser Expr
pLambda = do
  pSpaces
  _ <- pChar '\\' <|> pChar 'λ'
  param <- pIdentifier
  pSpaces
  _ <- pChar '.'
  body <- pExpr
  return $ Lam param body

pParens :: Parser Expr
pParens = do
  pSpaces
  _ <- pChar '('
  expr <- pExpr
  pSpaces
  _ <- pChar ')'
  return expr

many :: Parser a -> Parser [a]
many p = some p <|> pure []

some :: Parser a -> Parser [a]
some p = (:) <$> p <*> many p
```

## Compiling to WebAssembly

### Build Script (`Makefile`)

```makefile
.PHONY: build clean wasm js

# Build WASM module
wasm:
	stack build --flag haskell-type-inference:wasm
	cp $$(stack path --local-install-root)/bin/haskell-inference.wasm public/wasm/

# Build optimized WASM
wasm-opt:
	stack build --flag haskell-type-inference:wasm --ghc-options="-O2"
	wasm-opt -Oz -o public/wasm/haskell-inference-opt.wasm \
		$$(stack path --local-install-root)/bin/haskell-inference.wasm

# Generate JavaScript wrapper
js:
	node scripts/generate-wasm-wrapper.js

# Clean build artifacts
clean:
	stack clean
	rm -f public/wasm/*.wasm

# Full build
build: wasm js

# Development build with file watching
dev:
	stack build --file-watch --flag haskell-type-inference:wasm
```

### WASM Wrapper Generation (`scripts/generate-wasm-wrapper.js`)

```javascript
const fs = require('fs');
const path = require('path');

const wasmWrapperTemplate = `
// Auto-generated WASM wrapper for Haskell type inference
class HaskellInference {
  constructor() {
    this.module = null;
    this.memory = null;
    this.textDecoder = new TextDecoder('utf-8');
    this.textEncoder = new TextEncoder('utf-8');
  }

  async initialize(wasmPath = '/wasm/haskell-inference.wasm') {
    try {
      const wasmBytes = await fetch(wasmPath).then(r => r.arrayBuffer());
      
      const imports = {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        }
      };

      const result = await WebAssembly.instantiate(wasmBytes, imports);
      this.module = result.instance;
      this.memory = imports.env.memory;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize WASM module:', error);
      return false;
    }
  }

  runInference(algorithm, expression, options = {}) {
    if (!this.module) {
      throw new Error('WASM module not initialized');
    }

    const request = JSON.stringify({
      reqAlgorithm: algorithm,
      reqExpression: expression,
      reqOptions: options
    });

    // Allocate memory for input string
    const inputPtr = this.allocateString(request);
    
    try {
      // Call Haskell function
      const resultPtr = this.module.exports.run_inference(inputPtr);
      
      // Read result
      const resultJson = this.readString(resultPtr);
      
      // Free memory
      this.module.exports.free(resultPtr);
      
      return JSON.parse(resultJson);
    } finally {
      this.module.exports.free(inputPtr);
    }
  }

  allocateString(str) {
    const bytes = this.textEncoder.encode(str + '\\0');
    const ptr = this.module.exports.malloc(bytes.length);
    const memory = new Uint8Array(this.memory.buffer);
    memory.set(bytes, ptr);
    return ptr;
  }

  readString(ptr) {
    const memory = new Uint8Array(this.memory.buffer);
    let end = ptr;
    while (memory[end] !== 0) end++;
    return this.textDecoder.decode(memory.slice(ptr, end));
  }
}

// Export for use in web worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HaskellInference;
} else if (typeof self !== 'undefined') {
  self.HaskellInference = HaskellInference;
}
`;

// Write the wrapper
fs.writeFileSync(
  path.join(__dirname, '../public/wasm/haskell-wrapper.js'),
  wasmWrapperTemplate
);

console.log('Generated WASM wrapper');
```

## JavaScript Interface

### Web Worker (`public/wasm/inference-worker.js`)

```javascript
// Import the WASM wrapper
importScripts('./haskell-wrapper.js');

class InferenceWorker {
  constructor() {
    this.haskellInference = new HaskellInference();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const success = await this.haskellInference.initialize();
      this.isInitialized = success;
      
      if (success) {
        self.postMessage({
          type: 'wasm_ready',
          module: 'haskell-inference'
        });
      } else {
        self.postMessage({
          type: 'wasm_error',
          error: 'Failed to initialize WASM module'
        });
      }
      
      return success;
    } catch (error) {
      self.postMessage({
        type: 'wasm_error',
        error: error.message
      });
      return false;
    }
  }

  handleMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case 'init':
        this.initialize();
        break;

      case 'inference_request':
        this.processInference(data);
        break;

      default:
        self.postMessage({
          type: 'error',
          error: \`Unknown message type: \${type}\`
        });
    }
  }

  processInference(request) {
    if (!this.isInitialized) {
      self.postMessage({
        type: 'error',
        error: 'WASM module not initialized'
      });
      return;
    }

    try {
      const startTime = performance.now();
      
      const result = this.haskellInference.runInference(
        request.algorithm,
        request.expression,
        request.options || {}
      );

      // Add timing information
      if (result.metadata) {
        result.metadata.duration = performance.now() - startTime;
      }

      self.postMessage({
        type: 'inference_response',
        data: result
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
}

// Initialize worker
const worker = new InferenceWorker();

// Handle messages
self.onmessage = (event) => {
  worker.handleMessage(event);
};

// Auto-initialize
worker.initialize();
```

## Integration with the Playground

### Enhanced WASM Interface (`src/lib/wasmInterface.ts`)

```typescript
export interface HaskellInferenceResult {
  success: boolean;
  finalType?: string;
  derivation: any[];
  errors: any[];
  metadata: {
    algorithm: string;
    duration: number;
    steps: number;
    wasmUsed: boolean;
  };
}

export class HaskellWasmInterface {
  private worker?: Worker;
  private isInitialized = false;
  private initializationPromise?: Promise<boolean>;

  async initialize(): Promise<boolean> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<boolean> {
    try {
      this.worker = new Worker('/wasm/inference-worker.js');
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('WASM initialization timeout');
          resolve(false);
        }, 10000);

        this.worker!.addEventListener('message', (event) => {
          const { type, error } = event.data;
          
          if (type === 'wasm_ready') {
            clearTimeout(timeout);
            this.isInitialized = true;
            console.log('✅ Haskell WASM module initialized');
            resolve(true);
          } else if (type === 'wasm_error') {
            clearTimeout(timeout);
            console.error('❌ WASM initialization failed:', error);
            resolve(false);
          }
        });

        this.worker!.postMessage({ type: 'init' });
      });
    } catch (error) {
      console.error('Failed to create WASM worker:', error);
      return false;
    }
  }

  async runInference(
    algorithm: string,
    expression: string,
    options?: any
  ): Promise<HaskellInferenceResult> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('WASM module not available');
      }
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Inference timeout'));
      }, 30000);

      const handleResponse = (event: MessageEvent) => {
        const { type, data, error } = event.data;
        
        if (type === 'inference_response') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handleResponse);
          resolve(data);
        } else if (type === 'error') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handleResponse);
          reject(new Error(error));
        }
      };

      this.worker!.addEventListener('message', handleResponse);
      this.worker!.postMessage({
        type: 'inference_request',
        data: { algorithm, expression, options }
      });
    });
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
    this.isInitialized = false;
    this.initializationPromise = undefined;
  }
}

// Global instance
export const haskellWasm = new HaskellWasmInterface();
```

### Updated Mock Inference with WASM Integration

```typescript
// src/lib/mockInference.ts - Updated to use WASM when available
import { haskellWasm } from './wasmInterface';

export async function runInference(algorithm: string, expression: string): Promise<InferenceResult> {
  const startTime = performance.now();
  
  try {
    // Try WASM first if available
    if (haskellWasm.isAvailable()) {
      try {
        const wasmResult = await haskellWasm.runInference(algorithm, expression);
        
        // Convert Haskell result to our format
        return {
          success: wasmResult.success,
          finalType: wasmResult.finalType,
          derivation: wasmResult.derivation,
          errors: wasmResult.errors.map(convertHaskellError),
          metadata: {
            ...wasmResult.metadata,
            wasmUsed: true
          }
        };
      } catch (wasmError) {
        console.warn('WASM inference failed, falling back to JavaScript:', wasmError);
        // Fall through to JavaScript implementation
      }
    }

    // Fallback to JavaScript implementation
    const validation = validateExpression(expression);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        derivation: [],
        metadata: {
          algorithm,
          duration: performance.now() - startTime,
          steps: 0,
          wasmUsed: false
        }
      };
    }

    // ... rest of existing JavaScript implementation
  } catch (error) {
    return {
      success: false,
      errors: [InferenceErrorBuilder.typeError(
        error instanceof Error ? error.message : 'Unknown error during inference'
      )],
      derivation: [],
      metadata: {
        algorithm,
        duration: performance.now() - startTime,
        steps: 0,
        wasmUsed: false
      }
    };
  }
}

function convertHaskellError(haskellError: any): TypeInferenceError {
  return {
    type: haskellError.errorType as ErrorType,
    message: haskellError.errorMessage,
    location: haskellError.errorLocation,
    suggestions: haskellError.suggestions || [],
    code: 'HASKELL_001'
  };
}
```

## Testing and Debugging

### Test Suite (`test/WasmIntegration.test.ts`)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { haskellWasm } from '../src/lib/wasmInterface';

describe('Haskell WASM Integration', () => {
  beforeAll(async () => {
    await haskellWasm.initialize();
  });

  afterAll(() => {
    haskellWasm.destroy();
  });

  it('should initialize successfully', () => {
    expect(haskellWasm.isAvailable()).toBe(true);
  });

  it('should infer identity function type', async () => {
    const result = await haskellWasm.runInference('AlgW', '\\x. x');
    
    expect(result.success).toBe(true);
    expect(result.finalType).toMatch(/^[a-z]+ → [a-z]+$/);
    expect(result.metadata.wasmUsed).toBe(true);
  });

  it('should handle parsing errors', async () => {
    const result = await haskellWasm.runInference('AlgW', '\\x.');
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('parsing_error');
  });

  it('should handle type errors', async () => {
    const result = await haskellWasm.runInference('AlgW', '(\\x. x) (\\x. x)');
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('unification_error');
  });
});
```

### Performance Benchmarks

```typescript
// test/Performance.bench.ts
import { bench, describe } from 'vitest';
import { haskellWasm } from '../src/lib/wasmInterface';
import { runInference as jsInference } from '../src/lib/mockInference';

describe('Performance Comparison', () => {
  const expressions = [
    '\\x. x',
    '\\x. \\y. x',
    '(\\x. x) 42',
    'let id = \\x. x in id id'
  ];

  expressions.forEach(expr => {
    bench(`WASM: ${expr}`, async () => {
      await haskellWasm.runInference('AlgW', expr);
    });

    bench(`JS: ${expr}`, async () => {
      await jsInference('AlgW', expr);
    });
  });
});
```

## Performance Optimization

### WASM Optimization Flags

```makefile
# In Makefile
wasm-release:
	stack build \
		--flag haskell-type-inference:wasm \
		--ghc-options="-O2 -funbox-strict-fields -fllvm"
	wasm-opt -Oz --enable-bulk-memory -o public/wasm/haskell-inference.wasm \
		$$(stack path --local-install-root)/bin/haskell-inference.wasm
```

### Memory Management

```haskell
-- Add to FFI/Interface.hs
foreign export ccall "gc_collect" gcCollect :: IO ()

gcCollect :: IO ()
gcCollect = do
  performGC
  -- Force garbage collection
```

## Troubleshooting

### Common Issues

1. **WASM Module Fails to Load**
   ```bash
   # Check MIME type
   curl -I http://localhost:5173/wasm/haskell-inference.wasm
   
   # Should return: Content-Type: application/wasm
   ```

2. **Stack Overflow in WASM**
   ```haskell
   -- Increase stack size in GHC options
   ghc-options: -rtsopts -with-rtsopts=-K64m
   ```

3. **Memory Issues**
   ```javascript
   // Monitor memory usage in browser
   if (performance.memory) {
     console.log('WASM Memory:', performance.memory);
   }
   ```

### Debug Build

```makefile
wasm-debug:
	stack build \
		--flag haskell-type-inference:wasm \
		--ghc-options="-g -debug"
```

This comprehensive guide enables you to integrate sophisticated Haskell type inference algorithms directly into your web-based playground, providing users with the full power of Haskell's type system while maintaining the accessibility of a browser-based interface.