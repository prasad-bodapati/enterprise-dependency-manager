import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Settings, GitBranch, Users, Package, Shield, Calendar, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project, Component, InsertComponent, Dependency, InsertDependency } from "@shared/schema";
import { ComponentForm } from "@/components/ComponentForm";
import { DependencyForm } from "@/components/DependencyForm";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isAddComponentDialogOpen, setIsAddComponentDialogOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false);

  // Fetch project details
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['/api/projects', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID provided');
      const response = await apiRequest('GET', `/api/projects/${id}`);
      return response.json() as Promise<Project>;
    },
    enabled: !!id,
  });

  // Create component mutation
  const createComponentMutation = useMutation({
    mutationFn: async (componentData: InsertComponent) => {
      const response = await apiRequest('POST', '/api/components', componentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Component created",
        description: "The component has been successfully added to your project.",
      });
      setIsAddComponentDialogOpen(false);
      // Invalidate components query when we implement it
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'components'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating component",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Create dependency mutation
  const createDependencyMutation = useMutation({
    mutationFn: async (dependencyData: Omit<InsertDependency, 'addedBy'>) => {
      const response = await apiRequest('POST', '/api/dependencies', dependencyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dependency added",
        description: "The dependency has been successfully added to the component.",
      });
      setIsDependencyDialogOpen(false);
      setSelectedComponentId(null);
      // Invalidate dependency queries
      queryClient.invalidateQueries({ queryKey: ['/api/dependencies'] });
      if (selectedComponentId) {
        queryClient.invalidateQueries({ queryKey: ['/api/components', selectedComponentId, 'dependencies'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error adding dependency",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Fetch project components
  const { data: components = [], isLoading: componentsLoading } = useQuery({
    queryKey: ['/api/projects', id, 'components'],
    queryFn: async () => {
      if (!id) throw new Error('No project ID provided');
      const response = await apiRequest('GET', `/api/projects/${id}/components`);
      return response.json() as Promise<Component[]>;
    },
    enabled: !!id,
  });

  // Fetch all dependencies for the project (across all components)
  const { data: allDependencies = [] } = useQuery({
    queryKey: ['/api/dependencies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dependencies');
      return response.json() as Promise<Dependency[]>;
    },
  });

  // Filter dependencies for this project's components
  const projectDependencies = allDependencies.filter(dep => 
    components.some(comp => comp.id === dep.componentId)
  );

  // TODO: Fetch vulnerability count when vulnerabilities API is ready
  const vulnerabilities = []; // Placeholder for now

  const handleCreateComponent = (componentData: InsertComponent) => {
    createComponentMutation.mutate(componentData);
  };

  const handleCreateDependency = (dependencyData: Omit<InsertDependency, 'addedBy'>) => {
    // Ensure componentId is explicitly included and add server-side fields
    const fullDependencyData = {
      ...dependencyData,
      componentId: selectedComponentId!
    };
    createDependencyMutation.mutate(fullDependencyData);
  };

  const handleAddDependency = (componentId: string) => {
    setSelectedComponentId(componentId);
    setIsDependencyDialogOpen(true);
  };

  const getComponentDependencies = (componentId: string) => {
    return allDependencies.filter(dep => dep.componentId === componentId);
  };

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
                <Button 
                  size="sm" 
                  onClick={() => setIsAddComponentDialogOpen(true)}
                  data-testid="button-add-component"
                >
                  Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {componentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : components.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-components">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No components added yet
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsAddComponentDialogOpen(true)}
                    data-testid="button-add-first-component"
                  >
                    Add First Component
                  </Button>
                </div>
              ) : (
                <div className="space-y-3" data-testid="components-list">
                  {components.map((component) => {
                    const componentDependencies = getComponentDependencies(component.id);
                    return (
                      <Card key={component.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground" data-testid={`component-name-${component.id}`}>
                              {component.name}
                            </h4>
                            {component.description && (
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`component-description-${component.id}`}>
                                {component.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {component.submodulePath && (
                                <Badge variant="outline" className="text-xs" data-testid={`component-path-${component.id}`}>
                                  {component.submodulePath}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs" data-testid={`component-dependency-count-${component.id}`}>
                                {componentDependencies.length} dependencies
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created {formatDate(component.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAddDependency(component.id)}
                              data-testid={`button-add-dependency-${component.id}`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Dependency
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-component-menu-${component.id}`}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
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
                  {projectDependencies.length}
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

      {/* Add Component Dialog */}
      <Dialog open={isAddComponentDialogOpen} onOpenChange={setIsAddComponentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Component</DialogTitle>
            <DialogDescription>
              Create a new component or module within this project to organize your dependencies.
            </DialogDescription>
          </DialogHeader>
          {project && (
            <ComponentForm
              projectId={project.id}
              onSubmit={handleCreateComponent}
              onCancel={() => setIsAddComponentDialogOpen(false)}
              isLoading={createComponentMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dependency Dialog */}
      <Dialog open={isDependencyDialogOpen} onOpenChange={setIsDependencyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Dependency</DialogTitle>
            <DialogDescription>
              Add a new Gradle dependency to the selected component.
            </DialogDescription>
          </DialogHeader>
          {selectedComponentId && (
            <DependencyForm
              componentId={selectedComponentId}
              onSubmit={handleCreateDependency}
              onCancel={() => {
                setIsDependencyDialogOpen(false);
                setSelectedComponentId(null);
              }}
              isLoading={createDependencyMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}