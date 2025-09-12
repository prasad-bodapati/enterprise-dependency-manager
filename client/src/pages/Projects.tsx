import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchBar } from "@/components/SearchBar";
import { ComponentForm } from "@/components/ComponentForm";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// TODO: Remove mock data - replace with real API calls
const mockProjects = [
  {
    id: 'proj-1',
    name: 'E-Commerce Platform',
    description: 'Core e-commerce microservices with payment processing and user management',
    repositoryUrl: 'https://github.com/company/ecommerce-platform',
    componentCount: 8,
    vulnerabilityCount: 3,
    lastUpdated: '2 days ago',
  },
  {
    id: 'proj-2',
    name: 'Data Analytics Pipeline',
    description: 'Real-time data processing and analytics infrastructure',
    repositoryUrl: 'https://github.com/company/analytics-pipeline',
    componentCount: 5,
    vulnerabilityCount: 0,
    lastUpdated: '1 week ago',
  },
  {
    id: 'proj-3',
    name: 'Customer Support Portal',
    description: 'Internal customer support tools and ticket management system',
    repositoryUrl: 'https://github.com/company/support-portal',
    componentCount: 12,
    vulnerabilityCount: 7,
    lastUpdated: '3 days ago',
  },
  {
    id: 'proj-4',
    name: 'Mobile API Gateway',
    description: 'API gateway and authentication service for mobile applications',
    repositoryUrl: 'https://github.com/company/mobile-gateway',
    componentCount: 3,
    vulnerabilityCount: 1,
    lastUpdated: '5 days ago',
  },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);

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