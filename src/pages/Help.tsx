import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Quick Reference</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Syntax reference for type inference expressions and types
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Types Reference */}
          <Card className="academic-panel hover-scale-sm transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code2 className="w-6 h-6 text-primary" />
                Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Int</Badge>
                  <span className="text-sm text-muted-foreground">Integer type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Bool</Badge>
                  <span className="text-sm text-muted-foreground">Boolean type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Top</Badge>
                  <span className="text-sm text-muted-foreground">Top type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Bot</Badge>
                  <span className="text-sm text-muted-foreground">Bottom type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">forall a. Type</Badge>
                  <span className="text-sm text-muted-foreground">Universal quantification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">forall (a &lt;: Type). Type</Badge>
                  <span className="text-sm text-muted-foreground">Bounded quantification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Type -&gt; Type</Badge>
                  <span className="text-sm text-muted-foreground">Function type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Type &amp; Type</Badge>
                  <span className="text-sm text-muted-foreground">Intersection type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">Type | Type</Badge>
                  <span className="text-sm text-muted-foreground">Union type</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">(Type, Type)</Badge>
                  <span className="text-sm text-muted-foreground">Tuple type</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Reference */}
          <Card className="academic-panel hover-scale-sm transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code2 className="w-6 h-6 text-accent" />
                Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="font-code text-sm">0, 1, 2 ...</Badge>
                  <span className="text-sm text-muted-foreground">Integer literals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">True / False</Badge>
                  <span className="text-sm text-muted-foreground">Boolean literals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">\\x. x</Badge>
                  <span className="text-sm text-muted-foreground">Lambda abstraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">(\\x -&gt; x) 1</Badge>
                  <span className="text-sm text-muted-foreground">Function application</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-code text-sm">1 : Int</Badge>
                  <span className="text-sm text-muted-foreground">Type annotation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="font-code text-sm">/\\a. (\\x -&gt; x) : a -&gt; a</Badge>
                  <span className="text-sm text-muted-foreground">Type abstraction</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="font-code text-sm">(\\a. (\\x -&gt; x) : a -&gt; a) @Int 3</Badge>
                  <span className="text-sm text-muted-foreground">Type application</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="font-code text-sm">let id = \\x. x in id 1</Badge>
                  <span className="text-sm text-muted-foreground">Let binding</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="mt-6 academic-panel">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>Use these syntax patterns in the expression input to test different type inference algorithms.</p>
              <p className="mt-2">For more complex examples, check the algorithm-specific examples in the main playground.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;