import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle, CheckCircle, Package } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    repositoryUrl?: string;
    componentCount: number;
    vulnerabilityCount: number;
    lastUpdated: string;
  };
  onViewProject?: (projectId: string) => void;
}

export function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const handleViewProject = () => {
    console.log(`Viewing project: ${project.name}`);
    onViewProject?.(project.id);
  };

  const getSeverityColor = (count: number) => {
    if (count === 0) return "text-green-600";
    if (count <= 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover-elevate" data-testid={`card-project-${project.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="text-sm text-muted-foreground">
                {project.description}
              </CardDescription>
            )}
          </div>
          {project.repositoryUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{project.componentCount} components</span>
          </div>
          <div className={`flex items-center gap-1 ${getSeverityColor(project.vulnerabilityCount)}`}>
            {project.vulnerabilityCount === 0 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{project.vulnerabilityCount} vulnerabilities</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Updated {project.lastUpdated}
          </Badge>
          <Button onClick={handleViewProject} data-testid={`button-view-project-${project.id}`}>
            View Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}