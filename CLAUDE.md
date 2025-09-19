# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NOLI Assurance is a modern insurance platform built with Next.js 15, TypeScript, and Supabase. It provides multi-role access (USER, ADMIN, ASSUREUR) for insurance quote management, comparison, and policy administration.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom NextAuth.js implementation
- **UI**: shadcn/ui + Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Testing**: Playwright (E2E)
- **Monitoring**: Sentry

## Essential Commands

### Development
```bash
npm run dev          # Start development server with logging
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript type checking
```

### Database Operations
```bash
npm run db:migrate   # Push database migrations to Supabase
npm run db:reset     # Reset database (destructive)
npm run db:seed      # Seed database with demo data
npm run create-demo-users  # Create demo user accounts
```

### Security
```bash
npm run test:security        # Run security tests
npm run security:scan        # Snyk security scanning
npm run security:monitor     # Snyk monitoring
```

### Deployment
```bash
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:build     # Build for deployment
```

## Architecture Overview

### Role-Based Access Control
The application implements strict role-based access:
- **USER**: Standard user access to quotes and profiles
- **ADMIN**: Full system administration access
- **ASSUREUR**: Insurance partner with limited access

Routes are protected by server-side middleware and client-side role guards.

### Key Directories
- `/app`: Next.js App Router with role-based pages
- `/app/api`: API routes organized by feature
- `/components`: Reusable UI components (shadcn/ui based)
- `/lib`: Core utilities including auth, Supabase, and middleware
- `/hooks`: Custom React hooks
- `/types`: TypeScript type definitions
- `/supabase`: Database migrations and configuration

### Database Schema
The platform uses Supabase with organized migrations in `/supabase/migrations/`. Key tables include:
- User management and roles
- Insurance quotes and policies
- Vehicle and policyholder information
- Insurance offers and comparisons

## Development Patterns

### Component Development
- Use shadcn/ui components from `/components/ui/`
- Follow the existing component structure with separate files for each component
- Implement proper TypeScript types for all props
- Use Tailwind CSS classes for styling

### Form Handling
- Use React Hook Form with Zod validation
- Follow existing form patterns in `/app/formulaire-*` directories
- Implement proper error handling and loading states
- Use the existing form components and utilities

### API Development
- Create API routes in `/app/api` following the existing structure
- Implement proper error handling with consistent responses
- Use the existing middleware for authentication and role checking
- Follow RESTful conventions where appropriate

### Security Considerations
- All routes must implement proper role checking
- Use the existing authentication middleware
- Implement rate limiting for sensitive operations
- Follow the existing CSP and security header configurations
- Never expose sensitive data in API responses

## Environment Configuration

The application requires these environment variables (see `.env.example`):
- Supabase configuration (URL, service key)
- NextAuth secret and configuration
- Sentry DSN for error monitoring
- Redis configuration for caching
- CORS and security settings

## Testing

- E2E tests are located in `/tests` directory
- Use Playwright for browser testing
- Security tests include authentication, role access, and input validation
- Run tests with `npm run test:security`

## Database Schema Changes

1. Create new migration files in `/supabase/migrations/`
2. Use the naming convention `timestamp_description.sql`
3. Test migrations locally with `npm run db:migrate`
4. Update TypeScript types in `/types` if schema changes
5. Update related API routes and components

## Code Style Guidelines

- TypeScript is configured with `noImplicitAny: false` for AI development
- ESLint rules are relaxed to accommodate AI-generated code
- Follow existing naming conventions and file structure
- Use path aliases (`@/`, `~/`) for imports
- Implement proper error handling and logging

## Common Issues

- Database migrations: Always run `npm run db:migrate` after schema changes
- Authentication: Ensure NextAuth is properly configured with environment variables
- Role access: Test all roles when implementing new features
- Build errors: Run `npm run type-check` and `npm run lint` to catch issues early