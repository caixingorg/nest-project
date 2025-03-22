# Prisma ORM in NestJS

This project uses [Prisma](https://www.prisma.io/) as the ORM (Object-Relational Mapping) tool for database access. This document provides a quick reference for working with Prisma in this project.

## Overview

Prisma is a next-generation ORM that provides:
- Type-safe database access
- Auto-generated migrations
- Intuitive data modeling
- Powerful query capabilities
- Great developer experience

## Getting Started

### Prerequisites

- Node.js and npm/pnpm installed
- MySQL database running

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Generate Prisma client:
```bash
pnpm prisma:generate
```

3. Run the application:
```bash
pnpm start:dev
```

## Prisma Commands

| Command | Description |
|---------|-------------|
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:studio` | Open Prisma Studio (GUI for database) |
| `pnpm prisma:migrate` | Create and apply migrations |
| `pnpm prisma:deploy` | Apply migrations in production |
| `pnpm prisma:pull` | Pull database schema from existing database |
| `pnpm start:with-prisma` | Run the app with Prisma enabled |

## Project Structure

```
├── prisma/
│   └── schema.prisma       # Prisma schema definition
├── src/
│   ├── prisma/
│   │   ├── prisma.module.ts  # Prisma module
│   │   └── prisma.service.ts # Prisma service
│   └── app/
│       └── modules/
│           ├── user/
│           │   └── repositories/
│           │       └── prisma-user.repository.ts  # User repository using Prisma
│           └── auth/
│               └── repositories/
│                   └── prisma-auth.repository.ts  # Auth repository using Prisma
```

## Prisma Schema

The Prisma schema is defined in `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String
  fullName  String
  email     String   @unique
  isActive  Boolean  @default(true)
  roles     String
  createdAt DateTime @default(now()) @map("createdAt")
  updatedAt DateTime @updatedAt @map("updatedAt")

  @@map("users")
}
```

## Usage Examples

### Querying Data

```typescript
// Find all users
const users = await prisma.user.findMany();

// Find user by ID
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// Find user by username
const user = await prisma.user.findUnique({
  where: { username },
});
```

### Creating Data

```typescript
// Create a new user
const user = await prisma.user.create({
  data: {
    username: 'johndoe',
    password: hashedPassword,
    fullName: 'John Doe',
    email: 'john@example.com',
    roles: 'user',
  },
});
```

### Updating Data

```typescript
// Update a user
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    fullName: 'John Smith',
    email: 'john.smith@example.com',
  },
});
```

### Deleting Data

```typescript
// Delete a user
await prisma.user.delete({
  where: { id: userId },
});
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
