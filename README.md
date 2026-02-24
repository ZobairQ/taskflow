# TaskFlow

A full-stack productivity platform with gamification features, built with React, Node.js, Apollo GraphQL, and PostgreSQL.

## Features

- Task management with priorities, categories, and due dates
- Gamification system (XP, levels, streaks, achievements)
- Pomodoro timer
- Project organization
- Template system for recurring tasks
- Dark mode support
- Real-time analytics

## Tech Stack

| Frontend      | Backend             |
| ------------- | ------------------- |
| React 18      | Node.js             |
| TypeScript    | Apollo Server       |
| Apollo Client | GraphQL             |
| Tailwind CSS  | PostgreSQL (Prisma) |
| DnD Kit       | Redis (optional)    |

## Prerequisites

- Node.js >= 20.0.0
- PostgreSQL 14+
- npm or yarn
- (Optional) Redis for caching

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd todo_app
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow?schema=public"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# JWT (minimum 32 characters)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Sentry (optional)
SENTRY_DSN=""
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run db:seed
```

### 4. Start Development Server

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:4000/graphql
- Health Check: http://localhost:4000/health

## Available Scripts

### Root Level

| Script              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start both frontend and backend in development mode |
| `npm run frontend`  | Start only the frontend                             |
| `npm run backend`   | Start only the backend                              |
| `npm run build`     | Build both workspaces for production                |
| `npm run test`      | Run all tests                                       |
| `npm run lint`      | Run ESLint                                          |
| `npm run format`    | Format code with Prettier                           |
| `npm run typecheck` | Run TypeScript type checking                        |

### Database Scripts

| Script                    | Description                    |
| ------------------------- | ------------------------------ |
| `npm run prisma:generate` | Generate Prisma client         |
| `npm run prisma:migrate`  | Run database migrations        |
| `npm run prisma:studio`   | Open Prisma Studio GUI         |
| `npm run db:seed`         | Seed database with sample data |

### Docker (Optional)

```bash
# Start PostgreSQL and Redis
npm run docker:up

# Stop containers
npm run docker:down
```

## Project Structure

```
todo_app/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── graphql/          # GraphQL queries/mutations
│   │   ├── utils/            # Utility functions
│   │   └── __tests__/        # Test files
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── resolvers/        # GraphQL resolvers
│   │   ├── schema/           # GraphQL type definitions
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Data access layer
│   │   ├── validators/       # Input validation (Zod)
│   │   ├── dataloaders/      # N+1 query prevention
│   │   ├── routes/           # Express routes (health checks)
│   │   ├── config/           # Configuration
│   │   ├── utils/            # Utilities (logger, sentry)
│   │   └── __tests__/        # Test files
│   ├── prisma/               # Database schema
│   └── package.json
│
├── .husky/                   # Git hooks
├── .eslintrc.js              # Shared ESLint config
├── .prettierrc               # Prettier config
└── package.json              # Root package with workspaces
```

## Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Test Suites

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Test Coverage

- Backend: 53 tests (services, repositories, validators)
- Frontend: 126 tests (components, hooks, utilities)

## Architecture

### Backend Architecture

```
Request → Resolver → Service → Repository → Prisma → Database
                ↓
           DataLoader (caching)
                ↓
           Validators (Zod)
```

### Key Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic isolation
- **DataLoader**: N+1 query prevention
- **Input Validation**: Zod schemas for all inputs

## Health Endpoints

| Endpoint      | Purpose                                 |
| ------------- | --------------------------------------- |
| `GET /health` | Basic health check (uptime, timestamp)  |
| `GET /ready`  | Readiness probe (database connectivity) |
| `GET /live`   | Liveness probe (for Kubernetes)         |

## Environment Variables Reference

| Variable             | Required | Description                          |
| -------------------- | -------- | ------------------------------------ |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string         |
| `JWT_SECRET`         | Yes      | JWT signing secret (min 32 chars)    |
| `JWT_REFRESH_SECRET` | Yes      | Refresh token secret (min 32 chars)  |
| `PORT`               | No       | Server port (default: 4000)          |
| `NODE_ENV`           | No       | Environment (development/production) |
| `CORS_ORIGIN`        | No       | Allowed CORS origin                  |
| `REDIS_URL`          | No       | Redis connection string              |
| `SENTRY_DSN`         | No       | Sentry error tracking DSN            |
| `LOG_LEVEL`          | No       | Log level (debug/info/warn/error)    |

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Run `npm run prisma:migrate` to create tables

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Regenerate Prisma client
npm run prisma:generate

# Check types
npm run typecheck
```

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run lint` and `npm run test`
4. Submit a pull request

Pre-commit hooks will automatically:

- Format code with Prettier
- Run linting checks

## License

MIT
