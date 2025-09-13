import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectView from "@/pages/ProjectView";
import ComponentView from "@/pages/ComponentView";
import Dependencies from "@/pages/Dependencies";

function Router() {
  // Skip authentication for now - always show authenticated app
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectView} />
      <Route path="/components/:id" component={ComponentView} />
      <Route path="/dependencies" component={Dependencies} />
      <Route path="/vulnerabilities" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Vulnerabilities Dashboard</h1><p className="text-muted-foreground">Coming soon - vulnerability tracking and management</p></div>} />
      <Route path="/api-docs" component={() => <div className="p-6"><h1 className="text-2xl font-bold">API Documentation</h1><p className="text-muted-foreground">Coming soon - Gradle plugin integration docs</p></div>} />
      <Route path="/users" component={() => <div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p className="text-muted-foreground">Coming soon - user roles and permissions</p></div>} />
      <Route path="/settings" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon - platform configuration</p></div>} />
      {/* Only show 404 for non-API routes */}
      <Route path="/api/*">
        {() => {
          // Let server handle API routes by triggering a page reload
          window.location.href = window.location.href;
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Custom sidebar width for enterprise application
  const style = {
    "--sidebar-width": "16rem",       // 256px for navigation
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="gradle-deps-theme">
      <TooltipProvider>
        {/* Always show authenticated app with sidebar for now */}
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1 overflow-auto p-6">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
