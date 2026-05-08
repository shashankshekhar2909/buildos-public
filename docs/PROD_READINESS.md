# BuildOS Production Readiness

## 1) Runtime Contract

- Use pinned `.env` values in production.
- Keep auth mode explicit:
  - `AUTH_MODE=local` or `AUTH_MODE=auth0`
  - `NEXT_PUBLIC_AUTH_MODE` must match backend mode.
- Set `APP_BASE_URL` to exact public URL.

## 2) Startup Validation

- `STRICT_STARTUP_VALIDATION=true`
- Backend will fail fast if required auth env values are missing.

## 3) Project Import Safety

- Default: only allow roots under `PROJECT_ALLOWED_ROOT_PREFIXES`.
- Env:
  - `PROJECT_FINDER_ALLOW_ANY_ROOT=false`
  - `PROJECT_ALLOWED_ROOT_PREFIXES=/app/projects,/home/shashank`

## 4) Docker Visibility

- Mount docker socket read-only for container stats:
  - `/var/run/docker.sock:/var/run/docker.sock:ro`

## 5) Health and Readiness

- Liveness: `GET /health`
- Readiness: `GET /api/system/readiness` (auth required)
- Use Readiness API in deployment checks before traffic cutover.

## 6) Deploy Checklist

1. `docker compose config` clean
2. `docker compose up -d --build`
3. `GET /health` is OK
4. `GET /api/system/readiness` all critical checks OK
5. Login flow works for chosen auth mode
6. Projects list loads expected count
7. Containers summary returns non-zero when docker socket is mounted
