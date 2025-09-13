import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";

interface ProjectFormProps {
  onSubmit?: (project: {
    name: string;
    description: string;
    repositoryUrl: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", repositoryUrl: "" });
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name *</Label>
        <Input
          id="project-name"
          placeholder="e.g., my-gradle-project"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-project-name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea
          id="project-description"
          placeholder="Brief description of your project's purpose"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          data-testid="textarea-project-description"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="repository-url">Repository URL</Label>
        <Input
          id="repository-url"
          type="url"
          placeholder="https://github.com/username/project.git"
          value={formData.repositoryUrl}
          onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
          data-testid="input-repository-url"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          data-testid="button-cancel-project"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          data-testid="button-create-project"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
      </div>
    </form>
  );
}