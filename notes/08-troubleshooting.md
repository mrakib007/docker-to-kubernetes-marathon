## Topic:

## Troubleshooting

- `postgres:16-alpine` is one image tag.
- `postgres:16 alpine` means image `postgres:16` with an extra command argument.
- `docker ps` shows running containers; `docker ps -a` includes stopped containers.
- `docker logs CONTAINER` shows startup errors.

### Topic 37 — Container Logs

- Applications write logs to stdout/stderr.
- Docker captures container output through its logging system.
- Logs help identify application errors and failures.
- Logs are not the same as health checks.
- Production systems often centralize logs.

### Commands

```bash
docker compose logs api --tail=20
docker compose logs nginx --tail=20
docker compose logs -f api
```

`Ctrl+C` stops following logs, not the container.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
