import { 
  users, 
  projects, 
  components, 
  dependencies,
  type User, 
  type UpsertUser,
  type Project,
  type InsertProject,
  type Component,
  type InsertComponent,
  type Dependency,
  type InsertDependency
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Storage interface with all CRUD operations needed for the application
export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Component operations
  getProjectComponents(projectId: string): Promise<Component[]>;
  getComponent(id: string): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponent(id: string, component: Partial<InsertComponent>): Promise<Component>;
  deleteComponent(id: string): Promise<void>;
  
  // Dependency operations
  getComponentDependencies(componentId: string): Promise<Dependency[]>;
  getAllDependencies(): Promise<Dependency[]>;
  getDependency(id: string): Promise<Dependency | undefined>;
  createDependency(dependency: InsertDependency): Promise<Dependency>;
  updateDependency(id: string, dependency: Partial<InsertDependency>): Promise<Dependency>;
  deleteDependency(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id!);
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({ 
          ...userData, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userData.id!))
        .returning();
      return updatedUser;
    } else {
      // Create new user
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          role: userData.role || "member"
        })
        .returning();
      return user;
    }
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ 
        ...project, 
        updatedAt: new Date() 
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Component operations
  async getProjectComponents(projectId: string): Promise<Component[]> {
    return await db
      .select()
      .from(components)
      .where(eq(components.projectId, projectId))
      .orderBy(desc(components.createdAt));
  }

  async getComponent(id: string): Promise<Component | undefined> {
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.id, id));
    return component || undefined;
  }

  async createComponent(component: InsertComponent): Promise<Component> {
    const [newComponent] = await db
      .insert(components)
      .values(component)
      .returning();
    return newComponent;
  }

  async updateComponent(id: string, component: Partial<InsertComponent>): Promise<Component> {
    const [updatedComponent] = await db
      .update(components)
      .set({ 
        ...component, 
        updatedAt: new Date() 
      })
      .where(eq(components.id, id))
      .returning();
    return updatedComponent;
  }

  async deleteComponent(id: string): Promise<void> {
    await db.delete(components).where(eq(components.id, id));
  }

  // Dependency operations
  async getComponentDependencies(componentId: string): Promise<Dependency[]> {
    return await db
      .select()
      .from(dependencies)
      .where(eq(dependencies.componentId, componentId))
      .orderBy(desc(dependencies.createdAt));
  }

  async getAllDependencies(): Promise<Dependency[]> {
    return await db
      .select()
      .from(dependencies)
      .orderBy(desc(dependencies.createdAt));
  }

  async getDependency(id: string): Promise<Dependency | undefined> {
    const [dependency] = await db
      .select()
      .from(dependencies)
      .where(eq(dependencies.id, id));
    return dependency || undefined;
  }

  async createDependency(dependency: InsertDependency): Promise<Dependency> {
    const [newDependency] = await db
      .insert(dependencies)
      .values(dependency)
      .returning();
    return newDependency;
  }

  async updateDependency(id: string, dependency: Partial<InsertDependency>): Promise<Dependency> {
    const [updatedDependency] = await db
      .update(dependencies)
      .set({ 
        ...dependency, 
        updatedAt: new Date() 
      })
      .where(eq(dependencies.id, id))
      .returning();
    return updatedDependency;
  }

  async deleteDependency(id: string): Promise<void> {
    await db.delete(dependencies).where(eq(dependencies.id, id));
  }
}

export const storage = new DatabaseStorage();
