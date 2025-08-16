import { TypeInferenceAlgorithm } from "@/types/inference";

export const algorithms: TypeInferenceAlgorithm[] = [
  {
    id: "algorithm-w",
    name: "Algorithm W",
    labels: ["Global", "Unification", "Hindley-Milner", "Let-generalization", "Principal type"],
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
        premises: ["\\Gamma \\vdash e_1 : \\tau_1 \\rightarrow \\tau_2", "\\Gamma \\vdash e_2 : \\tau_1"],
        conclusion: "\\Gamma \\vdash e_1 \\; e_2 : \\tau_2"
      },
      {
        id: "Abs",
        name: "Abs",
        premises: ["r = newvar", "\\Gamma, x : \\tau \\vdash e : \\tau', S"],
        conclusion: "\\Gamma \\vdash \\lambda x.e : S\\tau \\rightarrow \\tau', S"
      },
      {
        id: "Let",
        name: "Let",
        premises: ["\\Gamma \\vdash e_0 : \\tau, S_0", "S_0\\Gamma, x : \\overline{S_0\\Gamma}(\\tau) \\vdash e_1 : \\tau', S_1"],
        conclusion: "\\Gamma \\vdash \\text{let} x = e_0 \\text{in} e_1 : \\tau', S_1 S_0"
      }
    ]
  },
  {
    id: "worklist",
    name: "A Mechanical Formalization of Higher-Ranked Polymorphic Type Inference",
    labels: ["Global", "Unification", "Dunfield-Krishnaswami"],
    viewMode: "linear",
    paper: {
      title: "A Mechanical Formalization of Higher-Ranked Polymorphic Type Inference",
      authors: ["Jinxu Zhao", "Bruno C. d. S. Oliveira", "Tom Schrijvers"],
      year: 2019,
      url: "https://dl.acm.org/doi/10.1145/3341716"
    },

//     \begin{gather*}
// \begin{aligned}
// \Gm, a &\algrule \Gm \qquad
// \Gm, \al \algrule \Gm \qquad
// \Gm, x:A \algrule \Gm
// \\[3mm]
// \Gm \Vdash 1\le 1 &\algrule \Gm\\
// \Gm \Vdash a\le a &\algrule \Gm\\
// \Gm \Vdash \al\le \al &\algrule \Gm\\
// \Gm \Vdash A_1\to A_2 \le B_1\to B_2 &\algrule \Gm \Vdash A_2 \le B_2 \Vdash B_1\le A_1\\
// \Gm \Vdash \all A\le B &\algrule \Gm,\al \Vdash [\al/a]A\le B \quad\text{when } B \neq \all B'\\
// \Gm \Vdash A\le \all[b]B &\algrule \Gm,b \Vdash A\le B
// \\[3mm]
// %\\
// %\text{Let } \color{red}\Gm[\al \toto B // G_M] &:= \Gm_L, G_M, [B/\al]\Gm_R, \text{ when } \Gm[\al] = \Gm_L,\al,\Gm_R \ (G_M\text{ defaults to }\nil)\\
// \Gm[\al] \Vdash \al \le A\to B &\algrule [\al[1]\to\al[2]/\al] (\Gm[\al[1], \al[2]] \Vdash \al[1]\to \al[2] \le A \to B)\\
//  &\qquad\qquad \text{when }\al\notin FV(A)\cup FV(B)\\
// \Gm[\al] \Vdash A\to B \le \al &\algrule [\al[1]\to \al[2]/\al] (\Gm[\al[1], \al[2]] \Vdash A \to B \le \al[1]\to \al[2])\\
//  &\qquad\qquad \text{when }\al\notin FV(A)\cup FV(B)
//  \\[3mm]
// \Gm[\al][\bt] \Vdash \al \le \bt &\algrule [\al/\bt](\Gm[\al][])\\
// \Gm[\al][\bt] \Vdash \bt \le \al &\algrule [\al/\bt](\Gm[\al][])\\
// \Gm[a][\bt] \Vdash a \le \bt &\algrule [a/\bt](\Gm[a][])\\
// \Gm[a][\bt] \Vdash \bt \le a &\algrule [a/\bt](\Gm[a][])\\
// \Gm[\bt] \Vdash 1 \le \bt &\algrule [1/\bt](\Gm[])\\
// \Gm[\bt] \Vdash \bt \le 1 &\algrule [1/\bt](\Gm[])
// \\[3mm]
// \Gm \Vdash e \Lto B &\algrule \Gm \Vdash e\To_a a\le B \quad
//     \text{when } e \neq \lam e' \text{ and } B \neq \all B'\\
// % \Gm \Vdash () \Lto 1 &\algrule \Gm\\
// \Gm \Vdash e\Lto \all A &\algrule \Gm,a \Vdash e\Lto A\\
// \Gm \Vdash \lam e \Lto A\to B &\algrule \Gm, x:A  \Vdash e \Lto B\\
// \Gm[\al] \Vdash \lam e \Lto \al &\algrule [\al[1]\to \al[2] / \al](\Gm[\al[1],\al[2]], x:\al[1] \Vdash e \Lto \al[2])
// % \quad\text{\jimmy{Additional}}
// \\[3mm]
// \Gm \Vdash x\To_a \jg &\algrule \Gm \Vdash [A/a] \jg \quad \text{when } (x:A)\in \Gm\\
// \Gm \Vdash (e:A)\To_a \jg &\algrule \Gm \Vdash [A/a]\jg \Vdash e \Lto A\\
// \Gm \Vdash ()\To_a \jg &\algrule \Gm \Vdash [1/a]\jg\\
// \Gm \Vdash \lam e \To_a \jg &\algrule
//     \Gm,\al,\bt \Vdash [\al\to\bt/a]\jg, x:\al \Vdash e\Lto \bt\\
// \Gm \Vdash e_1\ e_2 \To_a \jg &\algrule \Gm \Vdash e_1\To_b (\appInfAlg{b}{e_2})
// \\[3mm]
// \Gm \Vdash \appInfAlg{\all A}{e} &\algrule \Gm,\al \Vdash \appInfAlg{[\al/a]A}{e}\\
// \Gm \Vdash \appInfAlg{A\to C}{e} &\algrule \Gm \Vdash [C/a]\jg \Vdash e \Lto A\\
// \Gm[\al] \Vdash \appInfAlg{\al}{e} &\algrule
//     [\al[1]\to\al[2]/\al](\Gm[\al[1], \al[2]] \Vdash \appInfAlg{\al[1]\to\al[2]}{e})
// %	[\al[1]\to\al[2]/\al](\Gm[\al[1], \al[2]] \Vdash [\al[2]/a]\jg \Vdash e\Lto \al[1])\\
// % &\color{magenta} \makebox[0pt]{\qquad or} \phantom{{}\rrule{}{}}
// \end{aligned}
    rules: [
      // Garbage Collection Rules
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
      
      // Subtyping Rules
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
        id: "SFun",
        name: "SFun",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash A_1 \\to A_2 \\le B_1 \\to B_2 \\longrightarrow \\Gamma \\vdash A_2 \\le B_2, \\Gamma \\vdash B_1 \\le A_1"
      },
      {
        id: "SForallL",
        name: "SForallL",
        premises: ["B \\neq \\forall B'"],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\forall a. A \\le B \\longrightarrow \\Gamma, \\hat{\\alpha} \\vdash [\\hat{\\alpha}/a]A \\le B"
      },
      {
        id: "SForallR",
        name: "SForallR",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash A \\le \\forall b. B \\longrightarrow \\Gamma, b \\vdash A \\le B"
      },
      
      // Existential Variable Instantiation Rules
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
      
      // Checking Rules
      {
        id: "ChkSub",
        name: "ChkSub",
        premises: ["e \\neq \\lambda e'", "B \\neq \\forall B'"],
        conclusion: "",
        reduction: "\\Gamma \\vdash e \\Leftarrow B \\longrightarrow \\Gamma \\vdash e \\Rightarrow_a a \\le B"
      },
      {
        id: "ChkGen",
        name: "ChkGen",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash e \\Leftarrow \\forall a. A \\longrightarrow \\Gamma, a \\vdash e \\Leftarrow A"
      },
      {
        id: "ChkLam",
        name: "ChkLam",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\lambda x. e \\Leftarrow A \\to B \\longrightarrow \\Gamma, x:A \\vdash e \\Leftarrow B"
      },
      {
        id: "ChkLamExVar",
        name: "ChkLamExVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}] \\vdash \\lambda x. e \\Leftarrow \\hat{\\alpha} \\longrightarrow [\\hat{\\alpha}_1 \\to \\hat{\\alpha}_2/\\hat{\\alpha}](\\Gamma[\\hat{\\alpha}_1, \\hat{\\alpha}_2], x:\\hat{\\alpha}_1 \\vdash e \\Leftarrow \\hat{\\alpha}_2)"
      },
      
      // Synthesis Rules
      {
        id: "SynVar",
        name: "SynVar",
        premises: ["(x:A) \\in \\Gamma"],
        conclusion: "",
        reduction: "\\Gamma \\vdash x \\Rightarrow_a \\mathcal{J} \\longrightarrow \\Gamma \\vdash [A/a]\\mathcal{J}"
      },
      {
        id: "SynAnno",
        name: "SynAnno",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash (e:A) \\Rightarrow_a \\mathcal{J} \\longrightarrow \\Gamma \\vdash [A/a]\\mathcal{J}, \\Gamma \\vdash e \\Leftarrow A"
      },
      {
        id: "SynUnit",
        name: "SynUnit",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash () \\Rightarrow_a \\mathcal{J} \\longrightarrow \\Gamma \\vdash [1/a]\\mathcal{J}"
      },
      {
        id: "SynLam",
        name: "SynLam",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\lambda x. e \\Rightarrow_a \\mathcal{J} \\longrightarrow \\Gamma, \\hat{\\alpha}, \\hat{\\beta} \\vdash [\\hat{\\alpha} \\to \\hat{\\beta}/a]\\mathcal{J}, x:\\hat{\\alpha} \\vdash e \\Leftarrow \\hat{\\beta}"
      },
      {
        id: "SynApp",
        name: "SynApp",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash e_1 \\; e_2 \\Rightarrow_a \\mathcal{J} \\longrightarrow \\Gamma \\vdash e_1 \\Rightarrow_b (b \\; \\triangleright \\; e_2)"
      },
      
      // Application Synthesis Rules
      {
        id: "AppForall",
        name: "AppForall",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash \\forall a. A \\; \\triangleright \\; e \\longrightarrow \\Gamma, \\hat{\\alpha} \\vdash [\\hat{\\alpha}/a]A \\; \\triangleright \\; e"
      },
      {
        id: "AppFun",
        name: "AppFun",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma \\vdash A \\to C \\; \\triangleright \\; e \\longrightarrow \\Gamma \\vdash [C/a]\\mathcal{J}, \\Gamma \\vdash e \\Leftarrow A"
      },
      {
        id: "AppExVar",
        name: "AppExVar",
        premises: [],
        conclusion: "",
        reduction: "\\Gamma[\\hat{\\alpha}] \\vdash \\hat{\\alpha} \\; \\triangleright \\; e \\longrightarrow [\\hat{\\alpha}_1 \\to \\hat{\\alpha}_2/\\hat{\\alpha}](\\Gamma[\\hat{\\alpha}_1, \\hat{\\alpha}_2] \\vdash \\hat{\\alpha}_1 \\to \\hat{\\alpha}_2 \\; \\triangleright \\; e)"
      }
    ]
  }
];

export const algorithmExamples = {
  "algorithm-w": [
    {
      name: "Identity",
      expression: "\\x. x",
      description: "The identity function"
    },
    {
      name: "Constant",
      expression: "\\x. \\y. x",
      description: "The constant function"
    },
    {
      name: "Composition",
      expression: "\\f. \\g. \\x. f (g x)",
      description: "Function composition"
    }
  ],
  "worklist": [
    {
      name: "Identity",
      expression: "\\x. x",
      description: "Identity with constraint generation"
    },
    {
      name: "Variable",
      expression: "x",
      description: "Simple variable lookup"
    },
    {
      name: "Application",
      expression: "f x",
      description: "Function application with constraints"
    }
  ]
} as const;