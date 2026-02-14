# Microservices Test Task

Test assignment: Two NestJS microservices with JWT authentication and CRUD operations.

## 🏗️ Architecture

- **Auth Service** (port 3001) - User registration, login, JWT token management
- **Todo Service** (port 3002) - CRUD operations for posts with authorization
- **PostgreSQL** (port 5432) - Shared database
- **Inter-service communication** - Todo Service validates tokens via Auth Service

## 🚀 Quick Start (Docker)
```bash
# Clone repository
git clone 
cd microservices-project

# Start all services
docker compose up -d

# Check status
docker ps

# View logs
docker compose logs -f
```

**Services will be available at:**
- Auth Service Swagger: http://localhost:3001/api
- Todo Service Swagger: http://localhost:3002/api

## 📦 Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL 15
- **ORM:** TypeORM
- **Authentication:** JWT (access + refresh tokens)
- **Validation:** class-validator
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker & Docker Compose

## 🔑 API Endpoints

### Auth Service (http://localhost:3001)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /auth/register | Register new user | ❌ |
| POST | /auth/login | Login user | ❌ |
| POST | /auth/refresh | Refresh tokens | ❌ |
| GET | /auth/validate | Validate token (for Todo Service) | ✅ |

### Todo Service (http://localhost:3002)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /posts | Get all posts | ❌ |
| GET | /posts/:id | Get post by ID | ❌ |
| POST | /posts | Create post | ✅ |
| PUT | /posts/:id | Update post (owner only) | ✅ |
| DELETE | /posts/:id | Delete post (owner only) | ✅ |

## 🧪 Testing Flow

### 1. Register user (Auth Service)
```bash
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Copy access_token from response

### 3. Authorize in Todo Service Swagger
Click "Authorize" button → Paste token → Authorize

### 4. Create post
```bash
POST http://localhost:3002/posts
Authorization: Bearer 
Content-Type: application/json

{
  "title": "My Post",
  "content": "Post content here"
}
```

## 🌱 Seed Data

Pre-populated test data:

**Users:**
- admin@test.com / admin123
- user1@test.com / user123
- user2@test.com / user123

**Posts:** 10 test posts created by different users

### Run seeds manually:
```bash
# Stop Docker services
docker compose down

# Start only PostgreSQL
docker compose up -d postgres

# Seed users
cd auth-service
npm run seed

# Seed posts
cd ../todo-service
npm run seed
```

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm
- Docker & Docker Compose

### Setup
```bash
# Install dependencies for both services
cd auth-service && npm install
cd ../todo-service && npm install

# Copy environment files
cd auth-service && cp .env.example .env
cd ../todo-service && cp .env.example .env

# Start PostgreSQL
docker compose up -d postgres

# Start Auth Service (terminal 1)
cd auth-service
npm run start:dev

# Start Todo Service (terminal 2)
cd todo-service
npm run start:dev
```

## 🐳 Docker Commands
```bash
# Build images
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Remove everything (including database!)
npm run docker:clean
```

## 📁 Project Structure
```
.
├── auth-service/           # Authentication microservice
│   ├── src/
│   │   ├── auth/          # JWT logic, tokens
│   │   ├── users/         # User management
│   │   └── seeds/         # Database seeding
│   ├── Dockerfile
│   └── .env.example
│
├── todo-service/          # CRUD microservice
│   ├── src/
│   │   ├── posts/         # Posts CRUD
│   │   ├── guards/        # Auth guard (validates via Auth Service)
│   │   └── seeds/         # Database seeding
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml     # All services configuration
└── README.md
```

## 🔐 Environment Variables

See [ENV.md](ENV.md) for detailed environment variables specification.

## 🧪 Testing (Bonus)
```bash
# Unit tests
cd auth-service && npm test
cd todo-service && npm test

# E2E tests
cd auth-service && npm run test:e2e
cd todo-service && npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Notes

- Access token expires in **1 hour**
- Refresh token expires in **7 days**
- Todo Service validates tokens by calling Auth Service `/auth/validate` endpoint
- Users can only update/delete their own posts
- PostgreSQL data persists in Docker volume `postgres_data`

## 🤝 Assignment Requirements

✅ Two microservices on NestJS  
✅ JWT authentication (access + refresh tokens)  
✅ Access token lifetime: 1 hour  
✅ Token refresh mechanism  
✅ Second service validates authorization  
✅ CRUD for Post model  
✅ Data validation  
✅ Logging  
✅ PostgreSQL database  
✅ Swagger documentation  
✅ Docker containerization  
✅ Startup scripts  
✅ Seed data  
✅ Environment variables with specification  
✅ (Bonus) Unit & E2E tests