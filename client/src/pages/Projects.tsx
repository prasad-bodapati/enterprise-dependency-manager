import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchBar } from "@/components/SearchBar";
import { ComponentForm } from "@/components/ComponentForm";
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
      return apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
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

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    if (searchQuery.trim() === "") return true;
    return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSearch = (query: string) => {
    console.log(`Searching projects for: ${query}`);
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProjects(mockProjects);
    } else {
      const filtered = mockProjects.filter(project => 
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredProjects(mockProjects);
  };

  const handleViewProject = (projectId: string) => {
    console.log(`Viewing project: ${projectId}`);
    window.location.href = `/projects/${projectId}`;
  };

  const handleCreateProject = (projectData: any) => {
    console.log("Creating new project:", projectData);
    setShowNewProjectForm(false);
    // TODO: Implement actual project creation
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ComponentForm 
              projectId="new" 
              onSubmit={handleCreateProject}
              onCancel={() => setShowNewProjectForm(false)}
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
          Showing {filteredProjects.length} of {mockProjects.length} projects
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onViewProject={handleViewProject}
          />
        ))}
      </div>
      
      {filteredProjects.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No projects found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}