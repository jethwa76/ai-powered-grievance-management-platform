# Operations runbook

## Release checklist

- Set unique production `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values using a managed secret store.
- Configure MongoDB Atlas IP/network policy, backups, alerting, and TTL/retention policies.
- Configure an S3/Cloudinary provider with private buckets, signed URLs, malware scanning, and size/type allow-lists.
- Configure SMTP/SMS/push adapters and verify templates in every supported language.
- Set `CLIENT_URL`, `AI_SERVICE_URL`, and TLS termination before routing public traffic.
- Run migrations/index checks, seed departments, create named admin accounts, and rotate the bootstrap password.

## Observability

Expose `/health` for liveness, collect structured application logs, track request latency and AI timeout/fallback rates, and alert on queue age, error rate, failed logins, and resolution SLA breaches.
