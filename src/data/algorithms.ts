import { TypeInferenceAlgorithm } from "@/types/inference";

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: "W",
    name: "Algorithm W",
    labels: ["Global", "Unification", "Hindley-Milner"],
    viewMode: "tree",
    paper: {
      title: "A Theory of Type Polymorphism in Programming",
      authors: ["Robin Milner"],
      year: 1978,
      url: "https://doi.org/10.1016%2F0022-0000%2878%2990014-4"
    },
    rules: [
      {
        id: "Var",
        name: "Var",
        premises: ["x : \\sigma \\in \\Gamma", "\\tau = inst(\\sigma)"],
        conclusion: "\\Gamma \\vdash x : \\sigma, \\emptyset"
      },
      {
        id: "App",
        name: "App",
        premises: ["\\Gamma \\vdash e_0 : \\tau_0, S_0", "S_0\\Gamma \\vdash e_1 : \\tau_1, S_1", "\\tau' = newvar", "S_2 = mgu(S_1\\tau_0, \\tau_1 \\rightarrow \\tau')"],
        conclusion: "\\Gamma \\vdash e_0 ~ e_1 : S_2\\tau', S_2S_1S_0"
      },
      {
        id: "Abs",
        name: "Abs",
        premises: ["r = newvar", "\\Gamma, x : \\tau \\vdash e : \\tau', S"],
        conclusion: "\\Gamma \\vdash \\lambda x.~e : S\\tau \\rightarrow \\tau', S"
      },
      {
        id: "Let",
        name: "Let",
        premises: ["\\Gamma \\vdash e_0 : \\tau, S_0", "S_0\\Gamma, x : \\overline{S_0\\Gamma}(\\tau) \\vdash e_1 : \\tau', S_1"],
        conclusion: "\\Gamma \\vdash \\text{let } x = e_0 \\text{ in } e_1 : \\tau', S_1 S_0"
      }
    ]
  },
  {
    id: "R",
    name: "Algorithm R",
    labels: ["Global", "Unification", "Hindley-Milner"],
    viewMode: "tree",
    paper: {
      title: "No Unification Variable Left Behind: Fully Grounding Type Inference for the HDM System",
      authors: ["Roger Bosman", "Georgios Karachalias", "Tom Schrijvers"],
      year: 2023,
      url: "https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ITP.2023.8"
    },
    rules: [
      {
        id: "placeholder",
        name: "TBA",
        premises: [],
        conclusion: "\\text{Rules will be added soon.}"
      }
    ]
  },
  {
    id: "DK",
    name: "Dunfield-Krishnaswami",
    labels: ["Global", "Unification", "Bidirectional", "System F", "Higher-Rank", "Implicit"],
    viewMode: "tree",
    paper: {
      title: "Complete and Easy Bidirectional Typechecking for Higher-rank Polymorphism",
      authors: ["Jana Dunfield", "Neelakantan R. Krishnaswami"],
      year: 2013,
      url: "https://dl.acm.org/doi/10.1145/2500365.2500582"
    },
    rules: [
      {
        id: "placeholder",
        name: "TBA",
        premises: [],
        conclusion: "\\text{Rules will be added soon.}"
      }
    ]
  },
  {
    id: "Contextual",
    name: "Contextual Typing",
    labels: ["Local", "Contextual"],
    viewMode: "tree",
    variants: [
      {
        id: "base",
        name: "Base",
        description: "Basic contextual typing algorithm",
        icon: "Layers"
      },
      {
        id: "extension",
        name: "Extension",
        description: "Extended contextual typing with additional features",
        icon: "Plus"
      }
    ],
    defaultVariant: "base",
    paper: {
      title: "Contextual Typing",
      authors: ["Xu Xue", "Bruno C. d. S. Oliveira"],
      year: 2024,
      url: "https://dl.acm.org/doi/10.1145/3674655"
    },
    rules: [
      {
        id: "typing",
        name: "Typing",
        description: "Under environment $\\Gamma$, expression $e$ has type $\\tau$",
        formula: "\\boxed{\\Gamma \\vdash e : \\tau}",
        rules: [
          {
            id: "CTVar",
            name: "CTVar",
            premises: ["x : \\sigma \\in \\Gamma"],
            conclusion: "\\Gamma \\vdash x : \\sigma"
          },
          {
            id: "CTApp",
            name: "CTApp", 
            premises: ["\\Gamma \\vdash e_1 : \\tau_1 \\to \\tau_2", "\\Gamma \\vdash e_2 : \\tau_1"],
            conclusion: "\\Gamma \\vdash e_1~e_2 : \\tau_2"
          },
          {
            id: "CTAbs",
            name: "CTAbs",
            premises: ["\\Gamma, x : \\tau_1 \\vdash e : \\tau_2"],
            conclusion: "\\Gamma \\vdash \\lambda x.~e : \\tau_1 \\to \\tau_2"
          }
        ]
      },
      {
        id: "matching",
        name: "Matching",
        description: "Type matching produces substitution $S$ from types $\\tau_1$ and $\\tau_2$",
        formula: "\\boxed{\\tau_1 \\triangleleft \\tau_2 \\Rightarrow S}",
        rules: [
          {
            id: "MTVar",
            name: "MTVar",
            premises: ["\\alpha \\text{ fresh}"],
            conclusion: "\\alpha \\triangleleft \\tau \\Rightarrow [\\alpha \\mapsto \\tau]"
          },
          {
            id: "MTArr",
            name: "MTArr",
            premises: ["\\tau_1 \\triangleleft \\tau_3 \\Rightarrow S_1", "S_1(\\tau_2) \\triangleleft S_1(\\tau_4) \\Rightarrow S_2"],
            conclusion: "\\tau_1 \\to \\tau_2 \\triangleleft \\tau_3 \\to \\tau_4 \\Rightarrow S_2 \\circ S_1"
          }
        ]
      }
    ],
    variantRules: {
      base: [
        {
          id: "typing",
          name: "Typing",
          description: "Under environment $\\Gamma$, expression $e$ has type $\\tau$",
          formula: "\\boxed{\\Gamma \\vdash e : \\tau}",
          rules: [
            {
              id: "CTVar",
              name: "CTVar",
              premises: ["x : \\sigma \\in \\Gamma"],
              conclusion: "\\Gamma \\vdash x : \\sigma"
            },
            {
              id: "CTApp",
              name: "CTApp", 
              premises: ["\\Gamma \\vdash e_1 : \\tau_1 \\to \\tau_2", "\\Gamma \\vdash e_2 : \\tau_1"],
              conclusion: "\\Gamma \\vdash e_1~e_2 : \\tau_2"
            },
            {
              id: "CTAbs",
              name: "CTAbs",
              premises: ["\\Gamma, x : \\tau_1 \\vdash e : \\tau_2"],
              conclusion: "\\Gamma \\vdash \\lambda x.~e : \\tau_1 \\to \\tau_2"
            }
          ]
        }
      ],
      extension: [
        {
          id: "typing",
          name: "Typing",
          description: "Under environment $\\Gamma$, expression $e$ has type $\\tau$",
          formula: "\\boxed{\\Gamma \\vdash e : \\tau}",
          rules: [
            {
              id: "CTVar",
              name: "CTVar",
              premises: ["x : \\sigma \\in \\Gamma"],
              conclusion: "\\Gamma \\vdash x : \\sigma"
            },
            {
              id: "CTApp",
              name: "CTApp", 
              premises: ["\\Gamma \\vdash e_1 : \\tau_1 \\to \\tau_2", "\\Gamma \\vdash e_2 : \\tau_1"],
              conclusion: "\\Gamma \\vdash e_1~e_2 : \\tau_2"
            },
            {
              id: "CTAbs",
              name: "CTAbs",
              premises: ["\\Gamma, x : \\tau_1 \\vdash e : \\tau_2"],
              conclusion: "\\Gamma \\vdash \\lambda x.~e : \\tau_1 \\to \\tau_2"
            },
            {
              id: "CTLet",
              name: "CTLet",
              premises: ["\\Gamma \\vdash e_1 : \\tau_1", "\\Gamma, x : \\tau_1 \\vdash e_2 : \\tau_2"],
              conclusion: "\\Gamma \\vdash \\text{let } x = e_1 \\text{ in } e_2 : \\tau_2"
            }
          ]
        },
        {
          id: "matching",
          name: "Matching",
          description: "Type matching produces substitution $S$ from types $\\tau_1$ and $\\tau_2$",
          formula: "\\boxed{\\tau_1 \\triangleleft \\tau_2 \\Rightarrow S}",
          rules: [
            {
              id: "MTVar",
              name: "MTVar",
              premises: ["\\alpha \\text{ fresh}"],
              conclusion: "\\alpha \\triangleleft \\tau \\Rightarrow [\\alpha \\mapsto \\tau]"
            },
            {
              id: "MTArr",
              name: "MTArr",
              premises: ["\\tau_1 \\triangleleft \\tau_3 \\Rightarrow S_1", "S_1(\\tau_2) \\triangleleft S_1(\\tau_4) \\Rightarrow S_2"],
              conclusion: "\\tau_1 \\to \\tau_2 \\triangleleft \\tau_3 \\to \\tau_4 \\Rightarrow S_2 \\circ S_1"
            },
            {
              id: "MTUnit",
              name: "MTUnit",
              premises: [],
              conclusion: "\\text{unit} \\triangleleft \\text{unit} \\Rightarrow \\text{id}"
            }
          ]
        },
        {
          id: "inference",
          name: "Inference",
          description: "Type inference for expressions without explicit type annotations",
          formula: "\\boxed{\\Gamma \\vdash e \\Rightarrow \\tau}",
          rules: [
            {
              id: "InfVar",
              name: "InfVar",
              premises: ["x : \\sigma \\in \\Gamma"],
              conclusion: "\\Gamma \\vdash x \\Rightarrow \\sigma"
            },
            {
              id: "InfApp",
              name: "InfApp",
              premises: ["\\Gamma \\vdash e_1 \\Rightarrow \\tau_1 \\to \\tau_2", "\\Gamma \\vdash e_2 \\Leftarrow \\tau_1"],
              conclusion: "\\Gamma \\vdash e_1~e_2 \\Rightarrow \\tau_2"
            }
          ]
        }
      ]
    }
  },
  {
    id: "Worklist",
    name: "Worklist (Dunfield-Krishnaswami)",
    labels: ["Global", "Unification", "Bidirectional", "Worklist", "Dunfield-Krishnaswami", "Higher-Rank", "Implicit"],
    viewMode: "linear",
    paper: {
      title: "A Mechanical Formalization of Higher-Ranked Polymorphic Type Inference",
      authors: ["Jinxu Zhao", "Bruno C. d. S. Oliveira", "Tom Schrijvers"],
      year: 2019,
      url: "https://dl.acm.org/doi/10.1145/3341716"
    },
    rules: [
      {
        id: "GCTyVar",
        name: "GCTyVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma, a \\longrightarrow \\Gamma"
      },
      {
        id: "GCExVar",
        name: "GCExVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma, \\hat{\\alpha} \\longrightarrow \\Gamma"
      },
      {
        id: "GCVar",
        name: "GCVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma, x:A \\longrightarrow \\Gamma"
      },
      {
        id: "SUnit",
        name: "SUnit",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash 1 \\le 1 \\longrightarrow \\Gamma"
      },
      {
        id: "STyVar",
        name: "STyVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash a \\le a \\longrightarrow \\Gamma"
      },
      {
        id: "SExVar",
        name: "SExVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\hat{\\alpha} \\le \\hat{\\alpha} \\longrightarrow \\Gamma"
      },
      {
        id: "SArr",
        name: "SArr",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash A_1 \\to A_2 \\le B_1 \\to B_2 \\longrightarrow \\Gamma \\vdash A_2 \\le B_2, \\Gamma \\vdash B_1 \\le A_1"
      },
      {
        id: "SAllL",
        name: "SAllL",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\forall a.~A \\le B \\longrightarrow \\Gamma, \\hat{\\alpha} \\vdash [\\hat{\\alpha}/a]A \\le B"
      },
      {
        id: "SAllR",
        name: "SAllR",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash A \\le \\forall b.~B \\longrightarrow \\Gamma, b \\vdash A \\le B"
      },
      {
        id: "InstLArr",
        name: "InstLArr",
        premises: ["\\hat{\\alpha} \\notin FV(A) \\cup FV(B)"],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}] \\vdash \\hat{\\alpha} \\le A \\to B \\longrightarrow [\\hat{\\alpha}_1 \\to \\hat{\\alpha}_2/\\hat{\\alpha}](\\Gamma[\\hat{\\alpha}_1, \\hat{\\alpha}_2] \\vdash \\hat{\\alpha}_1 \\to \\hat{\\alpha}_2 \\le A \\to B)"
      },
      {
        id: "InstRArr",
        name: "InstRArr",
        premises: ["\\hat{\\alpha} \\notin FV(A) \\cup FV(B)"],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}] \\vdash A \\to B \\le \\hat{\\alpha} \\longrightarrow [\\hat{\\alpha}_1 \\to \\hat{\\alpha}_2/\\hat{\\alpha}](\\Gamma[\\hat{\\alpha}_1, \\hat{\\alpha}_2] \\vdash A \\to B \\le \\hat{\\alpha}_1 \\to \\hat{\\alpha}_2)"
      },
      {
        id: "InstLSolve",
        name: "InstLSolve",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}][\\hat{\\beta}] \\vdash \\hat{\\alpha} \\le \\hat{\\beta} \\longrightarrow [\\hat{\\alpha}/\\hat{\\beta}](\\Gamma[\\hat{\\alpha}][])"
      },
      {
        id: "InstRSolve",
        name: "InstRSolve",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}][\\hat{\\beta}] \\vdash \\hat{\\beta} \\le \\hat{\\alpha} \\longrightarrow [\\hat{\\alpha}/\\hat{\\beta}](\\Gamma[\\hat{\\alpha}][])"
      },
      {
        id: "InstLReach",
        name: "InstLReach",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[a][\\hat{\\beta}] \\vdash a \\le \\hat{\\beta} \\longrightarrow [a/\\hat{\\beta}](\\Gamma[a][])"
      },
      {
        id: "InstRReach",
        name: "InstRReach",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[a][\\hat{\\beta}] \\vdash \\hat{\\beta} \\le a \\longrightarrow [a/\\hat{\\beta}](\\Gamma[a][])"
      },
      {
        id: "InstLUnit",
        name: "InstLUnit",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\beta}] \\vdash 1 \\le \\hat{\\beta} \\longrightarrow [1/\\hat{\\beta}](\\Gamma[])"
      },
      {
        id: "InstRUnit",
        name: "InstRUnit",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\beta}] \\vdash \\hat{\\beta} \\le 1 \\longrightarrow [1/\\hat{\\beta}](\\Gamma[])"
      },
      {
        id: "ChkSub",
        name: "ChkSub",
        premises: ["e \\neq \\lambda e'", "B \\neq \\forall B'"],
        conclusion: "",
        reduction: "\\Gamma \\vdash e \\Leftarrow B \\longrightarrow \\Gamma \\vdash e \\Rightarrow_a a \\le B"
      },
      {
        id: "ChkAll",
        name: "ChkAll",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash e \\Leftarrow \\forall a.~A \\longrightarrow \\Gamma, a \\vdash e \\Leftarrow A"
      },
      {
        id: "ChkAbs",
        name: "ChkAbs",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\lambda x.~e \\Leftarrow A \\to B \\longrightarrow \\Gamma, x:A \\vdash e \\Leftarrow B"
      },
      {
        id: "ChkAbsExVar",
        name: "ChkAbsExVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}] \\vdash \\lambda x.~e \\Leftarrow \\hat{\\alpha} \\longrightarrow [\\hat{\\alpha}_1 \\to \\hat{\\alpha}_2/\\hat{\\alpha}](\\Gamma[\\hat{\\alpha}_1, \\hat{\\alpha}_2], x:\\hat{\\alpha}_1 \\vdash e \\Leftarrow \\hat{\\alpha}_2)"
      },
      {
        id: "InfVar",
        name: "InfVar",
        premises: ["(x:A) \\in \\Gamma"],
        conclusion: "",
        reduction: "\\Gamma \\vdash x \\Rightarrow_a \\omega \\longrightarrow \\Gamma \\vdash [A/a]\\omega"
      },
      {
        id: "InfAnn",
        name: "InfAnn",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash (e:A) \\Rightarrow_a \\omega \\longrightarrow \\Gamma \\vdash [A/a]\\omega \\vdash e \\Leftarrow A"
      },
      {
        id: "InfUnit",
        name: "InfUnit",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash () \\Rightarrow_a \\omega \\longrightarrow \\Gamma \\vdash [1/a]\\omega"
      },
      {
        id: "InfAbs",
        name: "InfAbs",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\lambda x.~e \\Rightarrow_a \\omega \\longrightarrow \\Gamma, \\hat{\\alpha}, \\hat{\\beta} \\vdash [\\hat{\\alpha} \\to \\hat{\\beta}/a]\\omega, x:\\hat{\\alpha} \\vdash e \\Leftarrow \\hat{\\beta}"
      },
      {
        id: "InfApp",
        name: "InfApp",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash e_1 ~ e_2 \\Rightarrow_a \\omega \\longrightarrow \\Gamma \\vdash e_1 \\Rightarrow_b (b \\bullet e_2 \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a \\omega)"
      },
      {
        id: "InfAppAll",
        name: "InfAppAll",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\forall a.~A ~ \\bullet e \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a \\omega \\longrightarrow \\Gamma, \\hat{\\alpha} \\vdash [\\hat{\\alpha}/a]A ~ \\bullet e \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a \\omega"
      },
      {
        id: "InfAppArr",
        name: "InfAppArr",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash A \\to C ~ \\bullet e \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a \\omega \\longrightarrow \\Gamma \\vdash [C/a]\\omega \\vdash e \\Leftarrow A"
      },
      {
        id: "InfAppExVar",
        name: "InfAppExVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}] \\vdash \\hat{\\alpha} ~ \\bullet e \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a \\omega \\longrightarrow [\\hat{\\alpha}_1 \\to \\hat{\\alpha}_2/\\hat{\\alpha}](\\Gamma[\\hat{\\alpha}_1, \\hat{\\alpha}_2] \\vdash \\hat{\\alpha}_1 \\to \\hat{\\alpha}_2 ~ \\bullet e \\mathrel{\\mathrlap{\\Rightarrow}\\phantom{~}\\Rightarrow}_a \\omega)"
      }
    ]
  },
  {
    id: "Elementary",
    name: "Worklist (Elementary)",
    labels: ["Global", "Unification", "Worklist", "Dunfield-Krishnaswami", "System F", "Higher-Rank", "Implicit", "Explicit Type Application"],
    viewMode: "linear",
    paper: {
      title: "Elementary Type Inference",
      authors: ["Jinxu Zhao", "Bruno C. d. S. Oliveira"],
      year: 2022,
      url: "https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ECOOP.2022.2"
    },
    rules: [
      {
        id: "placeholder",
        name: "TBA",
        premises: [],
        conclusion: "\\text{Rules will be added soon.}"
      }
    ]
  },
  {
    id: "Bounded",
    name: "Worklist (Bounded Quantification)",
    labels: ["Global", "Unification", "Worklist", "System Fsub", "Dunfield-Krishnaswami", "Higher-Rank", "Implicit", "Explicit Type Application", "Bounded-Quantification"],
    viewMode: "linear",
    paper: {
      title: "Greedy Implicit Bounded Quantification",
      authors: ["Chen Cui", "Shengyi Jiang", "Bruno C. d. S. Oliveira"],
      year: 2023,
      url: "https://dl.acm.org/doi/10.1145/3622871"
    },
    rules: [
      {
        id: "placeholder",
        name: "TBA",
        premises: [],
        conclusion: "\\text{Rules will be added soon.}"
      }
    ]
  },
  {
    id: "IU",
    name: "Worklist (Intersection and Union)",
    labels: ["Global", "Unification", "Worklist", "System F", "Dunfield-Krishnaswami", "Higher-Rank", "Implicit", "Explicit Type Application", "Intersection-Union"],
    viewMode: "linear",
    paper: {
      title: "Bidirectional Higher-Rank Polymorphism with Intersection and Union Types",
      authors: ["Shengyi Jiang", "Chen Cui", "Bruno C. d. S. Oliveira"],
      year: 2025,
      url: "https://i.cs.hku.hk/~bruno/papers/popl25_hrp.pdf"
    },
    rules: [
      {
        id: "placeholder",
        name: "TBA",
        premises: [],
        conclusion: "\\text{Rules will be added soon.}"
      }
    ]
  },
];

const universalExamples = [
  {
    name: "Trivial Application",
    expression: "(\\x. x) 1",
    description: "Trivial function application of identity function to integer literal"
  }
];

export const algorithmExamples = {
  "*": universalExamples,
  "W": [
    ...universalExamples,
    {
      name: "Identity",
      expression: "\\x. x",
      description: "The identity function"
    },
    {
      name: "Let-Polymorphism",
      expression: "let id = (\\x. x) in (id 1, id True)",
      description: "id can be instantiated with different types"
    }
  ],
  "R": universalExamples,
  "DK": universalExamples,
  "Contextual": universalExamples,
  "Worklist": universalExamples,
  "Elementary": universalExamples,
  "Bounded": universalExamples,
  "IU": universalExamples
} as const;
