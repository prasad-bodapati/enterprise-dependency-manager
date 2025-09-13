import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Search, Loader2 } from "lucide-react";
import { insertDependencySchema, gradleScopes, type InsertDependency } from "@shared/schema";

// Extend the base schema with enhanced validation (omit addedBy as server will set it)
const formSchema = insertDependencySchema.omit({ addedBy: true }).extend({
  groupId: z.string().min(1, "Group ID is required").min(2, "Group ID must be at least 2 characters"),
  artifactId: z.string().min(1, "Artifact ID is required").min(2, "Artifact ID must be at least 2 characters"),
  version: z.string().min(1, "Version is required"),
  scope: z.enum(gradleScopes, { required_error: "Please select a dependency scope" }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DependencyFormProps {
  componentId: string;
  onSubmit?: (dependency: FormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DependencyForm({ componentId, onSubmit, onCancel, isLoading }: DependencyFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      componentId,
      groupId: "",
      artifactId: "",
      version: "",
      scope: undefined,
      description: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit?.(data);
  };

  const handleCancel = () => {
    form.reset();
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
        <div className="flex gap-2 mb-4">
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group ID *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., org.springframework"
                        data-testid="input-dependency-groupid"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The organization or group that publishes this dependency
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="artifactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artifact ID *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., spring-boot-starter-web"
                        data-testid="input-dependency-artifactid"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The specific library or module name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2.7.0, 31.1-jre"
                        data-testid="input-dependency-version"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The version of the dependency to use
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-dependency-scope">
                          <SelectValue placeholder="Select a dependency scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradleScopes.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How this dependency should be included in your build
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of why this dependency is needed"
                      rows={3}
                      data-testid="textarea-dependency-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                data-testid="button-cancel-dependency"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                data-testid="button-create-dependency"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Dependency
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}