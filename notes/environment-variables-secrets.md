## Environment Variables and Secrets

- Image = application code + dependencies.
- Container = running instance with runtime configuration.
- `process.env` reads environment variables in Node.js.
- Compose substitutes `${VARIABLE}` from `.env` or the shell environment.
- `.env` is not automatically injected into every container.

### Image Rebuild

- Application code or dependencies change.

### Container Recreation

- Runtime environment variables change.

### Example

`.env`:

```env
DB_PASSWORD=marathon123
```

`compose.yaml`:

```yaml
DB_PASSWORD: ${DB_PASSWORD}
```

### Apply Changes

```bash
docker compose up -d --no-build --scale api=3
```

### Security

- Add `.env` to `.gitignore`.
- Run `chmod 600 .env` on the server.
- `.env` is not encrypted.
- Rotate secrets previously exposed in Git.
- Use dedicated secret managers in production.

### PostgreSQL

Changing `POSTGRES_PASSWORD` in Compose does not change the existing database user's password in an initialized volume.
