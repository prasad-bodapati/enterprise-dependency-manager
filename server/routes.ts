import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled for development
  // await setupAuth(app);

  // Auth routes - temporarily disabled for development
  // app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const user = await storage.getUser(userId);
  //     res.json(user);
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //     res.status(500).json({ message: "Failed to fetch user" });
  //   }
  // });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      // For now, use a dummy user ID - will be replaced with actual auth later
      const projectData = {
        ...req.body,
        createdBy: "demo-user-id"
      };
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Component routes
  app.get("/api/projects/:projectId/components", async (req, res) => {
    try {
      const components = await storage.getProjectComponents(req.params.projectId);
      res.json(components);
    } catch (error) {
      console.error("Error fetching components:", error);
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });

  app.get("/api/components/:id", async (req, res) => {
    try {
      const component = await storage.getComponent(req.params.id);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      res.json(component);
    } catch (error) {
      console.error("Error fetching component:", error);
      res.status(500).json({ message: "Failed to fetch component" });
    }
  });

  app.post("/api/components", async (req, res) => {
    try {
      const component = await storage.createComponent(req.body);
      res.json(component);
    } catch (error) {
      console.error("Error creating component:", error);
      res.status(500).json({ message: "Failed to create component" });
    }
  });

  app.put("/api/components/:id", async (req, res) => {
    try {
      const component = await storage.updateComponent(req.params.id, req.body);
      res.json(component);
    } catch (error) {
      console.error("Error updating component:", error);
      res.status(500).json({ message: "Failed to update component" });
    }
  });

  app.delete("/api/components/:id", async (req, res) => {
    try {
      await storage.deleteComponent(req.params.id);
      res.json({ message: "Component deleted successfully" });
    } catch (error) {
      console.error("Error deleting component:", error);
      res.status(500).json({ message: "Failed to delete component" });
    }
  });

  // Dependency routes
  app.get("/api/dependencies", async (req, res) => {
    try {
      const dependencies = await storage.getAllDependencies();
      res.json(dependencies);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      res.status(500).json({ message: "Failed to fetch dependencies" });
    }
  });

  app.get("/api/components/:componentId/dependencies", async (req, res) => {
    try {
      const dependencies = await storage.getComponentDependencies(req.params.componentId);
      res.json(dependencies);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      res.status(500).json({ message: "Failed to fetch dependencies" });
    }
  });

  app.post("/api/dependencies", async (req, res) => {
    try {
      const dependencyData = {
        ...req.body,
        addedBy: "demo-user-id" // Will be replaced with actual auth later
      };
      const dependency = await storage.createDependency(dependencyData);
      res.json(dependency);
    } catch (error) {
      console.error("Error creating dependency:", error);
      res.status(500).json({ message: "Failed to create dependency" });
    }
  });

  app.put("/api/dependencies/:id", async (req, res) => {
    try {
      const dependency = await storage.updateDependency(req.params.id, req.body);
      res.json(dependency);
    } catch (error) {
      console.error("Error updating dependency:", error);
      res.status(500).json({ message: "Failed to update dependency" });
    }
  });

  app.delete("/api/dependencies/:id", async (req, res) => {
    try {
      await storage.deleteDependency(req.params.id);
      res.json({ message: "Dependency deleted successfully" });
    } catch (error) {
      console.error("Error deleting dependency:", error);
      res.status(500).json({ message: "Failed to delete dependency" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
