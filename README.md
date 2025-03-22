# NestJS Enterprise Project Template

A comprehensive enterprise-grade NestJS application template with best practices for building scalable and maintainable backend applications.

## Features

- **Modular Architecture**: Well-organized code structure following NestJS best practices
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database Integration**: TypeORM with MySQL support
- **API Documentation**: Swagger/OpenAPI integration
- **Internationalization (i18n)**: Multi-language support
- **Environment Configuration**: Support for multiple environments (development, test, staging, production)
- **Validation**: Request validation using class-validator
- **Error Handling**: Centralized error handling with standardized responses
- **Logging**: Structured logging with Winston
- **Testing**: Unit and E2E testing setup
- **Docker Support**: Containerization with Docker and Docker Compose
- **CI/CD**: GitHub Actions workflow for continuous integration and deployment

## Project Structure

```
/src
  /app                  # Application core
    /modules            # Business modules
      /user             # User module
      /auth             # Authentication module
    /common             # Shared components
      /constants        # Constants
      /decorators       # Custom decorators
      /dto              # Data Transfer Objects
      /entities         # Database entities
      /enums            # Enumerations
      /exceptions       # Custom exceptions
      /filters          # Exception filters
      /guards           # Guards
      /interfaces       # Interfaces
      /middlewares      # Middlewares
      /pipes            # Validation pipes
      /utils            # Utility functions
    /config             # Configuration
      /database         # Database configuration
      /swagger          # API documentation configuration
      /envs             # Environment-specific configurations
  /i18n                 # Internationalization
  /migrations           # Database migrations
```

## Prerequisites

- Node.js (v18 or later)
- pnpm
- MySQL
- Docker & Docker Compose (optional)

## Installation

```bash
# Install dependencies
pnpm install
```

## Running the Application

### Development

```bash
# Run in development mode
pnpm run start:dev
```

### Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Production

```bash
# Build the application
pnpm run build

# Run in production mode
pnpm run start:prod
```

## Docker

```bash
# Build and start containers
pnpm run docker:build
pnpm run docker:up

# Stop containers
pnpm run docker:down

# View logs
pnpm run docker:logs
```

## Database Migrations

```bash
# Generate a migration
pnpm run migration:generate migration-name

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

## Environment Configuration

The application supports multiple environments:

- Development: `.env.development`
- Test: `.env.test`
- Staging: `.env.staging`
- Production: `.env.production`

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## License

MIT
