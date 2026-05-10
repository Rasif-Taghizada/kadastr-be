# NestJS Backend Architecture

## Folder Structure

```
src/
├── constants/                         # Global enums, routes, app-wide constants
│   ├── enums.ts                       # UserRole, TokenType, etc.
│   ├── routes.ts                      # ROUTES.AUTH, ROUTES.USERS, ...
│   ├── app.ts                         # DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT
│   └── index.ts
│
├── config/                            # App-wide configuration (ConfigService factories)
│   ├── app.config.ts                  # Port, env, corsOrigin
│   ├── database.config.ts             # TypeORM config factory
│   ├── database.data-source.ts        # TypeORM CLI datasource
│   ├── env.config.ts                  # ConfigModule setup (loads all configs)
│   ├── jwt.config.ts                  # jwt.secret, jwt.expiresIn
│   ├── main.config.ts                 # Global pipes, filters, interceptors, CORS, versioning
│   ├── minio.config.ts                # MinIO endpoint, port, keys, bucket
│   ├── throttler.config.ts            # Rate limiting config
│   └── index.ts
│
├── common/                            # Shared across all modules
│   ├── decorators/
│   │   ├── public.decorator.ts        # @Public() — skip JWT guard
│   │   └── current-user.decorator.ts  # @CurrentUser() — get request user
│   ├── dto/
│   │   ├── pagination-query.dto.ts    # ?page=1&limit=20
│   │   └── pagination.dto.ts          # Generic paginated response wrapper
│   ├── filters/
│   │   └── http-exception.filter.ts   # Global error handler (uniform error shape)
│   ├── guards/
│   │   └── jwt-auth.guard.ts          # Global JWT guard (respects @Public)
│   ├── interceptors/
│   │   └── logging.interceptor.ts     # Request/response logging
│   ├── pipes/
│   │   └── parse-enum.pipe.ts         # Validate & transform query param to enum value
│   ├── validators/
│   │   └── at-least-one-of.validator.ts  # @AtLeastOneOf(['field1','field2']) for PATCH DTOs
│   └── utils/
│       ├── hash.utils.ts              # bcrypt hashPassword / comparePassword
│       └── pagination.utils.ts        # getPaginationOptions → skip/take/page/limit
│
├── database/
│   ├── entities/
│   │   ├── base.entity.ts             # id (uuid), createdAt, updatedAt, deletedAt
│   │   ├── user.entity.ts             # email, password (select:false), name, role, isActive
│   │   └── index.ts                   # Barrel export — import all entities from here
│   ├── migrations/                    # TypeORM auto-generated migrations
│   └── seeds/
│       └── seed.runner.ts             # Seed entry point
│
├── modules/
│   ├── app/                           # Root module
│   │   ├── app.module.ts              # Imports all feature modules + global providers
│   │   ├── app.controller.ts          # GET /health
│   │   └── app.service.ts
│   │
│   ├── auth/                          # Authentication
│   │   ├── controllers/
│   │   │   └── auth.controller.ts     # POST /auth/register, /auth/login
│   │   ├── dto/
│   │   │   ├── auth.request.dto.ts    # LoginDto, RegisterDto
│   │   │   └── auth.response.dto.ts   # AuthResponseDto { accessToken, user }
│   │   ├── repositories/
│   │   │   └── auth.repository.ts     # findByEmail, findByEmailWithPassword, create
│   │   ├── services/
│   │   │   ├── auth.service.ts        # register, login — uses AuthRepository + JwtTokenService
│   │   │   └── jwt-token.service.ts   # sign(user), verify(token) — uses ConfigService
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts        # Passport JWT strategy — uses ConfigService for secret
│   │   └── auth.module.ts             # Registers APP_GUARD(JwtAuthGuard) globally
│   │
│   ├── user/                          # User management
│   │   ├── controllers/
│   │   │   └── user.controller.ts     # GET /users/me, /users, /users/:id, DELETE /users/:id
│   │   ├── converters/
│   │   │   └── user.converter.ts      # UserEntity → UserResponseDto (strips password, etc.)
│   │   ├── dto/
│   │   │   ├── user.request.dto.ts    # UpdateUserDto
│   │   │   └── user.response.dto.ts   # UserResponseDto
│   │   ├── services/
│   │   │   └── user.service.ts        # findAll, findById, delete
│   │   ├── user.repository.ts         # TypeORM queries isolated here
│   │   └── user.module.ts
│   │
│   └── upload/                        # File upload (MinIO / S3-compatible)
│       ├── controllers/
│       │   └── upload.controller.ts   # POST /upload
│       ├── services/
│       │   └── upload.service.ts      # Uses ConfigService — uploadFile, deleteFile
│       └── upload.module.ts
│
└── main.ts
```

## Core Packages

| Package | Purpose |
|---------|---------|
| `@nestjs/config` | Typed config factories; read via `ConfigService.get('jwt.secret')` |
| `@nestjs/typeorm` + `typeorm` + `pg` | PostgreSQL ORM |
| `@nestjs/passport` + `passport-jwt` | JWT authentication |
| `@nestjs/throttler` | Rate limiting (global ThrottlerGuard in AppModule) |
| `@nestjs/schedule` | Cron jobs / scheduled tasks |
| `@nestjs/event-emitter` | Internal events between modules |
| `class-validator` + `class-transformer` | DTO validation & transformation |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | Token signing/verification in JwtTokenService |
| `minio` | File storage (MinIO / S3-compatible) |

## Key Conventions

### Module structure (every feature module)
```
modules/feature/
  controllers/    → HTTP layer only, call service, return DTO
  services/       → Business logic only
  repositories/   → All TypeORM queries isolated here
  dto/            → feature.request.dto.ts, feature.response.dto.ts
  converters/     → Entity → DTO (static class, no DI needed)
  feature.module.ts
```

### Entity
All entities extend `BaseEntity` — uuid id + createdAt + updatedAt + deletedAt (soft delete).
Import entities from `@/database/entities` (barrel index).

### Enums
Global enums live in `src/constants/enums.ts`, NOT inside entity files.
This avoids circular imports when DTOs and entities both need the same enum.

### Auth
- `JwtAuthGuard` is registered globally via `APP_GUARD` in `AuthModule`
- Use `@Public()` on any route that should skip auth
- Use `@CurrentUser()` in a controller to get the authenticated `UserEntity`
- `JwtTokenService` wraps `jsonwebtoken` — never call `jwt.sign()` directly in services
- `JwtStrategy` reads the secret via `ConfigService`, never via `process.env`

### ConfigService
**Never use `process.env` inside services or strategies.**
Always inject `ConfigService` and call `configService.get('namespace.key')`.
Config keys are defined in the factory functions under `src/config/`.

### Converters
Converters are plain static classes — no `@Injectable()`, no DI.
They map entity → response DTO. This keeps serialization logic out of services.

### Migrations
```bash
# Generate after entity changes
npm run migration:generate

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Adding a new module
1. Create `src/modules/your-module/`
2. Add `controllers/`, `services/`, `repositories/`, `dto/`, `converters/`, `your-module.module.ts`
3. If it has a DB entity: add entity to `src/database/entities/`, update `index.ts`, register with `TypeOrmModule.forFeature([YourEntity])`
4. Import module in `app.module.ts`
5. If enums are needed: add to `src/constants/enums.ts`
