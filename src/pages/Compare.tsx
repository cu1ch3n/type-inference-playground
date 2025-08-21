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
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

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
  const { toast } = useToast();
  
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

  const handleCopyExpression = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(expression);
      toast({
        description: "Expression copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        description: "Failed to copy expression",
        variant: "destructive",
        duration: 2000,
      });
    }
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
      <code 
        className="flex-1 text-sm font-code cursor-pointer hover:bg-accent/50 px-1 py-0.5 rounded transition-colors"
        onClick={handleCopyExpression}
      >
        {expression}
      </code>
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
  const { toast } = useToast();
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['W']);
  const [expressions, setExpressions] = useState<string[]>(['\\x. x', '(\\x. x) 1']);
  const [newExpression, setNewExpression] = useState('');
  const [comparisonResults, setComparisonResults] = useState<Map<string, ComparisonCell>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{algorithmId: string; expression: string; result?: InferenceResult} | null>(null);
  const navigate = useNavigate();

  // Keyboard shortcuts for compare page
  useKeyboardShortcuts([
    {
      ...KEYBOARD_SHORTCUTS.CLOSE_MODAL,
      action: () => {
        if (modalOpen) {
          setModalOpen(false);
        }
      }
    },
    {
      ...KEYBOARD_SHORTCUTS.TOGGLE_COMPARE,
      action: () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('compare');
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    },
    {
      key: 'Enter',
      action: () => {
        if (newExpression.trim()) {
          addExpression();
        }
      }
    }
  ]);

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

  const handleCellClick = (algorithmId: string, expression: string) => {
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
          onClick={() => handleCellClick(algorithmId, expression)}
          title="Click to view detailed derivation"
        >
          <span className="text-muted-foreground text-xs">Pending...</span>
        </div>
      );
    }

    if (cell.loading) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCellClick(algorithmId, expression)}
          title="Click to view detailed derivation"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!cell.result) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCellClick(algorithmId, expression)}
          title="Click to view detailed derivation"
        >
          <span className="text-muted-foreground text-xs">No result</span>
        </div>
      );
    }

    if (!cell.result.success) {
      return (
        <div 
          className="flex items-center justify-center h-16 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCellClick(algorithmId, expression)}
          title="Click to view detailed derivation"
        >
          <CrossIcon className="h-5 w-5 text-destructive" />
        </div>
      );
    }

    if (cell.result.finalType) {
      return (
        <div 
          className="flex flex-col items-center justify-center h-16 gap-1 p-2 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCellClick(algorithmId, expression)}
          title="Click to view detailed derivation"
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
        onClick={() => handleCellClick(algorithmId, expression)}
        title="Click to view detailed derivation"
      >
        <Check className="h-5 w-5 text-green-500" />
      </div>
    );
  };

  const availableAlgorithms = algorithms.filter(alg => !selectedAlgorithms.includes(alg.id));

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen bg-background animate-fade-in transition-smooth">
          <Navbar />
          
          <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-stagger-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-stagger-2">
              <div className="flex items-center gap-3">
                <GitCompare className="h-6 w-6 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Algorithm Comparison</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <CornerUpLeft className="h-4 w-4" />
                  Back to Playground
                </Button>
                <CompareShareExportButtons 
                  selectedAlgorithms={selectedAlgorithms}
                  expressions={expressions}
                  comparisonResults={comparisonResults}
                />
              </div>
            </div>

            {/* Algorithm Selection */}
            <Card className="mb-6 animate-stagger-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Selected Algorithms</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllAlgorithms}
                      disabled={selectedAlgorithms.length === 0}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <SortableContext items={selectedAlgorithms} strategy={horizontalListSortingStrategy}>
                      {selectedAlgorithms.map(algorithmId => {
                        const algorithm = algorithms.find(alg => alg.id === algorithmId);
                        return (
                          <SortableAlgorithmBadge
                            key={algorithmId}
                            algorithmId={algorithmId}
                            algorithm={algorithm}
                            onRemove={removeAlgorithm}
                          />
                        );
                      })}
                    </SortableContext>
                  </div>
                  <div className="flex gap-2">
                    <Select onValueChange={addAlgorithm} value="">
                      <SelectTrigger className="w-[200px]">
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
                </div>
              </CardContent>
            </Card>

            {/* Expression Management */}
            <Card className="mb-6 animate-stagger-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Test Expressions</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllExpressions}
                    disabled={expressions.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <SortableContext items={expressions} strategy={verticalListSortingStrategy}>
                      {expressions.map(expression => (
                        <SortableExpressionItem
                          key={expression}
                          expression={expression}
                          onRemove={removeExpression}
                        />
                      ))}
                    </SortableContext>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter lambda expression..."
                      value={newExpression}
                      onChange={(e) => setNewExpression(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addExpression();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={addExpression} disabled={!newExpression.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Table */}
            {selectedAlgorithms.length > 0 && expressions.length > 0 && (
              <Card className="animate-stagger-5">
                <CardHeader>
                  <CardTitle>Comparison Results</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click any cell to view detailed derivation
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Expression</TableHead>
                          {selectedAlgorithms.map(algorithmId => {
                            const algorithm = algorithms.find(alg => alg.id === algorithmId);
                            return (
                              <TableHead key={algorithmId} className="text-center min-w-[120px]">
                                {algorithm?.name || algorithmId}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expressions.map(expression => (
                          <TableRow key={expression}>
                            <TableCell className="sticky left-0 bg-background z-10 font-mono text-sm border-r">
                              {expression}
                            </TableCell>
                            {selectedAlgorithms.map(algorithmId => (
                              <TableCell key={`${algorithmId}-${expression}`} className="p-0 border-l">
                                {renderCell(algorithmId, expression)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedAlgorithms.length === 0 && (
              <Card className="animate-stagger-5">
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Select algorithms to start comparing</p>
                </CardContent>
              </Card>
            )}

            {expressions.length === 0 && selectedAlgorithms.length > 0 && (
              <Card className="animate-stagger-5">
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Add expressions to start comparing</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DndContext>
        
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
    </>
  );
};

export default Compare;