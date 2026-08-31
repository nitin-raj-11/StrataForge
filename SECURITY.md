# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in StrataForge, please report it by emailing the project maintainers directly. Please do not open a public issue for security vulnerabilities.

When reporting a vulnerability, please include:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

## Security Best Practices for Deployment

### Required Environment Variables for Production

**CRITICAL**: The following environment variables MUST be set with secure values before deploying to production:

1. **`JWT_SECRET`** (REQUIRED)
   - Must be at least 32 characters long
   - Use a cryptographically random string
   - Never use the default value from application.properties
   - Generate with: `openssl rand -base64 32`

2. **`POSTGRES_PASSWORD`** (REQUIRED)
   - Use a strong, randomly generated password
   - Never use the development default `strataforge_pass_dev_only`
   - Generate with: `openssl rand -base64 24`

3. **`DATABASE_PASSWORD`** (REQUIRED)
   - Must match the PostgreSQL password
   - Store securely (use secret management service)

4. **`PASSWORD_RESET_DEV_MODE`** (REQUIRED)
   - MUST be set to `false` in production
   - When `true`, password reset tokens are exposed in API responses
   - This is a development-only feature for testing without SMTP

5. **`CORS_ALLOWED_ORIGINS`** (REQUIRED)
   - Set to your actual frontend domain(s)
   - Never use `*` or wildcard origins with credentials
   - Example: `https://your-domain.com`

### Optional Security Enhancements

For production deployments, consider:

- **SMTP Configuration**: Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` for password reset emails
- **Rate Limiting**: Add rate limiting on authentication endpoints to prevent brute force attacks
- **HTTPS Only**: Ensure all traffic uses HTTPS in production
- **Database Connection**: Use SSL/TLS for PostgreSQL connections
- **Security Headers**: Configure reverse proxy to add HSTS, X-Content-Type-Options, etc.

## Development vs Production

### Development Defaults (docker-compose.yml)

The `docker-compose.yml` file contains development defaults that are **INSECURE** for production:
- Default database password: `strataforge_pass_dev_only`
- Default JWT secret: `change-me-in-development-at-least-32-characters`
- Dev mode enabled: `PASSWORD_RESET_DEV_MODE=true`

**These are intentionally obvious to prevent accidental production use.**

### Production Deployment

When deploying to production:
1. Copy `.env.example` to `.env`
2. Replace ALL placeholder values with secure, randomly generated secrets
3. Set `PASSWORD_RESET_DEV_MODE=false`
4. Configure SMTP for password reset emails
5. Use a managed PostgreSQL instance or secure your database
6. Enable HTTPS/TLS for all connections
7. Review and apply security headers at the reverse proxy level

## Known Security Considerations

### JWT Token Storage
- Tokens are stored in browser `localStorage`
- Consider using `httpOnly` cookies for enhanced XSS protection in future versions

### Password Reset Flow
- Tokens expire after 30 minutes (configurable via `PASSWORD_RESET_EXPIRATION_MINUTES`)
- Tokens are single-use only
- In dev mode, tokens are exposed in API responses for testing without email

### CORS Configuration
- CORS is restricted to configured origins only
- Credentials are allowed for authenticated requests
- Ensure `CORS_ALLOWED_ORIGINS` matches your frontend domain exactly

## Dependency Security

We recommend:
- Regularly updating dependencies to patch security vulnerabilities
- Using tools like Dependabot, Snyk, or OWASP Dependency-Check
- Reviewing Maven and npm audit reports before deployment

## Supported Versions

Security updates are provided for:
- Latest version only (currently 0.1.0)

## Security Features

Current security implementations:
- ✅ BCrypt password hashing with automatic salt
- ✅ JWT-based stateless authentication
- ✅ SQL injection protection via JPA parameterized queries
- ✅ CSRF protection disabled (stateless API, no cookies)
- ✅ Spring Security with role-based access control
- ✅ Input validation on authentication endpoints
- ✅ Password minimum length enforcement (8 characters)
- ✅ Email normalization (lowercase, trimmed)
- ✅ One-time password reset tokens with expiration
