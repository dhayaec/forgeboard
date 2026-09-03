# Data Model

## Overview

ForgeBoard uses PostgreSQL with Prisma ORM. Every tenant-owned table has an `organizationId` column for isolation.

## Entity Relationship

```
User
  └── OrganizationMember (userId, organizationId, roleId)
         └── Organization (id)
                └── Role (organizationId)
                       └── RolePermission (roleId, permissionId)
                              └── Permission (system-wide)

Organization
  ├── Project (organizationId)
  │     └── Task (projectId)
  │           ├── TaskAssignee (taskId, userId)
  │           ├── TaskLabel (taskId, labelId)
  │           ├── Comment (taskId)
  │           └── Attachment (taskId)
  ├── Label (organizationId)
  ├── ApiKey (organizationId)
  ├── Webhook (organizationId)
  └── AuditLog (organizationId)

User
  └── Notification (userId)
```

## Core Entities

### User
```ts
{
  id: string
  email: string (unique)
  name: string?
  emailVerified: DateTime?
  passwordHash: string?  // null if OAuth-only
  mfaSecret: string?     // encrypted TOTP secret
  mfaEnabled: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Organization
```ts
{
  id: string
  name: string
  slug: string (unique)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### OrganizationMember
```ts
{
  id: string
  organizationId: string (FK)
  userId: string (FK)
  roleId: string (FK)
  createdAt: DateTime
}
```

### Role
```ts
{
  id: string
  organizationId: string (FK)
  name: string  // Owner | Admin | Manager | Member | Viewer
  isSystem: boolean  // true for built-in roles
  createdAt: DateTime
}
```

### Permission
```ts
{
  id: string
  resource: string  // projects | tasks | members | etc.
  action: string    // create | read | update | delete | manage
  createdAt: DateTime
}
```

### Project
```ts
{
  id: string
  organizationId: string (FK)
  name: string
  description: string?
  status: enum(active, archived)
  createdById: string (FK → User)
  createdAt: DateTime
  updatedAt: DateTime
  version: number  // optimistic concurrency
}
```

### Task
```ts
{
  id: string
  projectId: string (FK)
  title: string
  description: string?
  status: enum(todo, in_progress, review, done)
  priority: enum(low, medium, high, urgent)
  dueDate: DateTime?
  createdById: string (FK → User)
  assigneeId: string? (FK → User)
  position: float  // for ordering
  createdAt: DateTime
  updatedAt: DateTime
  version: number  // optimistic concurrency
}
```

### Comment
```ts
{
  id: string
  taskId: string (FK)
  userId: string (FK)
  content: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Attachment
```ts
{
  id: string
  taskId: string (FK)
  organizationId: string (FK)
  uploadedById: string (FK → User)
  filename: string
  mimeType: string
  sizeBytes: int
  s3Key: string
  createdAt: DateTime
}
```

### Notification
```ts
{
  id: string
  userId: string (FK)
  type: enum(task_assigned, comment_added, mentioned, status_changed)
  data: JSON  // { taskId, projectId, ... }
  read: boolean
  createdAt: DateTime
}
```

### AuditLog
```ts
{
  id: string
  organizationId: string (FK)
  actorId: string (FK → User)
  action: string  // e.g. "task.created"
  entityType: string  // e.g. "Task"
  entityId: string
  metadata: JSON?  // diff, before/after
  ipAddress: string?
  userAgent: string?
  requestId: string?
  createdAt: DateTime
}
```

### Session
```ts
{
  id: string
  userId: string (FK)
  token: string (unique, hashed)
  expiresAt: DateTime
  userAgent: string?
  ipAddress: string?
  createdAt: DateTime
}
```

### VerificationToken / PasswordResetToken / RecoveryCode
Standard NextAuth-compatible token tables.

### ApiKey
```ts
{
  id: string
  organizationId: string (FK)
  name: string
  keyHash: string  // SHA-256 of key (we store hash, show key once)
  lastUsedAt: DateTime?
  createdAt: DateTime
  expiresAt: DateTime?
}
```

### Webhook
```ts
{
  id: string
  organizationId: string (FK)
  name: string
  url: string
  events: string[]  // ["task.created", "task.updated"]
  secret: string  // encrypted HMAC signing secret
  active: boolean
  createdAt: DateTime
}
```

## Indexes

- `User.email` — unique
- `Organization.slug` — unique
- `OrganizationMember(organizationId, userId)` — unique
- `Task(projectId, status)` — for project board queries
- `Task(assigneeId, status)` — for "my tasks" queries
- `AuditLog(organizationId, createdAt DESC)` — for audit queries
- `Notification(userId, read, createdAt DESC)` — for notification list
- `Attachment(taskId)` — for task attachment list

## Soft Deletes

Tasks, Projects, and Comments support soft delete (`deletedAt`) for data recovery.

## Timestamps

Every model includes `createdAt` and `updatedAt` via Prisma defaults.

## Multi-Tenancy Rule

> Every query on a tenant-owned table MUST include `WHERE organizationId = ?`

Prisma client helper enforces this. See `lib/db/tenant.ts`.
