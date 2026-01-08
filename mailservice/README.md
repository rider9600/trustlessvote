# Mail + Auth + Files Service (Flask)

This Flask microservice provides:
- Microsoft Entra (Azure AD) sign-in via MSAL
- Send email via Microsoft Graph (immediate or scheduled)
- Simple file upload/download/list/delete with SQLite metadata and a mounted volume

## Environment

Set these environment variables (see .env.example):
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- AZURE_TENANT_ID (e.g., `common` or your tenant GUID)
- BASE_URL (e.g., `http://localhost:5000`)
- AUTH_REDIRECT_PATH (default `/auth/redirect`)
- AUTH_REDIRECT_URI (optional; defaults to `BASE_URL + AUTH_REDIRECT_PATH`)
- CORS_ORIGINS (default `http://localhost:3000`)
- FLASK_SECRET_KEY
- UPLOAD_DIR (default `/data/uploads`)
- DB_PATH (default `/app/app.db`)

Required Graph scopes: `User.Read Mail.Send offline_access openid profile email`.
Grant admin consent in Azure Portal for Mail.Send.

## Endpoints
- GET /health
- GET /login → Redirects to Microsoft sign-in
- GET /auth/redirect → OAuth callback
- GET /logout
- GET /me → Current user info from Graph
- POST /send-email → JSON `{to, subject, body, send_at? ISO8601}`
- POST /files → multipart `file`
- GET /files → List
- GET /files/{id} → Download
- DELETE /files/{id}

## Run with Docker
Build is wired via docker-compose at repo root. Ensure env vars are supplied.
