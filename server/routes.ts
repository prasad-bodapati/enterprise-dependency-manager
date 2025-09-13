import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { spawn } from "child_process";
import { z } from "zod";
import { insertComponentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Start Java Spring Boot service and add proxy
  console.log("Starting Java Spring Boot service...");
  // Create environment without DATABASE_URL to force H2 usage
  const javaEnv = { ...process.env };
  delete javaEnv.DATABASE_URL;  // Remove PostgreSQL URL to allow H2 configuration
  
  const javaProcess = spawn("mvn", ["-q", "spring-boot:run"], {
    cwd: "backend-java",
    stdio: ["ignore", "pipe", "pipe"],
    env: javaEnv
  });
  
  javaProcess.stdout?.on("data", (data) => {
    console.log(`Java service: ${data}`);
  });
  
  javaProcess.stderr?.on("data", (data) => {
    console.error(`Java service error: ${data}`);
  });
  
  // Add proxy to forward /api/* to Java service on port 8080
  // EXCEPT for projects and components which use Node.js/PostgreSQL
  app.use("/api", async (req, res, next) => {
    // Skip Java proxy for project and component endpoints - use Node.js/PostgreSQL directly
    if (req.path.startsWith('/projects') || req.path.startsWith('/components')) {
      console.log(`Bypassing Java proxy for ${req.path}, using Node.js routes directly`);
      next();
      return;
    }
    
    try {
      const targetUrl = `http://localhost:8080/api${req.path}`;
      
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        } as HeadersInit,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
      });
      
      const data = await response.text();
      
      // If Java service returns an error, fall back to Node.js routes
      if (!response.ok && response.status >= 400) {
        console.log(`Java service error ${response.status}, falling back to Node routes`);
        next();
        return;
      }
      
      res.status(response.status);
      
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch {
        res.send(data);
      }
    } catch (error) {
      // Fallback to Node.js routes if Java service isn't available yet
      console.log('Java service connection failed, falling back to Node routes');
      next();
    }
  });
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
      console.log("POST /api/projects - Request body:", req.body);
      
      // For now, use a dummy user ID - will be replaced with actual auth later
      const projectData = {
        ...req.body,
        createdBy: "demo-user-id"
      };
      
      console.log("POST /api/projects - Final project data:", projectData);
      
      const project = await storage.createProject(projectData);
      console.log("POST /api/projects - Created project:", project);
      
      // Verify the project was actually saved by querying it back
      const savedProject = await storage.getProject(project.id);
      console.log("POST /api/projects - Verified saved project:", savedProject);
      
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
      // Validate request body with Zod schema
      const componentData = insertComponentSchema.parse(req.body);
      const component = await storage.createComponent(componentData);
      res.json(component);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
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
