## Topic:
## Topic 1 — Docker vs Virtual Machines

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
