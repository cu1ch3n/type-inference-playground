import { TypeInferenceAlgorithm } from '@/types/inference';

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: 'algorithm-w',
    name: 'Algorithm W',
    description: 'The classic Hindley-Milner type inference algorithm that infers the most general type for lambda calculus expressions using unification.',
    paper: {
      title: 'A Theory of Type Polymorphism in Programming',
      authors: ['Robin Milner'],
      year: 1978,
      url: 'https://doi.org/10.1016/0022-0000(78)90014-4'
    },
    rules: [
      {
        id: 'var',
        name: 'Variable',
        premises: ['x : \\sigma \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x : \\sigma',
        description: 'If variable x has type scheme σ in the context Γ, then x has type σ'
      },
      {
        id: 'abs',
        name: 'Abstraction',
        premises: ['\\Gamma, x : \\tau_1 \\vdash e : \\tau_2'],
        conclusion: '\\Gamma \\vdash \\lambda x.e : \\tau_1 \\rightarrow \\tau_2',
        description: 'Lambda abstraction introduces a function type'
      },
      {
        id: 'app',
        name: 'Application',
        premises: ['\\Gamma \\vdash e_1 : \\tau_1 \\rightarrow \\tau_2', '\\Gamma \\vdash e_2 : \\tau_1'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 : \\tau_2',
        description: 'Function application eliminates the function type'
      },
      {
        id: 'gen',
        name: 'Generalization',
        premises: ['\\Gamma \\vdash e : \\tau', '\\alpha \\notin \\text{ftv}(\\Gamma)'],
        conclusion: '\\Gamma \\vdash e : \\forall \\alpha. \\tau',
        description: 'Generalize free type variables not in the context'
      },
      {
        id: 'inst',
        name: 'Instantiation',
        premises: ['\\Gamma \\vdash e : \\forall \\alpha. \\tau'],
        conclusion: '\\Gamma \\vdash e : [\\alpha := \\tau\'] \\tau',
        description: 'Instantiate polymorphic types with concrete types'
      }
    ]
  },
  {
    id: 'bidirectional',
    name: 'Bidirectional Type Checking',
    description: 'A type checking algorithm that uses both synthesis (inferring types) and checking (verifying types) judgments for more precise type information.',
    paper: {
      title: 'Bidirectional Typing',
      authors: ['Jana Dunfield', 'Neel Krishnaswami'],
      year: 2021,
      url: 'https://doi.org/10.1145/3450952'
    },
    rules: [
      {
        id: 'var-synth',
        name: 'Variable Synthesis',
        premises: ['x : A \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x \\Rightarrow A',
        description: 'Synthesize the type of a variable from the context'
      },
      {
        id: 'abs-check',
        name: 'Abstraction Checking',
        premises: ['\\Gamma, x : A \\vdash e \\Leftarrow B'],
        conclusion: '\\Gamma \\vdash \\lambda x.e \\Leftarrow A \\rightarrow B',
        description: 'Check that a lambda has the expected function type'
      },
      {
        id: 'app-synth',
        name: 'Application Synthesis',
        premises: ['\\Gamma \\vdash e_1 \\Rightarrow A \\rightarrow B', '\\Gamma \\vdash e_2 \\Leftarrow A'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 \\Rightarrow B',
        description: 'Synthesize result type from function application'
      },
      {
        id: 'subsumption',
        name: 'Subsumption',
        premises: ['\\Gamma \\vdash e \\Rightarrow A', 'A <: B'],
        conclusion: '\\Gamma \\vdash e \\Leftarrow B',
        description: 'Use subtyping to switch from synthesis to checking'
      }
    ]
  }
];

export const exampleExpressions = [
  {
    name: 'Identity Function',
    expression: 'λx.x',
    description: 'The polymorphic identity function'
  },
  {
    name: 'Constant Function',
    expression: 'λx.λy.x',
    description: 'Returns its first argument, ignoring the second'
  },
  {
    name: 'Function Composition',
    expression: 'λf.λg.λx.f (g x)',
    description: 'Composes two functions'
  },
  {
    name: 'Self Application',
    expression: 'λx.x x',
    description: 'Applies a function to itself (untypeable in simply-typed lambda calculus)'
  },
  {
    name: 'Church Numeral 2',
    expression: 'λf.λx.f (f x)',
    description: 'Church encoding of the number 2'
  }
];