# Reflection Document

## Project: JWT Authentication with FastAPI

### Overview

This project implements a complete JWT-based authentication system with FastAPI, including user registration and login functionality, a frontend interface, comprehensive E2E testing, and a CI/CD pipeline for automated testing and Docker image deployment.

---

## Challenges Encountered

### 1. SQLAlchemy 2.x ORM Style

**Challenge**: SQLAlchemy 2.x introduces significant changes from 1.x, particularly with the new `Mapped` type annotations and `mapped_column` for defining models.

**Solution**: Used the modern declarative style with proper type hints:
```python
class User(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
```

**Learning**: The new ORM style provides better IDE support and type safety, making code more maintainable.

### 2. Pydantic v2 Validation Changes

**Challenge**: Pydantic v2 changed the validator syntax from `@validator` to `@field_validator` and introduced `model_validator`.

**Solution**: Implemented validators using the new decorators:
```python
@field_validator("password")
@classmethod
def validate_password(cls, v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long")
    return v
```

**Learning**: Pydantic v2 validators are more explicit about being class methods, improving code clarity.

### 3. PostgreSQL Driver Selection

**Challenge**: Choosing between psycopg2-binary (legacy) and psycopg (psycopg3) for the PostgreSQL driver.

**Solution**: Used psycopg with the binary package (`psycopg[binary]`) as it's the modern choice and provides better async support.

**Learning**: The connection string format differs slightly: `postgresql+psycopg://` instead of `postgresql://`.

### 4. Playwright Test Isolation

**Challenge**: E2E tests can interfere with each other if they share database state.

**Solution**: Generated unique emails for each test using timestamps and random strings:
```typescript
function generateUniqueEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `testuser_${timestamp}_${random}@example.com`;
}
```

**Learning**: Test isolation is critical for reliable CI/CD pipelines.

### 5. CI/CD Service Container Timing

**Challenge**: The FastAPI server needs to wait for PostgreSQL to be ready before accepting connections.

**Solution**: Implemented health checks in GitHub Actions and added a retry loop:
```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Learning**: Always use health checks for service dependencies in CI/CD.

---

## What I Learned

### Technical Skills

1. **FastAPI Lifespan Events**: Using `@asynccontextmanager` for startup/shutdown events is cleaner than deprecated `on_event` decorators.

2. **JWT Best Practices**: Including `iat` (issued at) claim along with `exp` and `sub` for comprehensive token validation.

3. **Passlib Context**: The `CryptContext` class with `deprecated="auto"` handles password scheme migration automatically.

4. **Playwright Best Practices**:
   - Use stable selectors (IDs) for reliable tests
   - Clear localStorage between tests for isolation
   - Use `toContainText` for flexible text matching

5. **Docker Multi-stage Consideration**: While not needed for this simple app, learned the pattern for production builds.

6. **GitHub Actions Matrix**: Understanding job dependencies with `needs` and conditional execution with `if`.

### Architectural Insights

1. **Separation of Concerns**: Keeping auth utilities, routes, models, and schemas in separate modules improves maintainability.

2. **Configuration Management**: Using environment variables with sensible defaults enables both local development and production deployment.

3. **Error Handling**: Consistent error responses (using HTTPException with clear messages) improve API usability.

---

## What I Would Improve

### 1. Add Refresh Tokens

Currently, only access tokens are implemented. A production system should include:
- Short-lived access tokens (15-30 minutes)
- Long-lived refresh tokens (7-30 days)
- Token refresh endpoint
- Token revocation mechanism

### 2. Rate Limiting

Add rate limiting to prevent brute force attacks:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

### 3. Email Verification

Implement email verification for new registrations:
- Send verification email with unique token
- Verify email before allowing login
- Resend verification email endpoint

### 4. Password Strength Requirements

Enhance password validation:
- Require uppercase and lowercase letters
- Require numbers
- Require special characters
- Check against common password lists

### 5. Database Migrations

Add Alembic for database migrations:
```bash
alembic init migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 6. Logging and Monitoring

Implement structured logging:
```python
import structlog
logger = structlog.get_logger()
logger.info("user_registered", email=user.email)
```

### 7. API Documentation

Enhance OpenAPI documentation with:
- Detailed descriptions
- Example requests/responses
- Authentication documentation

### 8. Frontend Improvements

- Add loading states and spinners
- Implement proper routing (SPA-style)
- Add protected dashboard page after login
- Implement logout functionality
- Add "remember me" option

### 9. Testing Enhancements

- Add unit tests for auth utilities
- Add integration tests for database operations
- Add API contract tests
- Add load testing with Locust

### 10. Security Headers

Add security headers middleware:
```python
from secure import Secure
secure_headers = Secure()

@app.middleware("http")
async def set_secure_headers(request, call_next):
    response = await call_next(request)
    secure_headers.framework.fastapi(response)
    return response
```

---

## Conclusion

This project successfully implements all required features for JWT authentication with a complete CI/CD pipeline. The implementation follows modern best practices for FastAPI, SQLAlchemy 2.x, and Pydantic v2. The E2E tests provide confidence in the system's functionality, and the GitHub Actions workflow ensures code quality before deployment.

The experience reinforced the importance of:
- Clean code organization
- Comprehensive testing
- Proper error handling
- Security best practices
- Automated deployment pipelines

---

## Time Spent

| Phase | Time |
|-------|------|
| Planning and Design | 30 min |
| Backend Implementation | 2 hours |
| Frontend Implementation | 1 hour |
| E2E Test Development | 1.5 hours |
| Docker Configuration | 30 min |
| CI/CD Pipeline | 1 hour |
| Documentation | 1 hour |
| **Total** | **~7.5 hours** |
