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

## Nginx Failure Handling and Timeouts

### Fault Tolerance

- Nginx can distribute traffic across multiple API replicas.
- If one replica fails, healthy replicas can continue serving requests.
- Docker DNS can update container IP addresses when replicas change.
- `resolve` allows Nginx to refresh upstream addresses dynamically.

### Timeouts

- `proxy_connect_timeout`: Time allowed to establish an upstream connection.
- `proxy_read_timeout`: Maximum idle time between upstream reads.
- `proxy_send_timeout`: Maximum idle time between upstream writes.
- These are not necessarily total request-duration limits.

### Failover and Retries

- `proxy_next_upstream` controls when Nginx tries another backend.
- `proxy_next_upstream_tries` limits total upstream attempts.
- GET requests are generally safe to retry.
- Retrying POST requests can duplicate side effects.
- Idempotency keys help prevent duplicate operations.

### Important Commands

- `docker stop <container>`: Stop a container.
- `docker start <container>`: Start a stopped container.
- `docker compose exec nginx nginx -t`: Validate Nginx configuration.
- `docker compose exec nginx nginx -s reload`: Reload Nginx configuration.

## Nginx Rate Limiting

- Rate limiting protects APIs from excessive requests and overload.
- Nginx `limit_req` uses a leaky-bucket algorithm.
- `$binary_remote_addr` identifies clients by IP in binary format.
- `limit_req_zone` defines the rate, tracking key, and shared memory.
- `zone=api_limit:10m` allocates 10 MB for tracking client request rates.
- `rate=5r/s` sets an average of 5 requests per second per IP.
- `burst=5` allows up to 5 excess requests within burst capacity.
- `nodelay` processes accepted burst requests immediately.
- `limit_req_status 429` returns HTTP 429 for rejected requests.

### Configuration

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;

location / {
    limit_req zone=api_limit burst=5 nodelay;
    limit_req_status 429;
}
```

### Commands

```bash
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload

for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/users
done
```

- HTTP 200 = accepted request.
- HTTP 429 = rate-limited request.
- Rate limiting by IP may group multiple users behind the same public IP.

## Topic 26 — HTTPS, TLS & SSL Termination

### Concepts

- HTTPS = HTTP secured using TLS.
- TLS provides encryption, server authentication, and data integrity.
- Connection setup: TCP handshake → TLS handshake → HTTP requests/responses.
- TLS certificate: binds a public key to a hostname and is digitally signed.
- Certificate Authority (CA): trusted organization that verifies and signs certificates.
- Self-signed certificate: supports encryption but is not trusted automatically by browsers.
- Subject Alternative Name (SAN): lists hostnames covered, e.g. `DNS:localhost`.
- TLS termination: Nginx decrypts incoming HTTPS traffic and forwards HTTP to the backend in our setup.
- Keep-Alive: multiple HTTP requests can reuse one TCP connection, avoiding repeated handshakes.

### Local HTTPS Configuration

- Host port `8443` → container port `443`.
- `localhost.crt` = certificate; `localhost.key` = private key.
- Certificates are bind-mounted read-only into Nginx.
- Keep `nginx/certs/` out of Git.

```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /etc/nginx/certs/localhost.crt;
    ssl_certificate_key /etc/nginx/certs/localhost.key;

    location / {
        proxy_pass http://backend;
    }
}
```

### Commands

```bash
mkdir -p nginx/certs

openssl req -x509 -nodes -days 30 \
  -newkey rsa:2048 \
  -keyout nginx/certs/localhost.key \
  -out nginx/certs/localhost.crt \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost"

docker compose up -d --no-deps nginx
docker compose exec nginx nginx -t
curl -k -i https://localhost:8443/users
```

- `--no-deps`: Do not start or recreate dependent services.
- `-k`: Skip certificate verification for local testing only.
- Edit bind-mounted `default.conf` → reload Nginx.
- Change Compose ports/volumes → recreate the container, not the image.
- Change Dockerfile/image contents → rebuild the image and recreate the container.

**Verified:** HTTPS returned `HTTP 200` with API JSON.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
