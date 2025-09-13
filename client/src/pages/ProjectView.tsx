import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Settings, GitBranch, Users, Package, Shield, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@shared/schema";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();

  // Fetch project details
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['/api/projects', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID provided');
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json() as Promise<Project>;
    },
    enabled: !!id,
  });

  // TODO: Fetch project components when components API is ready
  const components = []; // Placeholder for now

  // TODO: Fetch project dependencies when dependencies API is ready  
  const dependencies = []; // Placeholder for now

  // TODO: Fetch vulnerability count when vulnerabilities API is ready
  const vulnerabilities = []; // Placeholder for now

  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return 'Unknown';
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getLastUpdated = (dateValue: Date | string | null) => {
    if (!dateValue) return 'unknown';
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return 'unknown';
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        
        <div className="text-center py-12" data-testid="project-error">
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or may have been deleted.
          </p>
          <Link to="/projects">
            <Button data-testid="button-back-to-projects">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-project-name">
              {project.name}
            </h1>
            <p className="text-muted-foreground">
              Last updated {getLastUpdated(project.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Basic information and details about this Gradle project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground" data-testid="text-project-description">
                  {project.description || 'No description provided'}
                </p>
              </div>
              
              {project.repositoryUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Repository</h4>
                  <a 
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    data-testid="link-repository"
                  >
                    <GitBranch className="h-3 w-3" />
                    {project.repositoryUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-created-date">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-updated-date">
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Components</CardTitle>
                  <CardDescription>
                    Modules and submodules within this project
                  </CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-component">
                  Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {components.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-components">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No components added yet
                  </p>
                  <Button size="sm" variant="outline" data-testid="button-add-first-component">
                    Add First Component
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* TODO: Render components list when components API is ready */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Components</span>
                </div>
                <Badge variant="secondary" data-testid="badge-component-count">
                  {components.length}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dependencies</span>
                </div>
                <Badge variant="secondary" data-testid="badge-dependency-count">
                  {dependencies.length}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Vulnerabilities</span>
                </div>
                <Badge variant={vulnerabilities.length > 0 ? "destructive" : "secondary"} data-testid="badge-vulnerability-count">
                  {vulnerabilities.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-manage-components">
                <Package className="h-4 w-4 mr-2" />
                Manage Components
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-view-dependencies">
                <Users className="h-4 w-4 mr-2" />
                View Dependencies
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-security-scan">
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </Button>

              <Separator />

              <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-edit-project">
                <Settings className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </CardContent>
          </Card>

          {/* Project ID (for debugging/API) */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">PROJECT ID</h4>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded" data-testid="text-project-id">
                  {project.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}