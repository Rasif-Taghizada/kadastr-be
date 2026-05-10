# Backend — Project Rules

Read this file on every session. Every line of code you write must follow these rules.
All rules are derived from this project's actual codebase — nothing generic.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Database | PostgreSQL + TypeORM 0.3 |
| Auth | JWT via `jsonwebtoken` + Passport |
| File storage | MinIO (S3-compatible) |
| Validation | `class-validator` + `class-transformer` |
| Config | `@nestjs/config` with typed factories |
| Rate limiting | `@nestjs/throttler` (global) |
| Events | `@nestjs/event-emitter` |
| Scheduler | `@nestjs/schedule` |

---

## Folder Structure

```
src/
├── constants/                  # Global enums, route prefixes, app-wide values
│   ├── enums.ts                # UserRole, TokenType — ALL enums live here
│   ├── routes.ts               # ROUTES.AUTH, ROUTES.USERS, ...
│   ├── app.ts                  # DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT
│   └── index.ts
│
├── config/                     # ConfigService factory functions
│   ├── app.config.ts           # port, env, corsOrigin
│   ├── database.config.ts      # TypeORM options factory
│   ├── database.data-source.ts # CLI datasource for migrations
│   ├── env.config.ts           # ConfigModule setup, loads all factories
│   ├── jwt.config.ts           # jwt.secret, jwt.expiresIn
│   ├── main.config.ts          # Registers global pipes, filters, interceptors, CORS
│   ├── minio.config.ts         # minio.endpoint, minio.port, minio.bucketName, ...
│   ├── throttler.config.ts     # ttl, limit
│   └── index.ts
│
├── common/                     # Shared across ALL modules
│   ├── decorators/
│   │   ├── public.decorator.ts         # @Public() — bypasses JwtAuthGuard
│   │   └── current-user.decorator.ts   # @CurrentUser() — extracts user from request
│   ├── dto/
│   │   ├── pagination-query.dto.ts     # page, limit query params
│   │   └── pagination.dto.ts           # PaginationDto<T> response wrapper
│   ├── filters/
│   │   └── http-exception.filter.ts    # Global error handler — uniform error shape
│   ├── guards/
│   │   └── jwt-auth.guard.ts           # Global JWT guard (registered in AuthModule)
│   ├── interceptors/
│   │   └── logging.interceptor.ts      # Logs every request/response with timing
│   ├── pipes/
│   │   └── parse-enum.pipe.ts          # Validates query param against an enum
│   ├── validators/
│   │   └── at-least-one-of.validator.ts # @AtLeastOneOf([...]) for PATCH DTOs
│   └── utils/
│       ├── hash.utils.ts               # hashPassword(), comparePassword() via bcrypt
│       └── pagination.utils.ts         # getPaginationOptions() → { skip, take, page, limit }
│
├── database/
│   ├── entities/
│   │   ├── base.entity.ts      # id (uuid), createdAt, updatedAt, deletedAt (soft delete)
│   │   ├── user.entity.ts
│   │   └── index.ts            # Barrel export — always import entities from here
│   ├── migrations/             # TypeORM auto-generated only
│   └── seeds/
│       └── seed.runner.ts
│
├── modules/
│   ├── app/                    # Root module
│   │   ├── app.module.ts       # Imports all feature modules + global providers
│   │   ├── app.controller.ts   # GET /health
│   │   └── app.service.ts
│   │
│   └── {feature}/              # One folder per domain
│       ├── controllers/
│       │   └── {feature}.controller.ts
│       ├── services/
│       │   └── {feature}.service.ts
│       ├── repositories/
│       │   └── {feature}.repository.ts
│       ├── dto/
│       │   ├── {feature}.request.dto.ts
│       │   └── {feature}.response.dto.ts
│       ├── converters/
│       │   └── {feature}.converter.ts
│       └── {feature}.module.ts
│
└── main.ts
```

---

## Layering Rules

### Request flow — always in this order:

```
HTTP Request
    ↓
Controller      ← Receives DTO, calls service, returns response DTO. Nothing else.
    ↓
Service         ← Business logic only. Calls repository, uses converter.
    ↓
Repository      ← All TypeORM queries live here. Named methods. No raw queries elsewhere.
    ↓
Entity          ← Extends BaseEntity.
```

Breaking this flow is a bug, not a style issue.

---

## Rules by Layer

### Controller

```typescript
// ✅ Correct
@Get(':id')
findById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
  return this.userService.findById(id);
}

@Post()
create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
  return this.userService.create(dto);
}

// ❌ Wrong — business logic in controller
@Get(':id')
async findById(@Param('id') id: string) {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) throw new NotFoundException();
  return user;
}
```

- HTTP layer only: receive input, call service, return output
- Always `ParseUUIDPipe` for `:id` params
- Always return a response DTO — never return an entity directly
- No `try/catch` — global `HttpExceptionFilter` handles all errors
- No `@InjectRepository` here — ever

---

### Service

```typescript
// ✅ Correct
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return UserConverter.toDto(user);
  }
}

// ❌ Wrong — injecting TypeORM repository directly into service
constructor(
  @InjectRepository(UserEntity)
  private readonly repo: Repository<UserEntity>,
) {}
```

- Business logic only — no HTTP concerns, no DB queries
- Always use the custom repository class, never `Repository<Entity>` directly
- Always convert entity to DTO via converter before returning
- Never use `process.env` — inject `ConfigService` and use `configService.get('key')`

---

### Repository

```typescript
// ✅ Correct
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByEmailWithPassword(email: string) {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive'],
    });
  }

  findAll(skip: number, take: number) {
    return this.repository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }
}
```

- `@InjectRepository` lives here — nowhere else
- Use `findAndCount` for paginated queries
- Method names describe what they return: `findByEmail`, `findAllActive`, `findWithPassword`
- No business logic here — only data access

---

### DTO

```typescript
// ✅ Request DTO — always use class-validator decorators
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

// ✅ PATCH DTO — every field is optional
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;
}

// ✅ Response DTO — plain class, no decorators
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
```

- Request DTOs: every field decorated with `class-validator`
- Response DTOs: plain class, no decorators, no validation
- `any` type in a DTO is always wrong — define the actual type
- PATCH DTOs: every field has `@IsOptional()`

---

### Converter

```typescript
// ✅ Correct — static class, no DI
export class UserConverter {
  static toDto(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: UserEntity[]): UserResponseDto[] {
    return entities.map(UserConverter.toDto);
  }
}
```

- No `@Injectable()` — plain static class
- Always two methods: `toDto(entity)` and `toDtoList(entities)`
- Inline entity→object mapping in a service is wrong — it belongs here

---

### Entity

```typescript
// ✅ Correct
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })      // sensitive — never returned by default
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
```

- Every entity extends `BaseEntity` — provides `id`, `createdAt`, `updatedAt`, `deletedAt`
- Sensitive fields get `{ select: false }`
- Enum type reference comes from `@/constants/enums`, not defined inside the entity
- Always add the new entity to `src/database/entities/index.ts`

---

## Enum Rule

All enums go in `src/constants/enums.ts`. Never define an enum inside an entity or a DTO file.

```typescript
// ✅ src/constants/enums.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ❌ user.entity.ts
export enum UserRole { ... }  // wrong — enum leaks from entity
```

---

## Config Rule

`process.env` is only allowed inside `src/config/*.config.ts` factory functions.
Everywhere else — inject `ConfigService`.

```typescript
// ✅
constructor(private readonly configService: ConfigService) {}
const secret = this.configService.get<string>('jwt.secret');
const port = this.configService.get<number>('app.port');

// ❌ — anywhere outside src/config/
const secret = process.env.JWT_SECRET;
```

Config namespaces: `jwt.secret`, `jwt.expiresIn`, `app.port`, `app.env`,
`minio.endpoint`, `minio.port`, `minio.bucketName`, `minio.accessKey`, `minio.secretKey`.

---

## Auth Rule

```typescript
// ✅ Sign a token
this.jwtTokenService.sign(user);

// ✅ Public route (bypasses global JwtAuthGuard)
@Public()
@Post('login')
login(@Body() dto: LoginDto) { ... }

// ✅ Get the authenticated user in a controller
@Get('me')
getMe(@CurrentUser() user: UserEntity) {
  return UserConverter.toDto(user);
}

// ❌ Never call jwt.sign() directly
jwt.sign(payload, process.env.JWT_SECRET);
```

- `JwtAuthGuard` is registered globally via `APP_GUARD` in `AuthModule`
- All routes are protected by default
- `@Public()` opts out of auth for that route
- `JwtStrategy` reads the secret via `ConfigService`, never `process.env`

---

## Import Paths

Always use the `@/` alias. Never use relative paths with `../`.

```typescript
// ✅
import { UserEntity } from '@/database/entities';
import { UserRole } from '@/constants/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtTokenService } from '@/modules/auth/services/jwt-token.service';

// ❌
import { UserEntity } from '../../../database/entities/user.entity';
```

---

## Naming Conventions

| Thing | Pattern | Example |
|---|---|---|
| Entity | `{Name}Entity` | `UserEntity`, `BusinessEntity` |
| Request DTO | `{Action}{Name}Dto` | `CreateUserDto`, `UpdateUserDto` |
| Response DTO | `{Name}ResponseDto` | `UserResponseDto` |
| Auth response | `AuthResponseDto` | — |
| Service | `{Name}Service` | `UserService`, `JwtTokenService` |
| Repository | `{Name}Repository` | `UserRepository`, `AuthRepository` |
| Controller | `{Name}Controller` | `UserController` |
| Converter | `{Name}Converter` | `UserConverter` |
| Module | `{Name}Module` | `UserModule`, `AuthModule` |
| Guard | `{Name}Guard` | `JwtAuthGuard`, `RolesGuard` |
| Strategy | `{Name}Strategy` | `JwtStrategy` |
| Decorator (fn) | camelCase | `@Public()`, `@CurrentUser()` |
| Enum key | UPPER_SNAKE | `UserRole.ADMIN`, `TokenType.ACCESS` |
| Config key | `namespace.key` | `jwt.secret`, `minio.bucketName` |
| File | kebab-case | `user.service.ts`, `jwt-auth.guard.ts` |

---

## Adding a New Module — Checklist

1. **Enums** (if needed): add to `src/constants/enums.ts`
2. **Entity**: create in `src/database/entities/`, add to `index.ts`
3. **Module folder**: `src/modules/{feature}/`
4. **Create files**:
   - `repositories/{feature}.repository.ts`
   - `services/{feature}.service.ts`
   - `controllers/{feature}.controller.ts`
   - `dto/{feature}.request.dto.ts`
   - `dto/{feature}.response.dto.ts`
   - `converters/{feature}.converter.ts`
   - `{feature}.module.ts`
5. **Register** the entity with `TypeOrmModule.forFeature([FeatureEntity])` in the module
6. **Import** the module in `app.module.ts`
7. **Migration**: `npm run migration:generate`

---

## What Is Never Acceptable

| Violation | Why |
|---|---|
| `@InjectRepository` in a service | DB access belongs in repository |
| Business logic in a controller | Controller is HTTP layer only |
| `process.env` outside `src/config/` | All config reads through ConfigService |
| Enum defined inside an entity | Creates circular imports, breaks separation |
| `jwt.sign()` called directly | Token logic belongs in JwtTokenService |
| Returning an entity as HTTP response | Exposes DB shape, leaks `select:false` fields |
| Relative imports (`../../`) | Use `@/` alias |
| `any` type in a DTO | Define the actual type |
| Inline entity→object mapping in a service | Belongs in the converter |
| Raw SQL in a service | Belongs in the repository |
