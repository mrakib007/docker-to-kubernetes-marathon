## Deployment Networking

`127.0.0.1` = the current machine's loopback address.  
`0.0.0.0` = all IPv4 interfaces when used as a bind address.

### Request Flow

```text
Linux Mint :9443
    ↓ VirtualBox NAT forwarding
Debian :8443
    ↓ Docker port mapping
Nginx :443
    ↓ Reverse proxy
Node.js API :3000
    ↓ Docker internal network
PostgreSQL :5432
```

- VirtualBox forwards host ports to guest ports.
- Docker publishes host ports to container ports.
- Containers communicate using Compose service names.
- Source and destination ports can differ.
- Docker-published ports require careful firewall configuration.

### Testing

On Debian:

```bash
curl -k https://127.0.0.1:8443/users
```

On Linux Mint:

```bash
curl -k https://127.0.0.1:9443/users
```

`-k` skips TLS certificate verification for our lab only.
