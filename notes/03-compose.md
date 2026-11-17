## Topic:

## Docker Compose Basics

- Docker Compose manages containers using a YAML configuration file.
- It uses Docker, not a separate container runtime.
- `compose.yaml` defines services, images, commands, networks, and volumes.
- A service is a definition for running one or more containers.
- `docker compose up` → Creates and starts services.
- `docker compose down` → Stops and removes Compose-managed containers and networks.
- Named volumes are preserved by default when using `docker compose down`.

## Compose Lifecycle

- Compose automatically creates a default network.
- Compose service names are used to identify services.
- `docker compose up` → Creates and starts services.
- `docker compose ps -a` → Shows service containers, including exited ones.
- `docker compose down` → Removes service containers and Compose networks.
- A container stops when its main process exits.
- Exit code 0 means the process completed successfully.
- `docker compose down` preserves named volumes unless `-v` is specified.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
