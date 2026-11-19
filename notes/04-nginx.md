## Topic:

## Nginx Reverse Proxy

- Nginx receives client requests and forwards them to backend services.
- `proxy_pass http://api:3000` routes requests to the API.
- Docker DNS resolves `api` within the Compose network.
- `8080:80` publishes Nginx port 80 on host port 8080.
- Bind mounts allow Nginx configuration without rebuilding the image.
- `:ro` makes the mounted configuration read-only.
- A reverse proxy can provide TLS termination, load balancing, and request controls.

## Nginx Load Balancing

- Horizontal scaling: Run multiple instances of the same application.
- One Docker image can create multiple API containers.
- Each container has its own IP and network namespace.
- Multiple containers can listen on the same internal port.
- Publishing the same host IP:port for multiple containers causes a conflict.
- Nginx distributes requests across API replicas.
- Round robin is Nginx's default upstream balancing method.
- Docker DNS resolves service names to container IP addresses.
- `resolve` allows Nginx to update backend addresses dynamically.
- `zone backend 64k` allocates shared memory for upstream state.
- Source changes require rebuilding the image for this Dockerfile setup.
- Image tags identify versions; Compose selects the image to deploy.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
