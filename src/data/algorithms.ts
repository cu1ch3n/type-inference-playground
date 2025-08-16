import { TypeInferenceAlgorithm } from '@/types/inference';

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: 'algorithm-w',
    name: 'Algorithm W',
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
    id: 'bidirectional',
    name: 'Bidirectional Type Checking',
    labels: ['Local', 'Bidirectional', 'Check/Synth'],
    viewMode: 'tree',
    paper: {
      title: 'Bidirectional Typing Rules: A Tutorial',
      authors: ['David Raymond Christiansen'],
      year: 2013,
      url: 'https://arxiv.org/abs/1306.6032'
    },
    rules: [
      {
        id: 'Var',
        name: 'Var',
        premises: ['x : A \\in \\Gamma'],
        conclusion: '\\Gamma \\vdash x \\Rightarrow A'
      },
      {
        id: 'Lam',
        name: 'Lam',
        premises: ['\\Gamma, x : A \\vdash e \\Leftarrow B'],
        conclusion: '\\Gamma \\vdash \\lambda x.e \\Leftarrow A \\rightarrow B'
      },
      {
        id: 'App',
        name: 'App',
        premises: ['\\Gamma \\vdash e_1 \\Rightarrow A \\rightarrow B', '\\Gamma \\vdash e_2 \\Leftarrow A'],
        conclusion: '\\Gamma \\vdash e_1 \\; e_2 \\Rightarrow B'
      },
      {
        id: 'Sub',
        name: 'Sub',
        premises: ['\\Gamma \\vdash e \\Rightarrow A', 'A \\leq B'],
        conclusion: '\\Gamma \\vdash e \\Leftarrow B'
      }
    ]
  },
  {
    id: 'worklist',
    name: 'Worklist-based STLC',
    labels: ['Constraint-based', 'STLC', 'Unification'],
    viewMode: 'linear',
    paper: {
      title: 'Constraint-Based Type Inference',
      authors: ['François Pottier', 'Didier Rémy'],
      year: 2005,
      url: 'https://hal.inria.fr/hal-01499583'
    },
    rules: [
      {
        id: 'Var',
        name: 'Var',
        premises: [],
        conclusion: '\\text{lookup}(x, \\Gamma) = \\tau'
      },
      {
        id: 'Lam',
        name: 'Lam',
        premises: ['\\text{fresh } \\alpha_1, \\alpha_2', '\\text{add constraint } \\alpha = \\alpha_1 \\rightarrow \\alpha_2'],
        conclusion: '\\lambda x.e : \\alpha'
      },
      {
        id: 'App',
        name: 'App',
        premises: ['\\text{fresh } \\alpha', '\\text{add constraint } \\tau_1 = \\tau_2 \\rightarrow \\alpha'],
        conclusion: 'e_1 \\; e_2 : \\alpha'
      },
      {
        id: 'Unify',
        name: 'Unify',
        premises: ['\\text{unify } \\tau_1 = \\tau_2'],
        conclusion: '\\text{apply substitution}'
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
  'bidirectional': [
    {
      name: 'Identity',
      expression: '\\x. x',
      description: 'Identity with bidirectional checking'
    },
    {
      name: 'Application',
      expression: '(\\x. x) y',
      description: 'Function application'
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