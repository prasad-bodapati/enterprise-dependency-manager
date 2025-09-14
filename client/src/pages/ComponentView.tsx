import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Settings, Package, Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Component, Dependency, InsertDependency } from "@shared/schema";
import { DependencyForm } from "@/components/DependencyForm";

export default function ComponentView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false);

  // Fetch component details
  const { data: component, isLoading, error } = useQuery({
    queryKey: ['/api/components', id],
    queryFn: async () => {
      if (!id) throw new Error('No component ID provided');
      const response = await apiRequest('GET', `/api/components/${id}`);
      return response.json() as Promise<Component>;
    },
    enabled: !!id,
  });

  // Fetch component dependencies
  const { data: dependencies = [], isLoading: dependenciesLoading } = useQuery({
    queryKey: ['/api/components', id, 'dependencies'],
    queryFn: async () => {
      if (!id) throw new Error('No component ID provided');
      const response = await apiRequest('GET', `/api/components/${id}/dependencies`);
      return response.json() as Promise<Dependency[]>;
    },
    enabled: !!id,
  });

  // Create dependency mutation
  const createDependencyMutation = useMutation({
    mutationFn: async (dependencyData: Omit<InsertDependency, 'addedBy'>) => {
      const response = await apiRequest('POST', `/api/components/${id}/dependencies`, dependencyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dependency added",
        description: "The dependency has been successfully added to the component.",
      });
      setIsDependencyDialogOpen(false);
      // Invalidate dependency queries
      queryClient.invalidateQueries({ queryKey: ['/api/components', id, 'dependencies'] });
    },
    onError: (error) => {
      toast({
        title: "Error adding dependency",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete dependency mutation
  const deleteDependencyMutation = useMutation({
    mutationFn: async (dependencyId: string) => {
      const response = await apiRequest('DELETE', `/api/components/${id}/dependencies/${dependencyId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dependency removed",
        description: "The dependency has been successfully removed from the component.",
      });
      // Invalidate dependency queries
      queryClient.invalidateQueries({ queryKey: ['/api/components', id, 'dependencies'] });
    },
    onError: (error) => {
      toast({
        title: "Error removing dependency",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCreateDependency = (dependencyData: Omit<InsertDependency, 'addedBy'>) => {
    const fullDependencyData = {
      ...dependencyData,
      componentId: id!
    };
    createDependencyMutation.mutate(fullDependencyData);
  };

  const handleDeleteDependency = (dependencyId: string) => {
    deleteDependencyMutation.mutate(dependencyId);
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

  if (error || !component) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" data-testid="button-back" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card className="text-center py-12" data-testid="component-error">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">
              {error ? "Error Loading Component" : "Component Not Found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {error 
                ? "Failed to load component details. Please try again."
                : "The component you're looking for doesn't exist or may have been deleted."
              }
            </p>
            <div className="flex gap-2 justify-center">
              {error && (
                <Button 
                  variant="outline" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/components', id] })}
                  data-testid="button-retry"
                >
                  Try Again
                </Button>
              )}
              <Button data-testid="button-back-to-projects" onClick={() => history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" data-testid="button-back" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-component-name">
              {component.name}
            </h1>
            <p className="text-muted-foreground">
              Last updated {getLastUpdated(component.updatedAt)}
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
          {/* Component Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Component Overview</CardTitle>
              <CardDescription>
                Basic information and details about this component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground" data-testid="text-component-description">
                  {component.description || 'No description provided'}
                </p>
              </div>
              
              {component.submodulePath && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Submodule Path</h4>
                  <Badge variant="outline" data-testid="text-submodule-path">
                    {component.submodulePath}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium mb-2">Created</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-created-date">
                    {formatDate(component.createdAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Last Updated</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-updated-date">
                    {formatDate(component.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dependencies Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dependencies</CardTitle>
                  <CardDescription>
                    Gradle dependencies used by this component
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setIsDependencyDialogOpen(true)}
                  data-testid="button-add-dependency"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dependency
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dependenciesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : dependencies.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-dependencies">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No dependencies added yet
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsDependencyDialogOpen(true)}
                    data-testid="button-add-first-dependency"
                  >
                    Add First Dependency
                  </Button>
                </div>
              ) : (
                <div className="space-y-3" data-testid="dependencies-list">
                  {dependencies.map((dependency) => (
                    <Card key={dependency.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-foreground" data-testid={`dependency-name-${dependency.id}`}>
                              {dependency.groupId}:{dependency.artifactId}
                            </h4>
                            <Badge variant="secondary" data-testid={`dependency-version-${dependency.id}`}>
                              {dependency.version}
                            </Badge>
                            <Badge variant="outline" data-testid={`dependency-scope-${dependency.id}`}>
                              {dependency.scope}
                            </Badge>
                          </div>
                          {dependency.description && (
                            <p className="text-sm text-muted-foreground mt-1" data-testid={`dependency-description-${dependency.id}`}>
                              {dependency.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Added {formatDate(dependency.createdAt)}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteDependency(dependency.id)}
                          disabled={deleteDependencyMutation.isPending}
                          data-testid={`button-delete-dependency-${dependency.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Component Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Component Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dependencies</span>
                </div>
                <Badge variant="secondary" data-testid="badge-dependency-count">
                  {dependencies.length}
                </Badge>
              </div>

              {component.submodulePath && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Submodule</span>
                  </div>
                  <Badge variant="outline" data-testid="badge-submodule">
                    Yes
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Component Details */}
          <Card>
            <CardHeader>
              <CardTitle>Component Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">COMPONENT ID</h4>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded" data-testid="text-component-id">
                  {component.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Dependency Dialog */}
      <Dialog open={isDependencyDialogOpen} onOpenChange={setIsDependencyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Dependency</DialogTitle>
            <DialogDescription>
              Add a new Gradle dependency to {component.name}.
            </DialogDescription>
          </DialogHeader>
          <DependencyForm
            componentId={component.id}
            onSubmit={handleCreateDependency}
            onCancel={() => setIsDependencyDialogOpen(false)}
            isLoading={createDependencyMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}