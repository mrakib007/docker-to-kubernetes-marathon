## Topic 28 — Production Deployment Fundamentals

### Concepts

- **Server:** A computer that runs applications and serves requests.
- **VPS (Virtual Private Server):** A virtual machine with its own OS, allocated CPU, RAM, and storage.
- **Production deployment:** Running our application on a server accessible to intended users.
- **SSH (Secure Shell):** Securely connects to and manages remote Linux servers.
- SSH typically uses port `22`; HTTPS typically uses `443`.
- SSH supports password or key-based authentication; keys are generally preferred.

### Deployment Architecture

```text
Developer Laptop
      |
      | SSH / Deployment
      v
Linux VPS
  ├── Docker
  ├── Nginx
  ├── Node.js API
  └── PostgreSQL
      |
      v
Users access the application via HTTPS
```

### Linux Server Commands

```bash
hostname            # Machine hostname
cat /etc/os-release # OS information
nproc               # Available logical CPU count
free -h             # RAM and swap usage
df -h /             # Disk usage for root filesystem
```

### Key Takeaways

- A VPS works much like our Linux laptop.
- Docker Compose can run the same application on another compatible Linux machine.
- SSH lets us administer the VPS remotely.
- Production servers need security, monitoring, backups, and reliable deployment procedures.

## Topic 29 — SSH Key Authentication

- SSH securely connects to remote Linux servers.
- SSH uses public/private key pairs for authentication.
- The private key stays on the client; the public key is registered on the server.
- The server verifies a signature to confirm private-key ownership.
- Private keys are never transmitted during authentication.

### Important Files

- `~/.ssh/id_ed25519` — Private key.
- `~/.ssh/id_ed25519.pub` — Public key.
- `~/.ssh/known_hosts` — Trusted server identities.
- `/home/deploy/.ssh/authorized_keys` — Public keys allowed to log in as `deploy`.

### Commands

```bash
ssh -V                                # SSH version
ls -la ~/.ssh                         # Inspect SSH files
ssh-keygen -lf ~/.ssh/id_ed25519.pub  # Public-key fingerprint
ssh deploy@SERVER_IP                  # Connect to remote server
```

### Key Difference

- `authorized_keys` → Server verifies the client.
- `known_hosts` → Client verifies the server.

## Topic 30 — Linux Server Security

### Linux Users & Permissions

- `root` has full system privileges.
- Use regular users for everyday administration.
- `sudo` runs commands with elevated privileges when authorized.
- `chmod 600` → Owner can read/write; nobody else.
- `chmod 644` → Owner can read/write; others can read.

### SSH Hardening

- `PermitRootLogin no` → Disable direct root SSH login.
- `PasswordAuthentication no` → Disable SSH password authentication.
- `PubkeyAuthentication yes` → Enable SSH key authentication.
- Verify key-based login before disabling password login.

### Firewall (UFW)

- Firewall controls allowed network traffic.
- UFW = Uncomplicated Firewall.
- Allow public HTTP/HTTPS access on ports 80/443.
- Restrict SSH port 22 to trusted administrators where practical.
- Keep API port 3000 and PostgreSQL port 5432 private.
- Docker-published ports may bypass UFW rules; control port publishing too.

### Commands

```bash
whoami                   # Current user
id                       # User and group IDs
groups                   # User groups
sudo -l                  # Check sudo permissions
chmod 600 FILE           # Restrict file permissions

sudo ufw status verbose  # Inspect firewall
sudo ss -tulnp           # Inspect listening ports
```

### Key Principle

Expose only the services that need public access.

```text
Browser → Nginx → Node.js → PostgreSQL
          Public     Private     Private
```
