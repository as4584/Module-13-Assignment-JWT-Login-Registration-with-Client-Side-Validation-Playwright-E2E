# JWT Authentication API

A FastAPI application with JWT-based authentication, PostgreSQL database, and comprehensive E2E testing with Playwright.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)
- [Docker Hub](#docker-hub)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)

## ✨ Features

- **JWT Authentication**: Secure token-based authentication
- **User Registration**: Create new accounts with email/password
- **User Login**: Authenticate and receive JWT tokens
- **Password Hashing**: Secure bcrypt password hashing via passlib
- **Input Validation**: Pydantic v2 schemas with comprehensive validation
- **PostgreSQL Database**: SQLAlchemy 2.x ORM with async support
- **E2E Testing**: Comprehensive Playwright tests (positive + negative)
- **Docker Support**: Containerized application with Docker Compose
- **CI/CD Pipeline**: GitHub Actions with automated testing and Docker Hub push

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | FastAPI |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Password Hashing | passlib[bcrypt] |
| JWT Library | python-jose |
| DB Driver | psycopg (psycopg3) |
| E2E Testing | Playwright |
| CI/CD | GitHub Actions |
| Containerization | Docker |

## 📁 Project Structure

```
mod13/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD pipeline
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── config.py          # Configuration from environment
│   │   ├── database.py        # SQLAlchemy database setup
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py         # JWT token utilities
│   │   │   └── password.py    # Password hashing utilities
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── user.py        # User SQLAlchemy model
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── auth.py        # Authentication routes
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── auth.py        # Pydantic schemas
│   ├── static/
│   │   ├── register.html      # Registration page
│   │   └── login.html         # Login page
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Docker build file
│   └── .dockerignore
├── e2e/
│   ├── tests/
│   │   └── auth.spec.ts       # Playwright E2E tests
│   ├── playwright.config.ts   # Playwright configuration
│   └── package.json           # Node.js dependencies
├── docker-compose.yml         # Local development
├── docker-compose.test.yml    # CI testing
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for E2E tests)
- Python 3.11+ (for local development without Docker)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd mod13

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Access the application
# API: http://localhost:8000
# Register page: http://localhost:8000/static/register.html
# Login page: http://localhost:8000/static/login.html
```

## 💻 Local Development

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/auth_db"
export JWT_SECRET="your-secret-key-here"
export JWT_ALGORITHM="HS256"
export JWT_EXPIRES_MINUTES="30"

# Start PostgreSQL (using Docker)
docker run -d --name auth_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=auth_db \
  -p 5432:5432 \
  postgres:15-alpine

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Access

Once the backend is running, open in your browser:

- **Register Page**: http://localhost:8000/static/register.html
- **Login Page**: http://localhost:8000/static/login.html

## 📚 API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy"
}
```

### Register

```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

Success Response (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Error Response (400):
```json
{
  "detail": "Email already registered"
}
```

### Login

```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Success Response (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Error Response (401):
```json
{
  "detail": "Invalid credentials"
}
```

## 🎨 Frontend Pages

### Register Page (`/static/register.html`)

Features:
- Email input with format validation
- Password input with minimum 8 character requirement
- Confirm password with match validation
- Real-time client-side validation
- Success/error message display
- JWT token storage in localStorage on success

### Login Page (`/static/login.html`)

Features:
- Email input with format validation
- Password input with validation
- Success/error message display
- JWT token storage in localStorage on success

## 🧪 Testing

### Running E2E Tests Locally

```bash
# Ensure backend is running first
# Terminal 1:
cd backend && uvicorn app.main:app --reload

# Terminal 2: Run E2E tests
cd e2e

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

### Test Cases

| Test | Type | Description |
|------|------|-------------|
| Register valid user | Positive | Register with valid email/password, verify token storage |
| Login with correct credentials | Positive | Login with valid credentials, verify token storage |
| Register with short password | Negative | Client-side validation for password < 8 chars |
| Login with wrong password | Negative | Server returns 401, UI shows error |
| Register with mismatched passwords | Negative | Client-side validation error |
| Register duplicate email | Negative | Server returns 400 |
| Login with invalid email format | Negative | Client-side validation error |

## 🐳 Docker Hub

**Docker Hub Repository**: `https://hub.docker.com/r/<your-username>/jwt-auth-api`

### Pull the Image

```bash
docker pull <your-username>/jwt-auth-api:latest
```

### Run the Container

```bash
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+psycopg://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  <your-username>/jwt-auth-api:latest
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) performs:

1. **Test Job**:
   - Starts PostgreSQL service container
   - Installs Python dependencies
   - Installs Playwright with Chromium
   - Starts FastAPI server
   - Runs E2E tests
   - Uploads test reports as artifacts

2. **Build and Push Job** (on main/master push only):
   - Builds Docker image
   - Pushes to Docker Hub with tags:
     - `latest`
     - Commit SHA

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `JWT_SECRET` | Secret key for JWT signing |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://postgres:postgres@localhost:5432/auth_db` |
| `JWT_SECRET` | Secret key for JWT signing | `dev-secret-key-change-in-production` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRES_MINUTES` | Token expiration time | `30` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

## 📸 Screenshots

To capture required screenshots:

### 1. GitHub Actions Successful Run

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Click on the latest successful workflow run
4. Screenshot the green checkmarks showing all jobs passed

### 2. Playwright Tests Passing

```bash
cd e2e
npm run test:e2e
# Screenshot the terminal output showing all tests passed
```

### 3. Register Page

1. Open http://localhost:8000/static/register.html
2. Screenshot the registration form
3. Fill in valid data and submit
4. Screenshot the success message

### 4. Login Page

1. Open http://localhost:8000/static/login.html
2. Screenshot the login form
3. Login with valid credentials
4. Screenshot the success message

### 5. Token in localStorage

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Screenshot showing `access_token` key with JWT value

## 📝 License

MIT License
