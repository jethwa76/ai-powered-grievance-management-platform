# Security baseline

- Passwords use bcrypt; access tokens are short-lived and refresh tokens are rotated and stored hashed.
- Helmet, strict CORS, JSON limits, rate limiting, schema validation, and server-side authorization are enabled.
- Uploads are allow-listed by MIME type and size and should use object-storage quarantine/virus scanning in production.
- Citizen PII is minimized in logs. Audit events are append-only application records with actor, request ID, action, target, and metadata.
- Configure TLS at the edge, secrets through a managed secret store, MongoDB network restrictions, backups, retention policies, and centralized monitoring before go-live.
