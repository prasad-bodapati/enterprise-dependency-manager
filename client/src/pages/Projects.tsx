import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchBar } from "@/components/SearchBar";
import { ProjectForm } from "@/components/ProjectForm";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, InsertProject } from "@shared/schema";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects from API
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json() as Promise<Project[]>;
    }
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: InsertProject) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setShowNewProjectForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  });

  // Transform database projects to UI format
  const formatLastUpdated = (dateValue: Date | string | null) => {
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

  const transformedProjects = projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description || undefined,
    repositoryUrl: project.repositoryUrl || undefined,
    componentCount: 0, // TODO: Calculate actual component count when components API is ready
    vulnerabilityCount: 0, // TODO: Calculate actual vulnerability count when vulnerabilities API is ready
    lastUpdated: formatLastUpdated(project.updatedAt),
  }));

  // Filter projects based on search query
  const filteredProjects = transformedProjects.filter(project => {
    if (searchQuery.trim() === "") return true;
    return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSearch = (query: string) => {
    console.log(`Searching projects for: ${query}`);
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleViewProject = (projectId: string) => {
    console.log(`Viewing project: ${projectId}`);
    // TODO: Use proper routing with wouter
    window.location.href = `/projects/${projectId}`;
  };

  const handleCreateProject = (projectData: any) => {
    console.log("Creating new project:", projectData);
    createProjectMutation.mutate(projectData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage your Gradle projects and their dependency configurations
          </p>
        </div>
        
        <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-new-project">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby="create-project-dialog">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <p id="create-project-dialog" className="sr-only">
              Dialog to create a new Gradle project with name, description and repository URL
            </p>
            <ProjectForm 
              onSubmit={handleCreateProject}
              onCancel={() => setShowNewProjectForm(false)}
              isLoading={createProjectMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4">
        <SearchBar 
          placeholder="Search projects by name or description..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        
        <div className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" data-testid="project-skeleton" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12" data-testid="projects-error">
          <p className="text-destructive mb-2">Failed to load projects</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/projects'] })}
            className="mt-4"
            data-testid="button-retry"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Projects grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewProject={handleViewProject}
            />
          ))}
        </div>
      )}
      
      {/* Empty states */}
      {!isLoading && !error && filteredProjects.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No projects found matching "{searchQuery}"
          </p>
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && !searchQuery && (
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-muted-foreground mb-4">
            No projects yet. Create your first Gradle project to get started.
          </p>
          <Button onClick={() => setShowNewProjectForm(true)} data-testid="button-create-first">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
}