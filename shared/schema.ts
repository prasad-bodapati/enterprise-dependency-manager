import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Auth tables from Replit Auth integration
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("member"), // admin, member
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Core application tables
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  repositoryUrl: text("repository_url"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const components = pgTable("components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  submodulePath: text("submodule_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dependencies = pgTable("dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  componentId: varchar("component_id").notNull().references(() => components.id),
  groupId: text("group_id").notNull(),
  artifactId: text("artifact_id").notNull(),
  version: text("version").notNull(),
  scope: text("scope").notNull(), // implementation, api, compileOnly, testImplementation
  description: text("description"),
  addedBy: varchar("added_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dependencyId: varchar("dependency_id").notNull().references(() => dependencies.id),
  cveId: text("cve_id"),
  severity: text("severity").notNull(), // critical, high, medium, low
  description: text("description"),
  fixedInVersion: text("fixed_in_version"),
  discoveredAt: timestamp("discovered_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // create, update, delete
  entityType: text("entity_type").notNull(), // project, component, dependency
  entityId: varchar("entity_id").notNull(),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  dependencies: many(dependencies),
  auditLogs: many(auditLogs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  components: many(components),
}));

export const componentsRelations = relations(components, ({ one, many }) => ({
  project: one(projects, {
    fields: [components.projectId],
    references: [projects.id],
  }),
  dependencies: many(dependencies),
}));

export const dependenciesRelations = relations(dependencies, ({ one, many }) => ({
  component: one(components, {
    fields: [dependencies.componentId],
    references: [components.id],
  }),
  addedBy: one(users, {
    fields: [dependencies.addedBy],
    references: [users.id],
  }),
  vulnerabilities: many(vulnerabilities),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one }) => ({
  dependency: one(dependencies, {
    fields: [vulnerabilities.dependencyId],
    references: [dependencies.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComponentSchema = createInsertSchema(components).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDependencySchema = createInsertSchema(dependencies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true, discoveredAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;
export type InsertDependency = z.infer<typeof insertDependencySchema>;
export type Dependency = typeof dependencies.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Gradle scopes enum
export const gradleScopes = [
  'implementation',
  'api', 
  'compileOnly',
  'testImplementation',
  'testCompileOnly',
  'runtimeOnly',
  'testRuntimeOnly'
] as const;

export type GradleScope = typeof gradleScopes[number];

// Vulnerability severity enum
export const vulnerabilitySeverities = ['critical', 'high', 'medium', 'low'] as const;
export type VulnerabilitySeverity = typeof vulnerabilitySeverities[number];

// User roles enum
export const userRoles = ['admin', 'member'] as const;
export type UserRole = typeof userRoles[number];
