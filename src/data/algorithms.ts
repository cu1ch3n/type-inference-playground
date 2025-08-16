import { TypeInferenceAlgorithm } from '@/types/inference';

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: 'algorithm-w',
    name: 'Algorithm W',
    description: 'The classic Hindley-Milner type inference algorithm that infers the most general type for lambda calculus expressions using unification.',
    labels: ['Global', 'Let-generalization', 'Principal type'],
    derivationStyle: 'tree',
    paper: {
      title: 'A Theory of Type Polymorphism in Programming',
      authors: ['Robin Milner'],
      year: 1978,
      url: 'https://doi.org/10.1016/0022-0000(78)90014-4'
    },
    rules: [
      {
        id: 'var',
        name: 'Var',
        premises: ['x : \\tau \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x : \\tau'
      },
      {
        id: 'lam',
        name: 'Lam',
        premises: ['\\Gamma, x : \\tau_1 \\vdash e : \\tau_2'],
        conclusion: '\\Gamma \\vdash \\lambda x.e : \\tau_1 \\rightarrow \\tau_2'
      },
      {
        id: 'app',
        name: 'App',
        premises: ['\\Gamma \\vdash e_1 : \\tau_1 \\rightarrow \\tau_2', '\\Gamma \\vdash e_2 : \\tau_1'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 : \\tau_2'
      }
    ]
  },
  {
    id: 'bidirectional',
    name: 'Bidirectional Type Checking',
    description: 'A type checking algorithm that uses both synthesis (inferring types) and checking (verifying types) judgments for more precise type information.',
    labels: ['Local', 'Bidirectional', 'Synthesis/Checking'],
    derivationStyle: 'tree',
    paper: {
      title: 'Bidirectional Typing',
      authors: ['Jana Dunfield', 'Neel Krishnaswami'],
      year: 2021,
      url: 'https://doi.org/10.1145/3450952'
    },
    rules: [
      {
        id: 'var',
        name: 'Var',
        premises: ['x : A \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x \\Rightarrow A'
      },
      {
        id: 'lam',
        name: 'Lam',
        premises: ['\\Gamma, x : A \\vdash e \\Leftarrow B'],
        conclusion: '\\Gamma \\vdash \\lambda x.e \\Leftarrow A \\rightarrow B'
      },
      {
        id: 'app',
        name: 'App',
        premises: ['\\Gamma \\vdash e_1 \\Rightarrow A \\rightarrow B', '\\Gamma \\vdash e_2 \\Leftarrow A'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 \\Rightarrow B'
      },
      {
        id: 'sub',
        name: 'Sub',
        premises: ['\\Gamma \\vdash e \\Rightarrow A', 'A <: B'],
        conclusion: '\\Gamma \\vdash e \\Leftarrow B'
      }
    ]
  },
  {
    id: 'worklist',
    name: 'Worklist-based Type Inference',
    description: 'A constraint-based type inference algorithm that processes typing constraints in a worklist manner.',
    labels: ['Constraint-based', 'Worklist', 'Incremental'],
    derivationStyle: 'linear',
    paper: {
      title: 'Type Inference via Constraint Generation and Solving',
      authors: ['Martin Odersky', 'Konstantin Läufer'],
      year: 1996,
      url: 'https://doi.org/10.1007/3-540-61464-8_44'
    },
    rules: [
      {
        id: 'gen',
        name: 'Gen',
        premises: ['e : \\tau'],
        conclusion: '\\text{generate}(e) = C, \\tau'
      },
      {
        id: 'solve',
        name: 'Solve',
        premises: ['C'],
        conclusion: '\\text{solve}(C) = \\sigma'
      },
      {
        id: 'unify',
        name: 'Unify',
        premises: ['\\tau_1 \\sim \\tau_2'],
        conclusion: '\\text{unify}(\\tau_1, \\tau_2) = \\sigma'
      }
    ]
  }
];

export const algorithmExamples: Record<string, Array<{name: string, expression: string, description: string}>> = {
  'algorithm-w': [
    {
      name: 'Identity Function',
      expression: '\\x. x',
      description: 'The polymorphic identity function'
    },
    {
      name: 'Constant Function', 
      expression: '\\x. \\y. x',
      description: 'Returns its first argument, ignoring the second'
    },
    {
      name: 'Function Composition',
      expression: '\\f. \\g. \\x. f (g x)',
      description: 'Composes two functions'
    },
    {
      name: 'Self Application',
      expression: '\\x. x x',
      description: 'Applies a function to itself (untypeable)'
    }
  ],
  'bidirectional': [
    {
      name: 'Simple Lambda',
      expression: '\\x. x',
      description: 'Identity function with bidirectional checking'
    },
    {
      name: 'Application',
      expression: '(\\x. x) 42',
      description: 'Function application requiring synthesis'
    },
    {
      name: 'Higher-order',
      expression: '\\f. \\x. f x',
      description: 'Higher-order function'
    }
  ],
  'worklist': [
    {
      name: 'Simple Variable',
      expression: 'x',
      description: 'Type variable resolution'
    },
    {
      name: 'Function Application',
      expression: 'f x',
      description: 'Constraint generation for application'
    },
    {
      name: 'Lambda Abstraction',
      expression: '\\x. x + 1',
      description: 'Function with arithmetic constraint'
    },
    {
      name: 'Complex Expression',
      expression: '\\f. \\x. f (f x)',
      description: 'Higher-order function with unification'
    }
  ]
};