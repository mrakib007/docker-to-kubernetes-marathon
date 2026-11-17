## Topic:
## Topic 1 — Docker vs Virtual Machines

## 4. Docker Container Lifecycle

A container has its own lifecycle: Created → Running → Stopped → Removed.

- `docker create`: Creates a container without starting it.
- `docker start`: Starts an existing container.
- `docker stop`: Gracefully stops a running container.
- `docker restart`: Restarts a container and its main process.
- `docker rm`: Deletes a stopped container, but not its image.
- `docker ps`: Shows running containers.
- `docker ps -a`: Shows all containers.

### Important Concepts

- A container normally runs as long as its main process is running.
- `sleep 300` keeps the process alive for 300 seconds (5 minutes).
- When the main process exits, the container stops.
- Stopping a container does not delete its data.
- Removing a container deletes its writable layer, but not its image or independently stored volumes.

### Practical Commands

```bash
docker create --name marathon-test alpine:3.20 sleep 300
docker start marathon-test
docker ps -a
docker stop marathon-test
docker restart marathon-test
docker rm marathon-test
```

## 5. Dockerfile and Custom Images

- **Dockerfile:** Instructions for building a custom image.
- **FROM:** Uses an existing image as the base.
- **WORKDIR /app:** Creates/sets a directory inside the image, not on the host.
- **RUN:** Executes commands during image build.
- **CMD:** Defines the default command when a container starts.
- Building from Alpine adds our changes without modifying the original Alpine image.
- Dockerfile changes require rebuilding the image.

### Commands

```bash
docker build -t marathon-hello:v1 .
docker run --rm marathon-hello:v1
docker run --rm marathon-hello:v1 ls -l /app
```

### Build Flags

- `-t`: Image name and tag.
- `-f`: Specify a custom Dockerfile.
- `.`: Current directory as build context.

## 6. Docker Image Layers & Cache

- Docker images use reusable, read-only filesystem layers.
- Build cache avoids repeating unchanged build steps.
- Changing an instruction can invalidate its cache and later steps.
- Not every Dockerfile instruction creates a filesystem layer.
- Copy dependency files before source code to cache dependency installation.

### Commands

```bash
docker build -t marathon-hello:v1 .
docker build -t marathon-hello:v2 .
```

## 7. Dockerizing a Node.js API

- `FROM node:24-alpine`: Base image with Node.js.
- `COPY`: Copies files from the build context into the image.
- `EXPOSE`: Documents the container's listening port; does not publish it.
- `CMD`: Starts the application.
- `-d`: Runs the container in the background.
- `-p HOST:CONTAINER`: Publishes a container port to the host.

### Commands

```bash
docker build -t marathon-api:v1 .
docker run -d --name marathon-api -p 3000:3000 marathon-api:v1
curl http://localhost:3000/health
```

## 8. Docker Debugging

- `docker ps -a`: Check running and stopped containers.
- `docker logs`: Read application stdout/stderr.
- `docker logs -f`: Follow logs in real time.
- `docker exec`: Run commands inside an existing running container.
- `docker inspect`: View detailed container metadata and state.

### Debugging Flow

Check status → Read logs → Inspect configuration → Investigate inside container.

## 9. Docker Environment Variables

- Environment variables configure processes without changing application code.
- Docker passes runtime variables using `-e` or `--env-file`.
- Dockerfile `ENV` defines image-level defaults.
- Runtime `-e` can override Dockerfile `ENV`.
- Node.js reads variables through `process.env`.
- Environment variables are not a secure secret store.
- PostgreSQL `POSTGRES_*` initialization variables only initialize an empty data directory.

## Docker Fundamentals

- Docker runs applications in isolated containers.
- **Image:** A read-only template used to create containers.
- **Container:** A running instance of an image.
- Containers share the host's Linux kernel but have their own userspace and filesystem.
- **VM:** Uses a separate guest operating system and kernel.
- **Container:** Shares the host kernel.

Docker packages applications and dependencies into images and runs them as isolated containers.

### Docker vs VM
- VM: Runs a guest OS with its own kernel.
- Container: Shares the host kernel, with isolated processes and filesystem.
- Containers are generally lighter and faster to start.

### Linux concepts
- Namespaces: Isolate processes, networking, mounts, etc.
- Cgroups: Control and account for resource usage.

### Commands
```bash
docker run --rm alpine:3.20 cat /etc/os-release
cat /etc/os-release
docker run --rm alpine:3.20 uname -r
uname -r
```

### Command flags
- `run`: Create and start a container.
- `--rm`: Remove the container after it exits.

## Docker Architecture

- **CLI:** Sends requests to the Docker Engine.
- **dockerd:** Manages Docker resources.
- **containerd:** Manages the container lifecycle.
- **runc:** Creates isolated container processes.
- **Linux kernel:** Executes processes and provides isolation.

### Architecture flow

```text
CLI → dockerd → containerd → runc → Linux kernel
```

### Architecture commands

```bash
systemctl status docker  # Check Docker service
docker info              # Inspect Docker Engine
```

### Findings
- Host OS:
- Container userspace OS:
- Host kernel:
- Container kernel:

### Key takeaway
A Linux container is not a full virtual machine. It uses the host Linux kernel.



### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
