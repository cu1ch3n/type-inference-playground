import { TypeInferenceAlgorithm } from '@/types/inference';

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: 'algorithm-w',
    name: 'Algorithm W',
    description: 'The classic Hindley-Milner type inference algorithm that infers the most general type for lambda calculus expressions using unification.',
    labels: ['Global', 'Let-generalization', 'Principal type'],
    viewMode: 'tree',
    paper: {
      title: 'A Theory of Type Polymorphism in Programming',
      authors: ['Robin Milner'],
      year: 1978,
      url: 'https://doi.org/10.1016/0022-0000(78)90014-4'
    },
    rules: [
      {
        id: 'Var',
        name: 'Variable',
        premises: ['x : \\sigma \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x : \\sigma'
      },
      {
        id: 'Lam',
        name: 'Lambda',
        premises: ['\\Gamma, x : \\tau_1 \\vdash e : \\tau_2'],
        conclusion: '\\Gamma \\vdash \\lambda x.e : \\tau_1 \\rightarrow \\tau_2'
      },
      {
        id: 'App',
        name: 'Application',
        premises: ['\\Gamma \\vdash e_1 : \\tau_1 \\rightarrow \\tau_2', '\\Gamma \\vdash e_2 : \\tau_1'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 : \\tau_2'
      },
      {
        id: 'Gen',
        name: 'Generalization',
        premises: ['\\Gamma \\vdash e : \\tau', '\\alpha \\notin \\text{ftv}(\\Gamma)'],
        conclusion: '\\Gamma \\vdash e : \\forall \\alpha. \\tau'
      },
      {
        id: 'Inst',
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
    labels: ['Local', 'Bidirectional', 'Synthesis/Checking'],
    viewMode: 'tree',
    paper: {
      title: 'Bidirectional Typing',
      authors: ['Jana Dunfield', 'Neel Krishnaswami'],
      year: 2021,
      url: 'https://doi.org/10.1145/3450952'
    },
    rules: [
      {
        id: 'VarS',
        name: 'Variable Synthesis',
        premises: ['x : A \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x \\Rightarrow A'
      },
      {
        id: 'LamC',
        name: 'Lambda Check',
        premises: ['\\Gamma, x : A \\vdash e \\Leftarrow B'],
        conclusion: '\\Gamma \\vdash \\lambda x.e \\Leftarrow A \\rightarrow B'
      },
      {
        id: 'AppS',
        name: 'Application Synthesis',
        premises: ['\\Gamma \\vdash e_1 \\Rightarrow A \\rightarrow B', '\\Gamma \\vdash e_2 \\Leftarrow A'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 \\Rightarrow B'
      },
      {
        id: 'Sub',
        name: 'Subsumption',
        premises: ['\\Gamma \\vdash e \\Rightarrow A', 'A <: B'],
        conclusion: '\\Gamma \\vdash e \\Leftarrow B'
      }
    ]
  },
  {
    id: 'worklist',
    name: 'Worklist-based STLC',
    description: 'A constraint-based approach to type inference for simply typed lambda calculus using a worklist algorithm.',
    labels: ['Constraint-based', 'STLC', 'Worklist'],
    viewMode: 'linear',
    paper: {
      title: 'Types and Programming Languages',
      authors: ['Benjamin Pierce'],
      year: 2002,
      url: 'https://www.cis.upenn.edu/~bcpierce/tapl/'
    },
    rules: [
      {
        id: 'WVar',
        name: 'Variable',
        premises: ['x : \\tau \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x : \\tau'
      },
      {
        id: 'WLam',
        name: 'Lambda',
        premises: ['\\Gamma, x : \\tau_1 \\vdash e : \\tau_2'],
        conclusion: '\\Gamma \\vdash \\lambda x.e : \\tau_1 \\rightarrow \\tau_2'
      },
      {
        id: 'WApp',
        name: 'Application',
        premises: ['\\Gamma \\vdash e_1 : \\tau_1', '\\Gamma \\vdash e_2 : \\tau_2', '\\tau_1 \\sim \\tau_2 \\rightarrow \\alpha'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 : \\alpha'
      },
      {
        id: 'WUnify',
        name: 'Unification',
        premises: ['\\tau_1 \\sim \\tau_2'],
        conclusion: '[\\tau_1 / \\alpha] \\text{constraints}'
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
  ],
  'worklist': [
    {
      name: 'Simple Variable',
      expression: 'x',
      description: 'Single variable type lookup'
    },
    {
      name: 'Identity Function',
      expression: '\\x. x',
      description: 'Identity function with constraint generation'
    },
    {
      name: 'Application',
      expression: 'f x',
      description: 'Function application with unification'
    },
    {
      name: 'Nested Lambda',
      expression: '\\f. \\x. f x',
      description: 'Nested abstraction with constraints'
    }
  ]
};