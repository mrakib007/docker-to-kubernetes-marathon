## Health Checks and Deployment Verification

Running ≠ Healthy ≠ Ready

- Running: Container's main process is alive.
- Healthy: Configured health check succeeds.
- Ready: Application can handle required requests.

### Our `/health` Endpoint

```json
{"status":"ok"}
```

It checks whether Node.js responds.  
It does **not** check PostgreSQL connectivity.

### Docker Health Checks

- Execute periodically inside the container.
- Exit code 0 = success.
- Nonzero exit code = failure.
- Repeated failures = unhealthy status.

### Important

- Docker does not automatically restart a running container solely because it becomes unhealthy.
- `restart: unless-stopped` handles container exits.
- PostgreSQL `pg_isready` does not validate application tables.

### Deployment Verification

```bash
docker compose ps
docker compose logs api --tail=50

curl -k https://127.0.0.1:8443/health
curl -k https://127.0.0.1:8443/users
```
