import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";

// TODO: Remove mock data - replace with real API calls
const mockStats = {
  totalProjects: 12,
  totalComponents: 45,
  totalDependencies: 234,
  criticalVulnerabilities: 2,
  highVulnerabilities: 8,
  mediumVulnerabilities: 15,
  lowVulnerabilities: 23,
  recentUpdates: 18,
};

export default function Home() {
  const { user } = useAuth();

  const handleViewAllProjects = () => {
    console.log("Navigating to projects page");
    window.location.href = "/projects";
  };

  const handleViewVulnerabilities = () => {
    console.log("Navigating to vulnerabilities page");
    window.location.href = "/vulnerabilities";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your dependency management dashboard.
          </p>
        </div>
      </div>
      
      <Dashboard 
        stats={mockStats}
        onViewAllProjects={handleViewAllProjects}
        onViewVulnerabilities={handleViewVulnerabilities}
      />
    </div>
  );
}