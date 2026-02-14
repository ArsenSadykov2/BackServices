# Environment Variables Specification

This document describes all environment variables used in the project.

## Auth Service

Located in: `auth-service/.env`

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | number | Yes | 3001 | Port for Auth Service |
| `DB_HOST` | string | Yes | localhost | PostgreSQL host (use `postgres` in Docker) |
| `DB_PORT` | number | Yes | 5432 | PostgreSQL port |
| `DB_USER` | string | Yes | - | PostgreSQL username |
| `DB_PASSWORD` | string | Yes | - | PostgreSQL password |
| `DB_NAME` | string | Yes | - | PostgreSQL database name |
| `JWT_SECRET` | string | Yes | - | Secret key for JWT signing (min 32 characters) |
| `JWT_ACCESS_EXPIRES` | string | Yes | 1h | Access token expiration time (e.g., 1h, 60m, 3600s) |
| `JWT_REFRESH_EXPIRES` | string | Yes | 7d | Refresh token expiration time (e.g., 7d, 168h) |

### Example (.env.example)
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=microservices_db
JWT_SECRET=super_secret_key_change_in_production_min_32_chars
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
```

---

## Todo Service

Located in: `todo-service/.env`

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | number | Yes | 3002 | Port for Todo Service |
| `DB_HOST` | string | Yes | localhost | PostgreSQL host (use `postgres` in Docker) |
| `DB_PORT` | number | Yes | 5432 | PostgreSQL port |
| `DB_USER` | string | Yes | - | PostgreSQL username |
| `DB_PASSWORD` | string | Yes | - | PostgreSQL password |
| `DB_NAME` | string | Yes | - | PostgreSQL database name |
| `AUTH_SERVICE_URL` | string | Yes | - | URL of Auth Service for token validation |

### Example (.env.example)
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=microservices_db
AUTH_SERVICE_URL=http://localhost:3001
```

---

## Docker Environment

Environment variables in `docker-compose.yml` override `.env` files.

### PostgreSQL
```yaml
POSTGRES_USER: admin           # Database superuser
POSTGRES_PASSWORD: admin123    # Superuser password
POSTGRES_DB: microservices_db  # Database name
```

### Network Configuration
- In Docker: Services communicate using container names (`postgres`, `auth-service`, `todo-service`)
- Locally: Services use `localhost`

---

## Security Notes

⚠️ **NEVER commit `.env` files to git!**

- `.env` files contain sensitive data (passwords, secrets)
- Use `.env.example` as a template (without real values)
- For production: use environment-specific secrets management
- Change default passwords and secrets in production
- JWT_SECRET should be a random string (min 32 characters)

---

## Setup Instructions

### For Docker (Recommended)
No `.env` files needed! Variables are set in `docker-compose.yml`
```bash
docker compose up -d
```

### For Local Development
1. Copy example files:
```bash
cp auth-service/.env.example auth-service/.env
cp todo-service/.env.example todo-service/.env
```

2. Edit `.env` files with your values

3. Start services:
```bash
docker compose up -d postgres  
cd auth-service && npm run start:dev
cd todo-service && npm run start:dev
```