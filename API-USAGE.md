# NestJS Authentication and User API Usage Guide

This guide provides instructions on how to use the authentication and user API endpoints in this NestJS application.

## Authentication Endpoints

### Login

Authenticate a user and get a JWT token.

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "isActive": true,
    "roles": ["admin", "user"],
    "createdAt": "2025-03-15T09:45:00.000Z",
    "updatedAt": "2025-03-15T09:45:00.000Z"
  },
  "message": "Login successful"
}
```

### Logout

Logout the current user.

```
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Profile

Get the current user's profile.

```
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "sub": "uuid",
  "username": "admin",
  "roles": ["admin", "user"]
}
```

### Refresh Token

Refresh the JWT token.

```
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Endpoints

### Get All Users

Get a list of all users.

```
GET /users
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "username": "admin",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "isActive": true,
    "roles": ["admin", "user"],
    "createdAt": "2025-03-15T09:45:00.000Z",
    "updatedAt": "2025-03-15T09:45:00.000Z"
  },
  {
    "id": "uuid-2",
    "username": "user1",
    "fullName": "Regular User",
    "email": "user1@example.com",
    "isActive": true,
    "roles": ["user"],
    "createdAt": "2025-03-15T10:30:00.000Z",
    "updatedAt": "2025-03-15T10:30:00.000Z"
  }
]
```

### Get User by ID

Get a specific user by ID.

```
GET /users/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid-1",
  "username": "admin",
  "fullName": "Admin User",
  "email": "admin@example.com",
  "isActive": true,
  "roles": ["admin", "user"],
  "createdAt": "2025-03-15T09:45:00.000Z",
  "updatedAt": "2025-03-15T09:45:00.000Z"
}
```

### Create User

Create a new user (requires authentication).

```
POST /users
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "fullName": "New User",
  "email": "newuser@example.com",
  "isActive": true,
  "roles": ["user"]
}
```

**Response:**
```json
{
  "id": "uuid-3",
  "username": "newuser",
  "fullName": "New User",
  "email": "newuser@example.com",
  "isActive": true,
  "roles": ["user"],
  "createdAt": "2025-03-15T11:15:00.000Z",
  "updatedAt": "2025-03-15T11:15:00.000Z"
}
```

### Register User (Public)

Register a new user (public endpoint, no authentication required).

```
POST /users/register
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "publicuser",
  "password": "password123",
  "fullName": "Public User",
  "email": "publicuser@example.com",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid-4",
  "username": "publicuser",
  "fullName": "Public User",
  "email": "publicuser@example.com",
  "isActive": true,
  "roles": ["user"],
  "createdAt": "2025-03-15T12:00:00.000Z",
  "updatedAt": "2025-03-15T12:00:00.000Z"
}
```

### Update User

Update an existing user.

```
PATCH /users/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "id": "uuid-1",
  "username": "admin",
  "fullName": "Updated Name",
  "email": "updated@example.com",
  "isActive": true,
  "roles": ["admin", "user"],
  "createdAt": "2025-03-15T09:45:00.000Z",
  "updatedAt": "2025-03-15T12:30:00.000Z"
}
```

### Delete User

Delete a user.

```
DELETE /users/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid-1",
  "username": "admin",
  "fullName": "Admin User",
  "email": "admin@example.com",
  "isActive": true,
  "roles": ["admin", "user"],
  "createdAt": "2025-03-15T09:45:00.000Z",
  "updatedAt": "2025-03-15T09:45:00.000Z"
}
```

## Testing the API

You can test the API using one of the following methods:

### 1. Using the JavaScript Script

Run the JavaScript script to simulate login, getting all users, and logout:

```bash
node simulate-auth-and-users.js
```

### 2. Using the Shell Script

Run the shell script to simulate login, getting all users, and logout:

```bash
./simulate-auth-and-users.sh
```

### 3. Using Postman

Import the Postman collection file `nest-auth-users-api.postman_collection.json` into Postman and use the pre-configured requests to test the API.

### 4. Using cURL

You can also use cURL commands directly:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get all users (replace TOKEN with the actual token from login response)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer TOKEN"

# Logout (replace TOKEN with the actual token from login response)
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

## Internationalization (i18n)

The API supports internationalization. You can specify the language using the `Accept-Language` header or the custom `x-custom-lang` header:

```bash
# Using Accept-Language header
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: zh" \
  -d '{"username":"admin","password":"password123"}'

# Using custom language header
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "x-custom-lang: zh" \
  -d '{"username":"admin","password":"password123"}'
```

Supported languages:
- English (en) - default
- Chinese (zh)
