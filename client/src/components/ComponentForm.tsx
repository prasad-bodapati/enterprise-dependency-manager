import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { insertComponentSchema, type InsertComponent } from "@shared/schema";

// Extend the base schema with enhanced validation
const formSchema = insertComponentSchema.extend({
  name: z.string().min(1, "Component name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  submodulePath: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ComponentFormProps {
  projectId: string;
  onSubmit?: (component: InsertComponent) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ComponentForm({ projectId, onSubmit, onCancel, isLoading }: ComponentFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      projectId,
      name: "",
      description: "",
      submodulePath: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit?.(data);
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Component Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., core-api, web-ui, shared-utils"
                  data-testid="input-component-name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this component's purpose and functionality"
                  rows={3}
                  data-testid="textarea-component-description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="submodulePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Submodule Path</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., modules/core, apps/web, libs/shared"
                  data-testid="input-submodule-path"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional path to this component within your project structure
              </FormDescription>
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
            data-testid="button-cancel-component"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            data-testid="button-create-component"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Component
          </Button>
        </div>
      </form>
    </Form>
  );
}