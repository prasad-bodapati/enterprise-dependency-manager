import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Users, Clock, TrendingUp, Shield } from "lucide-react";

interface DashboardProps {
  stats: {
    totalProjects: number;
    totalComponents: number;
    totalDependencies: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    recentUpdates: number;
  };
  onViewAllProjects?: () => void;
  onViewVulnerabilities?: () => void;
}

export function Dashboard({ stats, onViewAllProjects, onViewVulnerabilities }: DashboardProps) {
  const handleViewProjects = () => {
    console.log("Navigating to all projects");
    onViewAllProjects?.();
  };

  const handleViewVulnerabilities = () => {
    console.log("Navigating to vulnerabilities dashboard");
    onViewVulnerabilities?.();
  };

  const totalVulnerabilities = stats.criticalVulnerabilities + stats.highVulnerabilities + 
                              stats.mediumVulnerabilities + stats.lowVulnerabilities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your Gradle dependency management</p>
        </div>
        <Button onClick={handleViewProjects} data-testid="button-view-all-projects">
          View All Projects
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComponents}</div>
            <p className="text-xs text-muted-foreground">Registered components</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDependencies}</div>
            <p className="text-xs text-muted-foreground">Managed dependencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUpdates}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerability Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Vulnerability status across all dependencies
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleViewVulnerabilities} data-testid="button-view-vulnerabilities">
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Vulnerabilities</span>
              <span className="text-2xl font-bold">{totalVulnerabilities}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div>
                  <div className="text-sm text-red-700 dark:text-red-400">Critical</div>
                  <div className="text-lg font-bold text-red-800 dark:text-red-300">{stats.criticalVulnerabilities}</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div>
                  <div className="text-sm text-orange-700 dark:text-orange-400">High</div>
                  <div className="text-lg font-bold text-orange-800 dark:text-orange-300">{stats.highVulnerabilities}</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-600">Medium</div>
                  <div className="text-lg font-bold text-yellow-800 dark:text-yellow-400">{stats.mediumVulnerabilities}</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">Low</div>
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-300">{stats.lowVulnerabilities}</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}