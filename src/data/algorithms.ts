import { TypeInferenceAlgorithm } from '@/types/inference';

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: 'algorithm-w',
    name: 'Algorithm W',
    labels: ['Global', 'Unification', 'Hindley-Milner', 'Let-generalization', 'Principal type'],
    viewMode: 'tree',
    paper: {
      title: 'A Theory of Type Polymorphism in Programming',
      authors: ['Robin Milner'],
      year: 1978,
      url: 'https://doi.org/10.1016%2F0022-0000%2878%2990014-4'
    },
    rules: [
      {
        id: 'Var',
        name: 'Var',
        premises: ['x : \\sigma \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x : \\sigma'
      },
      {
        id: 'Lam',
        name: 'Lam',
        premises: ['\\Gamma, x : \\tau_1 \\vdash e : \\tau_2'],
        conclusion: '\\Gamma \\vdash \\lambda x.e : \\tau_1 \\rightarrow \\tau_2'
      },
      {
        id: 'App',
        name: 'App',
        premises: ['\\Gamma \\vdash e_1 : \\tau_1 \\rightarrow \\tau_2', '\\Gamma \\vdash e_2 : \\tau_1'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 : \\tau_2'
      },
      {
        id: 'Gen',
        name: 'Gen',
        premises: ['\\Gamma \\vdash e : \\tau', '\\alpha \\notin \\text{ftv}(\\Gamma)'],
        conclusion: '\\Gamma \\vdash e : \\forall \\alpha. \\tau'
      },
      {
        id: 'Inst',
        name: 'Inst',
        premises: ['\\Gamma \\vdash e : \\forall \\alpha. \\tau'],
        conclusion: '\\Gamma \\vdash e : [\\alpha := \\tau\'] \\tau'
      }
    ]
  },
  {
    id: 'worklist',
    name: 'A Mechanical Formalization of Higher-Ranked Polymorphic Type Inference',
    labels: ['Global', 'Unification', 'Dunfield-Krishnaswami'],
    viewMode: 'linear',
    paper: {
      title: 'A Mechanical Formalization of Higher-Ranked Polymorphic Type Inference',
      authors: ['Jinxu Zhao', 'Bruno C. d. S. Oliveira', 'Tom Schrijvers'],
      year: 2019,
      url: 'https://dl.acm.org/doi/10.1145/3341716'
    },
    rules: [
      {
        id: 'InstLSolve',
        name: 'InstLSolve',
        premises: [],
        conclusion: '',
        reduction: '\\Gamma[\\alpha][\\Delta] \\vdash \\alpha = \\tau \\longrightarrow \\Gamma[\\alpha = \\tau][\\Delta[\\alpha := \\tau]]'
      },
      {
        id: 'InstRSolve',
        name: 'InstRSolve',
        premises: [],
        conclusion: '',
        reduction: '\\Gamma[\\alpha][\\Delta] \\vdash \\tau = \\alpha \\longrightarrow \\Gamma[\\alpha = \\tau][\\Delta[\\alpha := \\tau]]'
      },
      {
        id: 'FunLR',
        name: 'FunLR',
        premises: [],
        conclusion: '',
        reduction: '\\Gamma \\vdash A_1 \\to B_1 \\leq A_2 \\to B_2 \\longrightarrow \\Gamma \\vdash A_2 \\leq A_1, B_1 \\leq B_2'
      },
      {
        id: 'ForallL',
        name: 'ForallL',
        premises: [],
        conclusion: '',
        reduction: '\\Gamma \\vdash \\forall \\alpha. A \\leq B \\longrightarrow \\Gamma[\\alpha_1] \\vdash A[\\alpha := \\alpha_1] \\leq B'
      },
      {
        id: 'ForallR',
        name: 'ForallR',
        premises: [],
        conclusion: '',
        reduction: '\\Gamma \\vdash A \\leq \\forall \\alpha. B \\longrightarrow \\Gamma[\\alpha] \\vdash A \\leq B'
      }
    ]
  }
];

export const algorithmExamples = {
  'algorithm-w': [
    {
      name: 'Identity',
      expression: '\\x. x',
      description: 'The identity function'
    },
    {
      name: 'Constant',
      expression: '\\x. \\y. x',
      description: 'The constant function'
    },
    {
      name: 'Composition',
      expression: '\\f. \\g. \\x. f (g x)',
      description: 'Function composition'
    }
  ],
  'worklist': [
    {
      name: 'Identity',
      expression: '\\x. x',
      description: 'Identity with constraint generation'
    },
    {
      name: 'Variable',
      expression: 'x',
      description: 'Simple variable lookup'
    },
    {
      name: 'Application',
      expression: 'f x',
      description: 'Function application with constraints'
    }
  ]
} as const;