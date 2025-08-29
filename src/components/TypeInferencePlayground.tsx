import { useState, useEffect, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ExpressionInput } from './ExpressionInput';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';
import { PanelLeft, Workflow, Code, Binary, Maximize2, BookOpen, Minus } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KaTeXRenderer } from './KaTeXRenderer';

import { TypingRules } from './TypingRules';
import { ZoomDialog } from './ZoomDialog';
import { WasmStatusIndicator } from './WasmStatusIndicator';
import { DerivationViewer } from './DerivationViewer';
import { ShareExportButtons } from './ShareExportButtons';
import { ModernStackedSidebar } from './ModernStackedSidebar';
import { useAlgorithms } from '@/contexts/AlgorithmContext';
import { wasmInference } from '@/lib/wasmInterface';
import { InferenceResult, SubtypingResult, AlgorithmResult } from '@/types/inference';
import { getParamsFromUrl, cleanUrl } from '@/lib/shareUtils';

export const TypeInferencePlayground = () => {
  const { algorithms: allAlgorithms, loading: algorithmsLoading } = useAlgorithms();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('W');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<AlgorithmResult | undefined>();
  const [isInferring, setIsInferring] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<string | undefined>();
  const [activeStepPath, setActiveStepPath] = useState<number[] | undefined>();
  const [initialized, setInitialized] = useState(false);
  const [zoomAlgorithms, setZoomAlgorithms] = useState(false);
  const [zoomExpression, setZoomExpression] = useState(false);
  const [zoomDerivation, setZoomDerivation] = useState(false);
  const [zoomRules, setZoomRules] = useState(false);
  
  // Panel collapse states
  const [algorithmsCollapsed, setAlgorithmsCollapsed] = useState(false);
  const [expressionCollapsed, setExpressionCollapsed] = useState(false);
  const [rulesCollapsed, setRulesCollapsed] = useState(false);
  
  const expressionInputRef = useRef<HTMLTextAreaElement>(null);
  const algorithmsRef = useRef<ImperativePanelHandle>(null);
  const expressionRef = useRef<ImperativePanelHandle>(null);
  const rulesRef = useRef<ImperativePanelHandle>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  

  const selectedAlgorithmData = allAlgorithms.find(a => a.Id === selectedAlgorithm);

  // Panel collapse handlers
  const handleCollapseAlgorithms = () => {
    algorithmsRef.current?.collapse();
  };

  const handleExpandAlgorithms = () => {
    algorithmsRef.current?.expand();
  };

  const handleCollapseExpression = () => {
    expressionRef.current?.collapse();
  };

  const handleExpandExpression = () => {
    expressionRef.current?.expand();
  };

  const handleCollapseRules = () => {
    rulesRef.current?.collapse();
  };

  const handleExpandRules = () => {
    rulesRef.current?.expand();
  };

  const handleAlgorithmChange = (algorithmId: string) => {
    setSelectedAlgorithm(algorithmId);
    
    // Reset variant to default when changing algorithm
    const algorithmData = allAlgorithms.find(a => a.Id === algorithmId);
    if (algorithmData?.DefaultVariant) {
      setSelectedVariant(algorithmData.DefaultVariant);
    } else {
      setSelectedVariant('');
    }
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
  };

  // Initialize from URL parameters once, then clean the URL
  useEffect(() => {
    if (!algorithmsLoading && allAlgorithms.length > 0) {
      const { algorithm, expression: urlExpression, variant } = getParamsFromUrl();
      
      if (algorithm && allAlgorithms.find(a => a.Id === algorithm)) {
        setSelectedAlgorithm(algorithm);
        
        // Set variant if provided and valid for this algorithm
        const algorithmData = allAlgorithms.find(a => a.Id === algorithm);
        if (variant && algorithmData?.Variants?.find(v => v.Id === variant)) {
          setSelectedVariant(variant);
        } else if (algorithmData?.DefaultVariant) {
          setSelectedVariant(algorithmData.DefaultVariant);
        }
      } else if (allAlgorithms.length > 0) {
        // Set first algorithm as default
        setSelectedAlgorithm(allAlgorithms[0].Id);
        setSelectedVariant(allAlgorithms[0].DefaultVariant || '');
      }
      
      if (urlExpression) {
        setExpression(urlExpression);
      } else {
        setExpression('(\\x. x) 1'); // Default expression
      }
      
      // Clean URL after loading parameters
      if (algorithm || urlExpression || variant) {
        cleanUrl();
      }
      
      setInitialized(true);
    }
  }, [algorithmsLoading, allAlgorithms]);


  const handleInference = async () => {
    if (!expression.trim() || !selectedAlgorithm) return;
    
    setIsInferring(true);
    setActiveRuleId(undefined);
    setActiveStepPath(undefined);
    
    try {
      let inferenceResult: AlgorithmResult;
      
      if (selectedAlgorithmData?.Mode === 'subtyping') {
        // Handle subtyping mode
        const parts = expression.split(' <: ');
        if (parts.length !== 2) {
          throw new Error('Subtyping expression must be in format "LeftType <: RightType"');
        }
        
        const wasmResult = await wasmInference.runSubtyping({
          algorithm: selectedAlgorithm,
          variant: selectedVariant || 'recursive',
          leftType: parts[0].trim(),
          rightType: parts[1].trim(),
          options: { showSteps: true, maxDepth: 100 }
        });
        
        if (!wasmResult.success || !wasmResult.result) {
          throw new Error(wasmResult.error || 'WASM subtyping failed');
        }
        
        const result = wasmResult.result as any;
        inferenceResult = {
          success: result.success || false,
          finalType: result.finalType,
          derivation: result.derivation || [],
          error: result.error,
          errorLatex: result.errorLatex || false
        };
      } else {
        // Handle type inference mode
        const wasmResult = await wasmInference.runInference({
          algorithm: selectedAlgorithm,
          variant: selectedVariant,
          expression,
          options: { showSteps: true, maxDepth: 100 }
        });
        
        if (!wasmResult.success || !wasmResult.result) {
          throw new Error(wasmResult.error || 'WASM inference failed');
        }
        
        const result = wasmResult.result as any;
        inferenceResult = {
          success: result.success || false,
          finalType: result.finalType,
          derivation: result.derivation || [],
          error: result.error,
          errorLatex: result.errorLatex || false
        };
      }
      
      setResult(inferenceResult);
      
    } catch (error) {
      console.error('Inference error:', error);
      setResult({
        success: false,
        error: 'An unexpected error occurred during type inference.',
        derivation: []
      });
    } finally {
      setIsInferring(false);
    }
  };

  const handleRuleClick = (ruleId: string) => {
    const isToggling = activeRuleId === ruleId;
    setActiveRuleId(isToggling ? undefined : ruleId);
    
    if (!isToggling) {
      // Always clear step selection when clicking a rule
      setActiveStepPath(undefined);
      
      // Check if this rule is actually used in the derivation
      const isRuleUsedInDerivation = (steps: any[]): boolean => {
        for (const step of steps) {
          if (step.ruleId === ruleId) return true;
          if (step.children && isRuleUsedInDerivation(step.children)) return true;
        }
        return false;
      };
      
      if (result?.derivation) {
        if (isRuleUsedInDerivation(result.derivation)) {
          // Rule is used in derivation - set it as active (this will highlight all matching steps)
          setActiveRuleId(ruleId);
        } else {
          // Rule is not used in derivation - clear everything
          setActiveRuleId(undefined);
        }
      } else {
        // No derivation - clear everything
        setActiveRuleId(undefined);
      }
    } else {
      // Toggling off - clear everything
      setActiveStepPath(undefined);
      setActiveRuleId(undefined);
    }
  };

  const handleStepClick = (stepPath: number[]) => {
    const isToggling = activeStepPath && activeStepPath.join('-') === stepPath.join('-');
    
    if (isToggling) {
      // Toggling off - clear everything
      setActiveStepPath(undefined);
      setActiveRuleId(undefined);
    } else {
      // Setting new step - always set the step path
      setActiveStepPath(stepPath);
      
      // Find the step and set corresponding rule
      const findStepAtPath = (steps: any[], path: number[]): any | undefined => {
        if (!path || path.length === 0) return undefined;
        
        let current = steps;
        for (let i = 0; i < path.length; i++) {
          const index = path[i];
          if (!current[index]) return undefined;
          
          if (i === path.length - 1) {
            return current[index];
          }
          
          current = current[index].children || [];
        }
        return undefined;
      };
      
      if (result?.derivation) {
        const step = findStepAtPath(result.derivation, stepPath);
        if (step?.ruleId) {
          setActiveRuleId(step.ruleId);
        }
      }
    }
  };

  // Auto-run inference when algorithm, variant, or expression changes (only after initialization)
  useEffect(() => {
    if (initialized && expression.trim() && selectedAlgorithm) {
      const timer = setTimeout(() => {
        handleInference();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedAlgorithm, selectedVariant, expression, initialized]);



  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern resizable layout for all screens */}
        <div className="flex flex-1 overflow-hidden">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Left Sidebar - Algorithm Selector */}
            <Panel 
              ref={algorithmsRef}
              id="algorithms"
              order={1}
              defaultSize={25} 
              minSize={15} 
              maxSize={40} 
              collapsible={true}
              collapsedSize={3}
              onCollapse={() => setAlgorithmsCollapsed(true)}
              onExpand={() => setAlgorithmsCollapsed(false)}
            >
              {algorithmsCollapsed ? (
                <div 
                  className="h-full w-full flex flex-col items-center justify-center bg-background border-r border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={handleExpandAlgorithms}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center justify-center" style={{ height: '60px', width: '20px' }}>
                      <span 
                        className="text-sm font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap select-none"
                        style={{ 
                          transform: 'rotate(270deg)',
                          transformOrigin: 'center'
                        }}
                      >
                        Algorithms
                      </span>
                    </div>
                    <Binary className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col bg-background border-r border-border">
                  <div className="p-2 flex items-center justify-between h-10">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Binary className="w-4 h-4 text-primary" />
                      Algorithms
                    </h3>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCollapseAlgorithms}
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                        title="Minimize panel"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoomAlgorithms(true)}
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                        title="Maximize panel"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mx-2 border-b border-border"></div>
                  <div className="flex-1 p-3 overflow-y-auto">
                    <AlgorithmSelector
                      algorithms={allAlgorithms}
                      selectedAlgorithm={selectedAlgorithm}
                      selectedVariant={selectedVariant}
                      onAlgorithmChange={handleAlgorithmChange}
                      onVariantChange={handleVariantChange}
                    />
                  </div>
                </div>
              )}
            </Panel>

            <PanelResizeHandle className="bg-border hover:bg-primary/20 transition-colors shadow-sm" style={{ width: '0.5px' }} />

            {/* Main Content Area */}
            <Panel id="main" order={2} defaultSize={75} minSize={50}>
              <PanelGroup direction="vertical" className="h-full">
                {/* Top Row - Expression and Derivation */}
                <Panel id="top-row" order={1} defaultSize={60} minSize={30} className="bg-background">
                  <PanelGroup direction="horizontal" className="h-full">
                    {/* Expression Input Column */}
                    <Panel 
                      ref={expressionRef}
                      id="expression"
                      order={1}
                      defaultSize={35} 
                      minSize={25} 
                      maxSize={55} 
                      collapsible={true}
                      collapsedSize={3}
                      onCollapse={() => setExpressionCollapsed(true)}
                      onExpand={() => setExpressionCollapsed(false)}
                    >
                      {expressionCollapsed ? (
                        <div 
                          className="h-full w-full flex flex-col items-center justify-center bg-background border-r border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={handleExpandExpression}
                        >
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="flex items-center justify-center" style={{ height: '60px', width: '20px' }}>
                              <span 
                                className="text-sm font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap select-none"
                                style={{ 
                                  transform: 'rotate(270deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                Expression
                              </span>
                            </div>
                            <Code className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col bg-background border-r border-border">
                          <div className="p-2 flex items-center justify-between h-10">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <Code className="w-4 h-4 text-primary" />
                              Expression
                            </h3>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCollapseExpression}
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                                title="Minimize panel"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setZoomExpression(true)}
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                                title="Maximize panel"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="mx-2 border-b border-border"></div>
                          <div className="flex-1 p-3 overflow-y-auto">
                            <ExpressionInput
                              ref={expressionInputRef}
                              expression={expression}
                              onExpressionChange={(expr) => {
                                setExpression(expr);
                                if (!expr.trim()) {
                                  setResult(undefined);
                                }
                              }}
                              onInfer={handleInference}
                              isInferring={isInferring}
                              selectedAlgorithm={selectedAlgorithm}
                              algorithms={allAlgorithms}
                              selectedVariant={selectedVariant}
                            />
                          </div>
                        </div>
                      )}
                    </Panel>

                    <PanelResizeHandle className="bg-border hover:bg-primary/20 transition-colors shadow-sm" style={{ width: '0.5px' }} />

                    {/* Derivation Column */}
                    <Panel id="derivation" order={2} defaultSize={65} minSize={45}>
                      <div className="h-full flex flex-col bg-background">
                        <div className="p-2 flex items-center justify-between h-10">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Workflow className="w-4 h-4 text-primary flex-shrink-0" />
                            <h2 className="text-sm font-medium flex-shrink-0">Derivation</h2>
                            {result?.finalType && (
                              <div className="flex items-center gap-2 ml-2 min-w-0">
                                <Separator orientation="vertical" className="h-3 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground flex-shrink-0">Type:</span>
                                <Badge variant="secondary" className="text-xs font-mono max-w-32 truncate">
                                  <KaTeXRenderer expression={result.finalType} />
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedAlgorithmData && expression && (
                              <ShareExportButtons
                                algorithm={selectedAlgorithmData}
                                expression={expression}
                                result={result}
                                variant={selectedVariant}
                                disabled={isInferring}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setZoomDerivation(true)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                            >
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="mx-2 border-b border-border"></div>
                        <div className="flex-1 p-3 overflow-y-auto">
                          <DerivationViewer
                            result={result}
                            algorithm={selectedAlgorithmData}
                            activeStepPath={activeStepPath}
                            activeRuleId={activeRuleId}
                            onStepClick={handleStepClick}
                            expression={expression}
                            isInferring={isInferring}
                            variant={selectedVariant}
                          />
                        </div>
                      </div>
                    </Panel>
                  </PanelGroup>
                </Panel>

                <PanelResizeHandle className="h-px bg-border hover:bg-primary/20 transition-colors shadow-sm" />

                {/* Bottom Row - Typing Rules (Full Width) */}
                <Panel 
                  ref={rulesRef}
                  id="rules"
                  order={2}
                  defaultSize={40} 
                  minSize={20} 
                  collapsible={true}
                  collapsedSize={5}
                  onCollapse={() => setRulesCollapsed(true)}
                  onExpand={() => setRulesCollapsed(false)}
                  className="bg-background"
                >
                  {rulesCollapsed ? (
                    <div 
                      className="h-full w-full flex items-center justify-center bg-background border-t border-border hover:bg-muted/30 transition-colors cursor-pointer group gap-2"
                      onClick={handleExpandRules}
                    >
                      <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      <span 
                        className="text-sm font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap select-none"
                      >
                        Typing Rules
                      </span>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="p-2 flex items-center justify-between h-10 border-b border-border">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Typing Rules
                        </h3>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCollapseRules}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                            title="Minimize panel"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setZoomRules(true)}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-smooth"
                            title="Maximize panel"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto">
                        {selectedAlgorithmData && (
                          <TypingRules
                            rules={
                              selectedVariant && selectedAlgorithmData.VariantRules?.find(([id]) => id === selectedVariant)?.[1]
                                ? selectedAlgorithmData.VariantRules.find(([id]) => id === selectedVariant)?.[1] || selectedAlgorithmData.Rules
                                : selectedAlgorithmData.RuleGroups || selectedAlgorithmData.Rules
                            }
                            activeRuleId={activeRuleId}
                            onRuleClick={handleRuleClick}
                            showHeader={false}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </Panel>
                  </PanelGroup>
                </Panel>
          </PanelGroup>
        </div>

        {/* Zoom Dialogs */}
        <ZoomDialog
          open={zoomAlgorithms}
          onOpenChange={setZoomAlgorithms}
          title="Algorithms"
          icon={<Binary className="w-4 h-4 text-primary" />}
        >
          <div className="h-full">
            <AlgorithmSelector
              algorithms={allAlgorithms}
              selectedAlgorithm={selectedAlgorithm}
              selectedVariant={selectedVariant}
              onAlgorithmChange={handleAlgorithmChange}
              onVariantChange={handleVariantChange}
            />
          </div>
        </ZoomDialog>

        <ZoomDialog
          open={zoomExpression}
          onOpenChange={setZoomExpression}
          title="Expression"
          icon={<Code className="w-4 h-4 text-primary" />}
        >
          <div className="h-full">
            <ExpressionInput
              ref={expressionInputRef}
              expression={expression}
              onExpressionChange={(expr) => {
                setExpression(expr);
                if (!expr.trim()) {
                  setResult(undefined);
                }
              }}
              onInfer={handleInference}
              isInferring={isInferring}
              selectedAlgorithm={selectedAlgorithm}
              algorithms={allAlgorithms}
              selectedVariant={selectedVariant}
            />
          </div>
        </ZoomDialog>

        <ZoomDialog
          open={zoomDerivation}
          onOpenChange={setZoomDerivation}
          title="Derivation"
          icon={<Workflow className="w-4 h-4 text-primary" />}
        >
          <div className="h-full flex flex-col">
            {result?.finalType && (
              <div className="mb-4 p-3 bg-muted/20 rounded border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="secondary" className="text-sm font-mono">
                    <KaTeXRenderer expression={result.finalType} />
                  </Badge>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              <DerivationViewer
                result={result}
                algorithm={selectedAlgorithmData}
                activeStepPath={activeStepPath}
                activeRuleId={activeRuleId}
                onStepClick={handleStepClick}
                expression={expression}
                isInferring={isInferring}
                variant={selectedVariant}
              />
            </div>
          </div>
        </ZoomDialog>

        <ZoomDialog
          open={zoomRules}
          onOpenChange={setZoomRules}
          title="Algorithmic Rules"
          icon={<BookOpen className="w-4 h-4 text-primary" />}
        >
          <div className="h-full">
            {selectedAlgorithmData && (
              <TypingRules
                rules={
                  selectedVariant && selectedAlgorithmData.VariantRules?.find(([id]) => id === selectedVariant)?.[1]
                    ? selectedAlgorithmData.VariantRules.find(([id]) => id === selectedVariant)?.[1] || selectedAlgorithmData.Rules
                    : selectedAlgorithmData.RuleGroups || selectedAlgorithmData.Rules
                }
                activeRuleId={activeRuleId}
                onRuleClick={handleRuleClick}
                showHeader={false}
              />
            )}
          </div>
        </ZoomDialog>
      </div>
    </div>
  );
};