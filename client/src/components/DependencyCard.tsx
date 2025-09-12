import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Edit, Trash2, Package2 } from "lucide-react";

interface DependencyCardProps {
  dependency: {
    id: string;
    groupId: string;
    artifactId: string;
    version: string;
    scope: string;
    description?: string;
    vulnerabilityCount: number;
    lastUpdated: string;
  };
  onEdit?: (dependencyId: string) => void;
  onDelete?: (dependencyId: string) => void;
}

export function DependencyCard({ dependency, onEdit, onDelete }: DependencyCardProps) {
  const handleEdit = () => {
    console.log(`Editing dependency: ${dependency.groupId}:${dependency.artifactId}`);
    onEdit?.(dependency.id);
  };

  const handleDelete = () => {
    console.log(`Deleting dependency: ${dependency.groupId}:${dependency.artifactId}`);
    onDelete?.(dependency.id);
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'implementation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'api': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'compileOnly': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'testImplementation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getVulnerabilityColor = (count: number) => {
    if (count === 0) return "text-green-600";
    if (count <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover-elevate" data-testid={`card-dependency-${dependency.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Package2 className="h-4 w-4 text-muted-foreground" />
              <code className="font-mono text-sm">
                {dependency.groupId}:{dependency.artifactId}
              </code>
            </CardTitle>
            {dependency.description && (
              <CardDescription className="text-sm">
                {dependency.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">
            v{dependency.version}
          </Badge>
          <Badge className={`text-xs ${getScopeColor(dependency.scope)}`}>
            {dependency.scope}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 text-sm ${getVulnerabilityColor(dependency.vulnerabilityCount)}`}>
            {dependency.vulnerabilityCount === 0 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>
              {dependency.vulnerabilityCount === 0 ? "No vulnerabilities" : `${dependency.vulnerabilityCount} vulnerabilities`}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Updated {dependency.lastUpdated}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}