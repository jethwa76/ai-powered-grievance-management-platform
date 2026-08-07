# API Overview

All endpoints are prefixed with `/api/v1`. Protected routes use `Authorization: Bearer <access-token>`.

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /users/me`, `PATCH /users/me`
- `POST /complaints`, `GET /complaints`, `GET /complaints/:id`, `GET /complaints/track/:ticketId`
- `PATCH /complaints/:id/status`, `PATCH /complaints/:id/assign`, `POST /complaints/:id/notes`, `POST /complaints/:id/feedback`
- `GET /notifications`, `PATCH /notifications/:id/read`
- `GET /admin/analytics`, `GET /admin/audit-logs`, `GET /review-queue`, `POST /review-queue/:id/decision`

Errors use `{ "success": false, "error": { "code": "...", "message": "..." } }`.
