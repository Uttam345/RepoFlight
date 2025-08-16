# Technology Stack

## Build System
- **Turborepo**: Monorepo build system with caching and parallel execution
- **Node.js 18+**: Runtime requirement
- **TypeScript**: Primary language across all packages
- **npm workspaces**: Package management

## Frontend Stack
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **Tailwind CSS**: Styling framework
- **Radix UI**: Component primitives
- **shadcn/ui**: Component library built on Radix
- **Recharts**: Data visualization
- **Framer Motion**: Animations
- **React Hook Form + Zod**: Form handling and validation

## Backend Stack
- **Express.js**: HTTP server framework
- **Prisma**: Database ORM and query builder
- **PostgreSQL 16+**: Primary database
- **Jest**: Testing framework
- **tsx**: TypeScript execution for development

## Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Local development orchestration
- **nginx**: Reverse proxy and load balancing

## Common Commands

### Development
```bash
npm run dev              # Start all development servers
npm run build           # Build all packages
npm run test            # Run all test suites
npm run lint            # Run ESLint across all packages
npm run type-check      # TypeScript type checking
```

### Database Operations
```bash
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
```

### Docker Operations
```bash
npm run docker:dev      # Start development environment
npm run docker:prod     # Start production environment
docker-compose up -d postgres  # Start only database
```

### Setup
```bash
npm run setup           # Full project setup (install + db setup)
./scripts/setup.sh      # Automated setup script (Linux/macOS)
./scripts/setup.ps1     # Automated setup script (Windows)
```

## Code Quality
- **ESLint**: Linting with TypeScript and Prettier integration
- **Prettier**: Code formatting
- **TypeScript strict mode**: Type safety enforcement