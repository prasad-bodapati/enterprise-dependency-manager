# Gradle Dependency Management Platform

## Overview
This is a centralized Gradle dependency management platform designed to replace scattered, individually maintained Gradle dependency declarations across an enterprise. The system provides a unified web interface for teams to onboard components, declare dependencies, and manage versions, while offering a Gradle plugin for automated dependency resolution at build time. The platform emphasizes security through vulnerability monitoring, enterprise governance through audit trails, and operational efficiency through automated version management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based frontend with TypeScript, implementing a single-page application (SPA) pattern. The UI is built with shadcn/ui components providing a consistent Material Design-inspired interface optimized for enterprise use. The frontend employs:
- **Component Library**: Radix UI primitives with shadcn/ui for consistent, accessible components
- **Styling**: Tailwind CSS with custom design tokens for enterprise branding
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Hook-based authentication system with user context management

### Backend Architecture
The server is built on Express.js with TypeScript, following a modular architecture:
- **Framework**: Express.js with TypeScript for type safety and developer experience
- **Database Integration**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL-based session storage
- **API Design**: RESTful API structure with centralized route registration
- **Storage Layer**: Abstracted storage interface allowing for different implementations (currently includes in-memory storage for development)

### Database Schema
The application uses PostgreSQL with a well-structured schema supporting:
- **User Management**: Users table with role-based access control
- **Project Hierarchy**: Projects containing multiple components with submodule support
- **Dependency Management**: Comprehensive dependency tracking with version history
- **Security Monitoring**: Built-in vulnerability tracking and audit trails
- **Session Management**: Secure session storage with expiration handling

### Authentication and Authorization
The platform implements a comprehensive authentication system:
- **User Authentication**: Integrated with Replit Auth for seamless authentication
- **Role-Based Access**: Support for admin and member roles with different permission levels
- **Session Security**: PostgreSQL-backed session storage with configurable expiration
- **API Security**: Credential-based API access with proper error handling

### Development and Build System
The project uses a modern development stack:
- **Build Tool**: Vite for fast development and optimized production builds
- **TypeScript**: Full TypeScript support across frontend, backend, and shared code
- **Database Migrations**: Drizzle Kit for type-safe database schema management
- **Development Server**: Hot reload and development tooling integrated with Replit environment
- **Production Build**: Optimized build process with ESBuild for server bundling

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL for scalable data storage
- **Connection Pooling**: @neondatabase/serverless for efficient database connections

### UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework for consistent styling and responsive design
- **Lucide Icons**: Modern icon library for consistent iconography throughout the application

### Development Tools
- **Drizzle ORM**: Type-safe database ORM with excellent TypeScript integration
- **TanStack Query**: Powerful data fetching and caching library for server state management
- **React Hook Form**: Efficient form handling with validation support
- **Zod**: Runtime type validation and schema parsing

### External Integrations (Planned)
- **Maven/Nexus Repositories**: Integration with internal and external artifact repositories for dependency resolution
- **Vulnerability Databases**: Security scanning integration for automated vulnerability detection
- **Gradle Plugin System**: Custom Gradle plugin for automated dependency injection at build time