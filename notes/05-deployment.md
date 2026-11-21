## Topic:

### Topic 36 — Health Checks

- Running != Healthy != Ready.
- Running: Container process is alive.
- Healthy: Docker health-check command succeeds.
- Ready: Application can handle required traffic.
- Liveness: Is the application alive?
- Readiness: Can the application serve requests?
- `/health` currently checks Node.js only.
- `/users` also checks database functionality.
- Docker does not automatically restart a running container solely because it becomes unhealthy.
- Health checks help detect failures.
- Deployment verification includes health, logs, and real API requests.

### Commands

```bash
docker compose ps
docker compose logs api --tail=50
curl -k https://localhost:8443/health
curl -k https://localhost:8443/users
```

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
