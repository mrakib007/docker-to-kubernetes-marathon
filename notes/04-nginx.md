## Topic:

## Nginx Reverse Proxy

- Nginx receives client requests and forwards them to backend services.
- `proxy_pass http://api:3000` routes requests to the API.
- Docker DNS resolves `api` within the Compose network.
- `8080:80` publishes Nginx port 80 on host port 8080.
- Bind mounts allow Nginx configuration without rebuilding the image.
- `:ro` makes the mounted configuration read-only.
- A reverse proxy can provide TLS termination, load balancing, and request controls.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
