import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Search } from "lucide-react";
import { gradleScopes } from "@shared/schema";

interface DependencyFormProps {
  componentId: string;
  onSubmit?: (dependency: {
    groupId: string;
    artifactId: string;
    version: string;
    scope: string;
    description: string;
  }) => void;
  onCancel?: () => void;
}

export function DependencyForm({ componentId, onSubmit, onCancel }: DependencyFormProps) {
  const [formData, setFormData] = useState({
    groupId: "",
    artifactId: "",
    version: "",
    scope: "implementation",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Adding dependency to component ${componentId}:`, formData);
    onSubmit?.(formData);
    setFormData({ groupId: "", artifactId: "", version: "", scope: "implementation", description: "" });
  };

  const handleCancel = () => {
    console.log("Cancelling dependency addition");
    setFormData({ groupId: "", artifactId: "", version: "", scope: "implementation", description: "" });
    onCancel?.();
  };

  const handleSearchDependency = () => {
    console.log("Searching for dependencies in repository");
    // TODO: Implement repository search
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Add Dependency
        </CardTitle>
        <CardDescription>
          Add a new Gradle dependency to this component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSearchDependency}
              className="flex items-center gap-2"
              data-testid="button-search-repository"
            >
              <Search className="h-4 w-4" />
              Search Repository
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group-id">Group ID</Label>
              <Input
                id="group-id"
                placeholder="e.g., org.springframework"
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                required
                data-testid="input-group-id"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artifact-id">Artifact ID</Label>
              <Input
                id="artifact-id"
                placeholder="e.g., spring-boot-starter-web"
                value={formData.artifactId}
                onChange={(e) => setFormData({ ...formData, artifactId: e.target.value })}
                required
                data-testid="input-artifact-id"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., 2.7.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                required
                data-testid="input-version"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scope">Gradle Scope</Label>
              <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                <SelectTrigger data-testid="select-scope">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {gradleScopes.map((scope) => (
                    <SelectItem key={scope} value={scope}>
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dependency-description">Description (Optional)</Label>
            <Textarea
              id="dependency-description"
              placeholder="Brief description of what this dependency provides"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              data-testid="textarea-dependency-description"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-submit-dependency">
              Add Dependency
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel-dependency">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}