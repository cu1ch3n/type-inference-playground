import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check, X as CrossIcon, Home } from 'lucide-react';
import { algorithms } from '@/data/algorithms';
import { runInference } from '@/lib/mockInference';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { InferenceResult } from '@/types/inference';

interface ComparisonCell {
  algorithmId: string;
  expression: string;
  result?: InferenceResult;
  loading: boolean;
}

export const Compare = () => {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['W']);
  const [expressions, setExpressions] = useState<string[]>(['\\x. x', '(\\x. x) 1']);
  const [newExpression, setNewExpression] = useState('');
  const [comparisonResults, setComparisonResults] = useState<Map<string, ComparisonCell>>(new Map());

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

  const renderCell = (algorithmId: string, expression: string) => {
    const key = getCellKey(algorithmId, expression);
    const cell = comparisonResults.get(key);

    if (!cell) {
      return (
        <div className="flex items-center justify-center h-16">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runComparison(algorithmId, expression)}
            className="text-xs"
          >
            Run
          </Button>
        </div>
      );
    }

    if (cell.loading) {
      return (
        <div className="flex items-center justify-center h-16">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!cell.result) {
      return (
        <div className="flex items-center justify-center h-16">
          <span className="text-muted-foreground text-xs">No result</span>
        </div>
      );
    }

    if (!cell.result.success) {
      return (
        <div className="flex items-center justify-center h-16">
          <CrossIcon className="h-5 w-5 text-destructive" />
        </div>
      );
    }

    if (cell.result.finalType) {
      return (
        <div className="flex flex-col items-center justify-center h-16 gap-1 p-2">
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
      <div className="flex items-center justify-center h-16">
        <Check className="h-5 w-5 text-green-500" />
      </div>
    );
  };

  const availableAlgorithms = algorithms.filter(alg => !selectedAlgorithms.includes(alg.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Playground
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Algorithm Comparison</h1>
            <p className="text-muted-foreground">Compare type inference algorithms across different expressions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Algorithm Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedAlgorithms.map(algorithmId => {
                  const algorithm = algorithms.find(a => a.id === algorithmId);
                  return (
                    <Badge key={algorithmId} variant="secondary" className="flex items-center gap-1">
                      {algorithm?.name || algorithmId}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeAlgorithm(algorithmId)}
                      />
                    </Badge>
                  );
                })}
              </div>
              
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Expressions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {expressions.map(expression => (
                  <div key={expression} className="flex items-center gap-2 p-2 border rounded">
                    <KaTeXRenderer expression={expression} className="flex-1 text-sm" />
                    <X 
                      className="h-4 w-4 cursor-pointer hover:text-destructive flex-shrink-0" 
                      onClick={() => removeExpression(expression)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newExpression}
                  onChange={(e) => setNewExpression(e.target.value)}
                  placeholder="Enter expression (e.g., \x. x)"
                  onKeyDown={(e) => e.key === 'Enter' && addExpression()}
                  className="flex-1"
                />
                <Button onClick={addExpression} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comparison Results</CardTitle>
            <Button onClick={runAllComparisons} disabled={selectedAlgorithms.length === 0 || expressions.length === 0}>
              Run All Comparisons
            </Button>
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
                            <div className="space-y-1">
                              <div className="font-semibold">{algorithm?.name || algorithmId}</div>
                              <div className="flex flex-wrap gap-1 justify-center">
                                {algorithm?.labels.slice(0, 2).map(label => (
                                  <Badge key={label} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expressions.map(expression => (
                      <TableRow key={expression}>
                        <TableCell className="font-mono text-sm border-r">
                          <KaTeXRenderer expression={expression} />
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
  );
};

export default Compare;