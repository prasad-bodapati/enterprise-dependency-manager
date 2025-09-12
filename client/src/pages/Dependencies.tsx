import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DependencyCard } from "@/components/DependencyCard";
import { SearchBar } from "@/components/SearchBar";
import { DependencyForm } from "@/components/DependencyForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// TODO: Remove mock data - replace with real API calls
const mockDependencies = [
  {
    id: 'dep-1',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-web',
    version: '2.7.2',
    scope: 'implementation',
    description: 'Spring Boot starter for building web applications',
    vulnerabilityCount: 1,
    lastUpdated: '5 days ago',
  },
  {
    id: 'dep-2',
    groupId: 'com.fasterxml.jackson.core',
    artifactId: 'jackson-databind',
    version: '2.13.3',
    scope: 'api',
    description: 'JSON data binding library for Java',
    vulnerabilityCount: 0,
    lastUpdated: '1 week ago',
  },
  {
    id: 'dep-3',
    groupId: 'junit',
    artifactId: 'junit',
    version: '4.13.2',
    scope: 'testImplementation',
    description: 'Unit testing framework for Java',
    vulnerabilityCount: 2,
    lastUpdated: '2 weeks ago',
  },
  {
    id: 'dep-4',
    groupId: 'org.hibernate',
    artifactId: 'hibernate-core',
    version: '5.6.10.Final',
    scope: 'implementation',
    description: 'Object/relational mapping framework',
    vulnerabilityCount: 0,
    lastUpdated: '3 days ago',
  },
];

export default function Dependencies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [showNewDependencyForm, setShowNewDependencyForm] = useState(false);
  const [filteredDependencies, setFilteredDependencies] = useState(mockDependencies);

  const handleSearch = (query: string) => {
    console.log(`Searching dependencies for: ${query}`);
    setSearchQuery(query);
    applyFilters(query, scopeFilter);
  };

  const handleScopeFilter = (scope: string) => {
    console.log(`Filtering by scope: ${scope}`);
    setScopeFilter(scope);
    applyFilters(searchQuery, scope);
  };

  const applyFilters = (query: string, scope: string) => {
    let filtered = mockDependencies;
    
    // Apply search filter
    if (query.trim() !== "") {
      filtered = filtered.filter(dep => 
        dep.groupId.toLowerCase().includes(query.toLowerCase()) ||
        dep.artifactId.toLowerCase().includes(query.toLowerCase()) ||
        dep.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply scope filter
    if (scope !== "all") {
      filtered = filtered.filter(dep => dep.scope === scope);
    }
    
    setFilteredDependencies(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setScopeFilter("all");
    setFilteredDependencies(mockDependencies);
  };

  const handleEditDependency = (dependencyId: string) => {
    console.log(`Editing dependency: ${dependencyId}`);
    // TODO: Implement dependency editing
  };

  const handleDeleteDependency = (dependencyId: string) => {
    console.log(`Deleting dependency: ${dependencyId}`);
    // TODO: Implement dependency deletion
  };

  const handleCreateDependency = (dependencyData: any) => {
    console.log("Creating new dependency:", dependencyData);
    setShowNewDependencyForm(false);
    // TODO: Implement actual dependency creation
  };

  const uniqueScopes = Array.from(new Set(mockDependencies.map(dep => dep.scope)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dependencies</h1>
          <p className="text-muted-foreground">
            Manage Gradle dependencies across all projects and components
          </p>
        </div>
        
        <Dialog open={showNewDependencyForm} onOpenChange={setShowNewDependencyForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-new-dependency">
              <Plus className="h-4 w-4" />
              Add Dependency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Dependency</DialogTitle>
            </DialogHeader>
            <DependencyForm 
              componentId="global" 
              onSubmit={handleCreateDependency}
              onCancel={() => setShowNewDependencyForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <SearchBar 
              placeholder="Search by group ID, artifact ID, or description..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={scopeFilter} onValueChange={handleScopeFilter}>
              <SelectTrigger className="w-40" data-testid="select-scope-filter">
                <SelectValue placeholder="All Scopes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                {uniqueScopes.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Showing {filteredDependencies.length} of {mockDependencies.length} dependencies</span>
          {scopeFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Scope: {scopeFilter}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDependencies.map((dependency) => (
          <DependencyCard
            key={dependency.id}
            dependency={dependency}
            onEdit={handleEditDependency}
            onDelete={handleDeleteDependency}
          />
        ))}
      </div>
      
      {filteredDependencies.length === 0 && (searchQuery || scopeFilter !== "all") && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No dependencies found matching your filters
          </p>
        </div>
      )}
    </div>
  );
}