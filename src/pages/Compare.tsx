import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check, X as CrossIcon, RotateCcw, GripVertical, GitCompare, CornerUpLeft } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { algorithms } from '@/data/algorithms';
import { runInference } from '@/lib/mockInference';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { Navbar } from '@/components/Navbar';
import { DerivationModal } from '@/components/DerivationModal';
import { CompareShareExportButtons } from '@/components/CompareShareExportButtons';
import { getCompareParamsFromUrl, cleanUrl } from '@/lib/shareUtils';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { InferenceResult } from '@/types/inference';

interface ComparisonCell {
  algorithmId: string;
  expression: string;
  result?: InferenceResult;
  loading: boolean;
}

// Sortable Algorithm Badge Component
const SortableAlgorithmBadge = ({ algorithmId, algorithm, onRemove }: { 
  algorithmId: string; 
  algorithm: any; 
  onRemove: (id: string) => void; 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: algorithmId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Badge 
        variant="secondary" 
        className={`flex items-center gap-1 cursor-move select-none transition-all duration-200 ${
          isDragging ? 'scale-95 shadow-lg' : ''
        }`}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" {...listeners} />
        {algorithm?.name || algorithmId}
        <X 
          className="h-3 w-3 cursor-pointer hover:text-destructive" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(algorithmId);
          }}
        />
      </Badge>
    </div>
  );
};

// Sortable Expression Item Component
const SortableExpressionItem = ({ expression, onRemove }: { 
  expression: string; 
  onRemove: (expr: string) => void; 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: expression });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-2 p-2 border rounded cursor-move select-none transition-all duration-200 ${
        isDragging ? 'scale-95 shadow-lg' : ''
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" {...listeners} />
      <code className="flex-1 text-sm font-code">{expression}</code>
      <X 
        className="h-4 w-4 cursor-pointer hover:text-destructive flex-shrink-0" 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(expression);
        }}
      />
    </div>
  );
};

export const Compare = () => {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['W']);
  const [expressions, setExpressions] = useState<string[]>(['\\x. x', '(\\x. x) 1']);
  const [newExpression, setNewExpression] = useState('');
  const [comparisonResults, setComparisonResults] = useState<Map<string, ComparisonCell>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{algorithmId: string; expression: string; result?: InferenceResult} | null>(null);
  const navigate = useNavigate();

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load shared state from URL on mount
  useEffect(() => {
    const { algorithms: sharedAlgorithms, expressions: sharedExpressions } = getCompareParamsFromUrl();
    
    if (sharedAlgorithms.length > 0 || sharedExpressions.length > 0) {
      // Validate algorithms exist
      const validAlgorithms = sharedAlgorithms.filter(id => 
        algorithms.some(alg => alg.id === id)
      );
      
      if (validAlgorithms.length > 0) {
        setSelectedAlgorithms(validAlgorithms);
      }
      
      if (sharedExpressions.length > 0) {
        setExpressions(sharedExpressions);
      }
      
      // Clean URL after loading
      cleanUrl();
    }
  }, []);

  const getCellKey = (algorithmId: string, expression: string) => `${algorithmId}:${expression}`;

  const runComparison = useCallback(async (algorithmId: string, expression: string) => {
    const key = getCellKey(algorithmId, expression);
    
    setComparisonResults(prev => new Map(prev.set(key, {
      algorithmId,
      expression,
      loading: true
    })));

    try {
      const result = await runInference(algorithmId, expression);
      setComparisonResults(prev => new Map(prev.set(key, {
        algorithmId,
        expression,
        result,
        loading: false
      })));
    } catch (error) {
      setComparisonResults(prev => new Map(prev.set(key, {
        algorithmId,
        expression,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          derivation: []
        },
        loading: false
      })));
    }
  }, []);

  const runAllComparisons = useCallback(async () => {
    for (const algorithmId of selectedAlgorithms) {
      for (const expression of expressions) {
        await runComparison(algorithmId, expression);
      }
    }
  }, [selectedAlgorithms, expressions, runComparison]);

  const addAlgorithm = (algorithmId: string) => {
    if (!selectedAlgorithms.includes(algorithmId)) {
      setSelectedAlgorithms(prev => [...prev, algorithmId]);
    }
  };

  const removeAlgorithm = (algorithmId: string) => {
    setSelectedAlgorithms(prev => prev.filter(id => id !== algorithmId));
    // Remove results for this algorithm
    setComparisonResults(prev => {
      const newMap = new Map(prev);
      expressions.forEach(expr => {
        newMap.delete(getCellKey(algorithmId, expr));
      });
      return newMap;
    });
  };

  const addExpression = () => {
    if (newExpression.trim() && !expressions.includes(newExpression.trim())) {
      setExpressions(prev => [...prev, newExpression.trim()]);
      setNewExpression('');
    }
  };

  const removeExpression = (expression: string) => {
    setExpressions(prev => prev.filter(expr => expr !== expression));
    // Remove results for this expression
    setComparisonResults(prev => {
      const newMap = new Map(prev);
      selectedAlgorithms.forEach(alg => {
        newMap.delete(getCellKey(alg, expression));
      });
      return newMap;
    });
  };

  const clearAllAlgorithms = () => {
    setSelectedAlgorithms([]);
    setComparisonResults(new Map());
  };

  const clearAllExpressions = () => {
    setExpressions([]);
    setComparisonResults(new Map());
  };

  // Handle drag end for both algorithms and expressions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Check if dragging algorithms
    if (selectedAlgorithms.includes(active.id as string)) {
      const oldIndex = selectedAlgorithms.indexOf(active.id as string);
      const newIndex = selectedAlgorithms.indexOf(over.id as string);

      if (oldIndex !== newIndex) {
        setSelectedAlgorithms(arrayMove(selectedAlgorithms, oldIndex, newIndex));
      }
    }
    
    // Check if dragging expressions
    if (expressions.includes(active.id as string)) {
      const oldIndex = expressions.indexOf(active.id as string);
      const newIndex = expressions.indexOf(over.id as string);

      if (oldIndex !== newIndex) {
        setExpressions(arrayMove(expressions, oldIndex, newIndex));
      }
    }
  };

  // Auto-run comparisons when algorithms or expressions change
  useEffect(() => {
    if (selectedAlgorithms.length > 0 && expressions.length > 0) {
      runAllComparisons();
    }
  }, [selectedAlgorithms, expressions, runAllComparisons]);

  const handleCellDoubleClick = (algorithmId: string, expression: string) => {
    const key = getCellKey(algorithmId, expression);
    const cell = comparisonResults.get(key);
    
    setModalData({
      algorithmId,
      expression,
      result: cell?.result
    });
    setModalOpen(true);
  };

  const renderCell = (algorithmId: string, expression: string) => {
    const key = getCellKey(algorithmId, expression);
    const cell = comparisonResults.get(key);

    if (!cell) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onDoubleClick={() => handleCellDoubleClick(algorithmId, expression)}
          title="Double-click to view detailed derivation"
        >
          <span className="text-muted-foreground text-xs">Pending...</span>
        </div>
      );
    }

    if (cell.loading) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onDoubleClick={() => handleCellDoubleClick(algorithmId, expression)}
          title="Double-click to view detailed derivation"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!cell.result) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onDoubleClick={() => handleCellDoubleClick(algorithmId, expression)}
          title="Double-click to view detailed derivation"
        >
          <span className="text-muted-foreground text-xs">No result</span>
        </div>
      );
    }

    if (!cell.result.success) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onDoubleClick={() => handleCellDoubleClick(algorithmId, expression)}
          title="Double-click to view detailed derivation"
        >
          <CrossIcon className="h-5 w-5 text-destructive" />
        </div>
      );
    }

    if (cell.result.finalType) {
      return (
        <div 
          className="flex flex-col items-center justify-center h-16 gap-1 p-2 cursor-pointer hover:bg-accent/50 transition-colors"
          onDoubleClick={() => handleCellDoubleClick(algorithmId, expression)}
          title="Double-click to view detailed derivation"
        >
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <div className="text-xs max-w-full overflow-hidden">
            <KaTeXRenderer 
              expression={cell.result.finalType} 
              className="text-xs"
            />
          </div>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
        onDoubleClick={() => handleCellDoubleClick(algorithmId, expression)}
        title="Double-click to view detailed derivation"
      >
        <Check className="h-5 w-5 text-green-500" />
      </div>
    );
  };

  const availableAlgorithms = algorithms.filter(alg => !selectedAlgorithms.includes(alg.id));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background animate-fade-in">
        <Navbar />
        
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-stagger-1">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitCompare className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Algorithm Comparison</h1>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('compare');
                      window.history.pushState({}, '', url.toString());
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="btn-interactive h-9 px-3 flex items-center gap-2"
                  >
                    <CornerUpLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Return</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return to main page</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground">Compare type inference algorithms across different expressions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-stagger-2">
            {/* Algorithm Selection */}
            <Card className="academic-panel hover-scale-sm transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Selected Algorithms</CardTitle>
                {selectedAlgorithms.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllAlgorithms} className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-smooth">
                    <RotateCcw className="h-4 w-4 transition-transform duration-200 hover:rotate-180" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <SortableContext items={selectedAlgorithms} strategy={horizontalListSortingStrategy}>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlgorithms.map((algorithmId) => {
                      const algorithm = algorithms.find(a => a.id === algorithmId);
                      return (
                        <SortableAlgorithmBadge
                          key={algorithmId}
                          algorithmId={algorithmId}
                          algorithm={algorithm}
                          onRemove={removeAlgorithm}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
                
                {availableAlgorithms.length > 0 && (
                  <div className="flex gap-2">
                    <Select onValueChange={addAlgorithm}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add algorithm..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAlgorithms.map(algorithm => (
                          <SelectItem key={algorithm.id} value={algorithm.id}>
                            {algorithm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expression Management */}
            <Card className="academic-panel hover-scale-sm transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Test Expressions</CardTitle>
                {expressions.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllExpressions} className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-smooth">
                    <RotateCcw className="h-4 w-4 transition-transform duration-200 hover:rotate-180" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <SortableContext items={expressions} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {expressions.map((expression) => (
                      <SortableExpressionItem
                        key={expression}
                        expression={expression}
                        onRemove={removeExpression}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                <div className="flex gap-2">
                   <Input
                     value={newExpression}
                     onChange={(e) => setNewExpression(e.target.value)}
                     placeholder="Enter expression (e.g., \x. x)"
                     onKeyDown={(e) => e.key === 'Enter' && addExpression()}
                     className="flex-1 font-code"
                   />
                  <Button onClick={addExpression} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <Card className="academic-panel animate-stagger-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Comparison</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">💡 Double-click any cell to view detailed derivation in a modal</p>
              </div>
              <CompareShareExportButtons
                selectedAlgorithms={selectedAlgorithms}
                expressions={expressions}
                comparisonResults={comparisonResults}
              />
            </CardHeader>
            <CardContent>
              {selectedAlgorithms.length === 0 || expressions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedAlgorithms.length === 0 && "Select at least one algorithm"}
                  {selectedAlgorithms.length === 0 && expressions.length === 0 && " and "}
                  {expressions.length === 0 && "add at least one expression"}
                  {" to start comparing."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Expression</TableHead>
                        {selectedAlgorithms.map(algorithmId => {
                          const algorithm = algorithms.find(a => a.id === algorithmId);
                          return (
                            <TableHead key={algorithmId} className="text-center min-w-[120px]">
                              <div className="font-semibold">{algorithm?.name || algorithmId}</div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expressions.map(expression => (
                        <TableRow key={expression}>
                           <TableCell className="font-code text-sm border-r">
                             <code>{expression}</code>
                           </TableCell>
                          {selectedAlgorithms.map(algorithmId => (
                            <TableCell key={`${expression}-${algorithmId}`} className="text-center">
                              {renderCell(algorithmId, expression)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Derivation Modal */}
      {modalData && (
        <DerivationModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          algorithmId={modalData.algorithmId}
          expression={modalData.expression}
          result={modalData.result}
        />
      )}
    </DndContext>
  );
};

export default Compare;