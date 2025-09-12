import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface ComponentFormProps {
  projectId: string;
  onSubmit?: (component: {
    name: string;
    description: string;
    submodulePath: string;
  }) => void;
  onCancel?: () => void;
}

export function ComponentForm({ projectId, onSubmit, onCancel }: ComponentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    submodulePath: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Creating component for project ${projectId}:`, formData);
    onSubmit?.(formData);
    setFormData({ name: "", description: "", submodulePath: "" });
  };

  const handleCancel = () => {
    console.log("Cancelling component creation");
    setFormData({ name: "", description: "", submodulePath: "" });
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Component
        </CardTitle>
        <CardDescription>
          Create a new component or module within this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="component-name">Component Name</Label>
            <Input
              id="component-name"
              placeholder="e.g., user-service, api-gateway"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-component-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="component-description">Description</Label>
            <Textarea
              id="component-description"
              placeholder="Brief description of this component's purpose"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              data-testid="textarea-component-description"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="submodule-path">Submodule Path</Label>
            <Input
              id="submodule-path"
              placeholder="e.g., /services/user-service"
              value={formData.submodulePath}
              onChange={(e) => setFormData({ ...formData, submodulePath: e.target.value })}
              data-testid="input-submodule-path"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-submit-component">
              Create Component
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel-component">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}