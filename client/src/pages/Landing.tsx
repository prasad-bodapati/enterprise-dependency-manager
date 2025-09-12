import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Shield, Users, Zap, CheckCircle, ArrowRight } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Package,
      title: "Centralized Management",
      description: "Manage all your Gradle dependencies from a single, unified platform across all projects and components.",
    },
    {
      icon: Shield,
      title: "Security Monitoring",
      description: "Automated vulnerability scanning and real-time security alerts for all your dependencies.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Role-based access control and audit trails for better team coordination and governance.",
    },
    {
      icon: Zap,
      title: "Automated Updates",
      description: "Streamlined version management with automated dependency resolution via Gradle plugin integration.",
    },
  ];

  const benefits = [
    "Replace scattered, individually maintained Gradle files",
    "Centralized component and project onboarding",
    "Automated dependency fetching at build time",
    "Enterprise-grade security and compliance",
    "Version catalog and BOM support",
    "Comprehensive audit and change history",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        <div className="relative px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Centralized Gradle
              <br />
              <span className="text-primary">Dependency Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Streamline your enterprise dependency management with automated plugin integration,
              security monitoring, and centralized version control for all your Gradle projects.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Enterprise-Grade Dependency Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for modern development teams who need reliability, security, and scalability.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Eliminate Dependency Management Complexity
            </h2>
            <p className="text-lg text-muted-foreground">
              Transform your development workflow with centralized, automated dependency management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Streamline Your Dependencies?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join enterprise teams who trust our platform for their Gradle dependency management.
          </p>
          <Button size="lg" asChild data-testid="button-start-managing">
            <a href="/api/login" className="flex items-center gap-2">
              Start Managing Dependencies
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}