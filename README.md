# NestJS Backend Architecture

A production-ready NestJS backend starter with strict architectural patterns, JWT authentication, PostgreSQL + TypeORM, MinIO file storage, and a fully enforced layering system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 |
| Database | PostgreSQL + TypeORM 0.3 |
| Authentication | JWT (jsonwebtoken + Passport) |
| File Storage | MinIO (S3-compatible) |
| Validation | class-validator + class-transformer |
| Config | @nestjs/config with typed factories |
| Rate Limiting | @nestjs/throttler |
| Events | @nestjs/event-emitter |
| Scheduler | @nestjs/schedule |
| API Versioning | URI versioning (`/v1/...`) |

---

## Project Structure

```
src/
├── constants/          # Global enums, route prefixes, app-wide values
├── config/             # Typed ConfigService factory functions
├── common/             # Shared utilities used across all modules
│   ├── decorators/     # @Public(), @CurrentUser()
│   ├── dto/            # PaginationDto, PaginationQueryDto
│   ├── filters/        # Global HTTP exception filter
│   ├── guards/         # JwtAuthGuard (applied globally)
│   ├── interceptors/   # Logging interceptor
│   ├── pipes/          # ParseEnumPipe
│   ├── validators/     # @AtLeastOneOf() for PATCH DTOs
│   └── utils/          # hash, pagination helpers
├── database/
│   ├── entities/       # TypeORM entities (all extend BaseEntity)
│   ├── migrations/     # Auto-generated TypeORM migrations
│   └── seeds/          # Database seed scripts
└── modules/
    ├── app/            # Root module + health check
    ├── auth/           # JWT auth (register, login, strategies)
    ├── user/           # User management
    └── upload/         # File upload via MinIO
```

Each feature module follows a strict layering pattern:

```
Controller  →  Service  →  Repository  →  Entity
    ↓               ↓
  DTO           Converter (Entity → DTO)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- MinIO (or any S3-compatible storage)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# App
APP_PORT=3000
NODE_ENV=development
APP_CORS_ALLOW_ORIGIN=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=myapp
DB_SYNC=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=uploads

# Throttler
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## Database Migrations

```bash
# Generate migration after entity changes
npm run migration:generate

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Seeding

```bash
# Development seed
npm run seed:run

# Production seed
npm run seed:run:prod
```

---

## API

All endpoints are prefixed with `/v1` (URI versioning).

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/v1/auth/register` | Public | Register a new user |
| POST | `/v1/auth/login` | Public | Login, returns access token |
| GET | `/v1/users/me` | JWT | Get current user profile |
| GET | `/v1/users` | JWT | List users (paginated) |
| GET | `/v1/users/:id` | JWT | Get user by ID |
| DELETE | `/v1/users/:id` | JWT | Soft-delete user |
| POST | `/v1/upload` | JWT | Upload a file (max 5MB, jpeg/png/webp) |
| GET | `/v1/health` | Public | Health check |

### Pagination

All list endpoints accept:

```
GET /v1/users?page=1&limit=20
```

Response shape:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Error Response Shape

```json
{
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/v1/users/invalid-id",
  "message": "Validation failed (uuid is expected)"
}
```

---

## Architecture Patterns

### Request Flow

```
HTTP Request
    ↓
Controller     — Receives DTO, calls service, returns response DTO
    ↓
Service        — Business logic only, calls repository, uses converter
    ↓
Repository     — All TypeORM queries, named methods
    ↓
Entity         — Extends BaseEntity (id, createdAt, updatedAt, deletedAt)
```

### Key Conventions

**Enums** — all live in `src/constants/enums.ts`, never inside entity files.

**Config** — `process.env` is only read inside `src/config/*.config.ts` factories. Everywhere else inject `ConfigService`.

**Auth** — `JwtAuthGuard` is global. Mark public routes with `@Public()`. Get the authenticated user with `@CurrentUser()`.

**Converters** — Entity→DTO mapping is done in static converter classes (`UserConverter.toDto(entity)`), never inline in services.

**Entities** — Every entity extends `BaseEntity` which provides `id` (UUID), `createdAt`, `updatedAt`, `deletedAt` (soft delete).

Full rules in [`CLAUDE.md`](./CLAUDE.md).

---

## Adding a New Module

1. Add enums to `src/constants/enums.ts` (if needed)
2. Create entity in `src/database/entities/`, update `index.ts`
3. Create `src/modules/{feature}/` with:
   - `repositories/{feature}.repository.ts`
   - `services/{feature}.service.ts`
   - `controllers/{feature}.controller.ts`
   - `dto/{feature}.request.dto.ts`
   - `dto/{feature}.response.dto.ts`
   - `converters/{feature}.converter.ts`
   - `{feature}.module.ts`
4. Import module in `app.module.ts`
5. Run `npm run migration:generate`

---

## Scripts

```bash
npm run start:dev          # Start in watch mode
npm run build              # Compile to dist/
npm run start:prod         # Run compiled output
npm run lint               # ESLint with auto-fix
npm run format             # Prettier format
npm run test               # Jest unit tests
npm run test:cov           # Test coverage

npm run migration:generate # Generate migration from entity changes
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Revert last migration
npm run seed:run           # Run seed scripts
```
