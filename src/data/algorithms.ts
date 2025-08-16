import { TypeInferenceAlgorithm } from '@/types/inference';

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: 'algorithm-w',
    name: 'Algorithm W',
    description: 'The classic Hindley-Milner type inference algorithm that infers the most general type for lambda calculus expressions using unification.',
    labels: ['Global', 'Let-generalization', 'Principal type', '1978'],
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
        conclusion: '\\Gamma \\vdash x : \\sigma'
      },
      {
        id: 'abs',
        name: 'Abstraction',
        premises: ['\\Gamma, x : \\tau_1 \\vdash e : \\tau_2'],
        conclusion: '\\Gamma \\vdash \\lambda x.e : \\tau_1 \\rightarrow \\tau_2'
      },
      {
        id: 'app',
        name: 'Application',
        premises: ['\\Gamma \\vdash e_1 : \\tau_1 \\rightarrow \\tau_2', '\\Gamma \\vdash e_2 : \\tau_1'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 : \\tau_2'
      },
      {
        id: 'gen',
        name: 'Generalization',
        premises: ['\\Gamma \\vdash e : \\tau', '\\alpha \\notin \\text{ftv}(\\Gamma)'],
        conclusion: '\\Gamma \\vdash e : \\forall \\alpha. \\tau'
      },
      {
        id: 'inst',
        name: 'Instantiation',
        premises: ['\\Gamma \\vdash e : \\forall \\alpha. \\tau'],
        conclusion: '\\Gamma \\vdash e : [\\alpha := \\tau\'] \\tau'
      }
    ]
  },
  {
    id: 'bidirectional',
    name: 'Bidirectional Type Checking',
    description: 'A type checking algorithm that uses both synthesis (inferring types) and checking (verifying types) judgments for more precise type information.',
    labels: ['Local', 'Bidirectional', 'Synthesis/Checking', '2021'],
    paper: {
      title: 'Bidirectional Typing',
      authors: ['Jana Dunfield', 'Neel Krishnaswami'],
      year: 2021,
      url: 'https://doi.org/10.1145/3450952'
    },
    rules: [
      {
        id: 'var-synth',
        name: 'Var-Synth',
        premises: ['x : A \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x \\Rightarrow A'
      },
      {
        id: 'abs-check',
        name: 'Abs-Check',
        premises: ['\\Gamma, x : A \\vdash e \\Leftarrow B'],
        conclusion: '\\Gamma \\vdash \\lambda x.e \\Leftarrow A \\rightarrow B'
      },
      {
        id: 'app-synth',
        name: 'App-Synth',
        premises: ['\\Gamma \\vdash e_1 \\Rightarrow A \\rightarrow B', '\\Gamma \\vdash e_2 \\Leftarrow A'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 \\Rightarrow B'
      },
      {
        id: 'subsumption',
        name: 'Subsumption',
        premises: ['\\Gamma \\vdash e \\Rightarrow A', 'A <: B'],
        conclusion: '\\Gamma \\vdash e \\Leftarrow B'
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
    },
    {
      name: 'Let Expression',
      expression: 'let id = \\x. x in id 5',
      description: 'Let binding with polymorphism'
    }
  ]
};