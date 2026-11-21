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

### Topic 38 — Restart Policies and Recovery

- Docker restart policies control automatic container restarts.
- `restart: unless-stopped` restarts crashed containers.
- Explicitly stopped containers remain stopped.
- Containers can restart after a server reboot when Docker starts.
- Restart policies do not repair unhealthy running processes.
- Named volumes preserve database data across container restarts.
- Process recovery does not guarantee zero downtime.

### Commands

```bash
docker compose kill api
docker compose ps
```

### Topic 40 — Database Migrations

- Migrations are version-controlled database schema changes.
- Application code and database schema must remain compatible.
- `git pull` downloads migration files but does not execute them.
- Migrations should run in a controlled deployment step.
- Production migration tools track which migrations have run.
- Schema changes may require backward compatibility.
- Database backups and migration rollbacks solve different problems.

### Topic 41 — Zero-Downtime Deployment

- Zero downtime means deploying without interrupting service.
- Multiple replicas alone do not guarantee availability.
- Rolling deployment replaces replicas gradually.
- New replicas should become ready before receiving traffic.
- Old replicas should drain existing requests before shutdown.
- Docker Compose does not automatically provide safe rolling updates.
- Kubernetes supports readiness-aware rolling updates.
- Blue-green deployment uses separate old/new environments.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
