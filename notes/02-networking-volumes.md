## Topic:

## Docker Volumes & Persistence

- Container writable-layer data is lost when the container is removed.
- Volumes store persistent data independently of containers.
- Named volumes can be reused by replacement containers.
- `-v volume_name:/container/path` mounts a volume.
- Removing a container normally does not remove its named volumes.
- Volumes are not backups; databases still need backups.

### Why Volumes?

- A container has its own writable filesystem layer.
- Data in that layer is lost when the container is removed.
- Volumes store data independently of a container's lifecycle.
- Multiple containers can mount the same named volume.

### Named Volumes

- Created and managed by Docker.
- Mounted at a directory inside the container.
- Data survives container deletion.
- Removing a container does not normally remove its named volumes.
- Removing a volume can delete its stored data.

### Volume Commands

```bash
docker volume create marathon-data
docker volume ls
docker volume inspect marathon-data

docker run --name volume-test \
  -v marathon-data:/data \
  alpine:3.20 \
  sh -c 'echo "hello from docker" > /data/message.txt'

docker rm volume-test

docker run --rm \
  -v marathon-data:/data \
  alpine:3.20 \
  cat /data/message.txt
```

### Volume Command Explanation

- `-v marathon-data:/data`: Mounts the named volume at `/data`.
- `sh -c`: Runs a shell command string.
- `>`: Redirects output into a file.
- `--rm`: Automatically removes the container after exit.
- `docker rm`: Removes a stopped container.

### Volume Key Concept

Container deleted ≠ Volume deleted.

A volume is persistent storage, but it is not automatically a backup.

## Bind Mounts vs Named Volumes

- **Named volume:** Docker manages the storage location.
- **Bind mount:** Uses an explicitly chosen host file/directory.
- Both provide direct access to mounted files.
- Bind mounts are useful for local development and configuration.
- Named volumes are generally preferred for database persistence.
- `-v /host/path:/container/path` creates a bind mount.
- `$(pwd)` returns the current directory's absolute path.
- Host and container changes are visible through the same mount.

## 9. Docker Networking

- **Bridge:** Isolated virtual network for containers; default on Linux.
- **Host:** Shares the host network namespace.
- **None:** No external networking; loopback only.
- Containers on the same bridge can communicate using network IPs.
- `-p HOST:CONTAINER` publishes a container port through the host.
- Each container has its own network namespace.
- `127.0.0.1` = the container's own loopback.
- Same bridge → unique container IPs.
- Same-bridge containers can communicate without `-p`.
- User-defined bridges support container-name DNS.
- Internal bridge traffic does not need the physical NIC.
- Outbound internet → usually NAT (container IP → host IP).
- `-p 8080:3000` → host port 8080 to container port 3000.
- `-p 127.0.0.1:8080:3000` → host-loopback-only publishing.
- Internet access also depends on firewalls/routers.
- `127.0.0.1:3000` → listen only on the container loopback.
- `0.0.0.0:3000` → listen on all container IPv4 interfaces.
- Multiple API endpoints can share one port.
- Response traffic is handled by connection tracking/NAT.
- A network namespace gives a container its own network interfaces, IPs, routes, and ports.
- A container IP is a private address used for communication within Docker networks.
- NAT translates network addresses and ports when traffic crosses networks.
- `0.0.0.0` means a server listens on all IPv4 interfaces in its network namespace.

### Key Rule

`localhost` inside a container is not `localhost` on the host.

### Commands

```bash
docker network ls
docker network inspect bridge
docker run --network host ...
docker run --network none ...
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
