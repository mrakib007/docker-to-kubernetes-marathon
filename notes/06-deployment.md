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

### Linux Server Preparation

- VPS: Virtual machine hosted by a cloud provider.
- SSH: Secure remote access to a Linux server.
- SSH key authentication: Server verifies proof of private-key ownership using the authorized public key.
- `authorized_keys`: Public keys allowed to log in.
- VirtualBox NAT: Forwards host port 2222 to guest port 22.
- SSH hardening: Disable password authentication and direct root login.
- UFW: Linux firewall management tool.
- Allow port 22 before enabling UFW to preserve SSH access.
- `sudo`: Grants administrative privileges; may still require the user's password.

## Topic 45 — Automated Deployment to Debian

### 1. Complete CI/CD Architecture

```text
Linux Mint (Development)
    |
    | Edit application
    | Test locally
    | git commit + git push
    v
GitHub Repository
    |
    v
GitHub Actions — CI
    |
    | Install dependencies
    | Validate code
    | Build Docker image
    | Publish image
    v
GitHub Container Registry (GHCR)
    |
    | Stores published Docker image
    v
GitHub Actions — CD
    |
    | Wait for CI success
    | Select Debian runner
    | Execute deployment job
    v
Debian VM — Self-hosted Runner
    |
    | Execute deployment script
    | Pull new image
    | Update API containers
    v
Docker Compose
    |
    +-- Nginx
    |
    +-- API replica 1
    +-- API replica 2
    +-- API replica 3
    |
    +-- PostgreSQL
          |
          v
      Named Volume
```

### 2. Development vs Production Compose

Development uses:

```text
compose.yaml
```

Production uses:

```text
compose.yaml + compose.prod.yaml
```

Our production override:

```yaml
services:
  api:
    image: ghcr.io/mrakib007/docker-to-kubernetes-marathon:latest
    build: !reset null
```

Why?

- Development builds the application image locally.
- Production pulls an already-built image from GHCR.
- `build: !reset null` removes the inherited build configuration.

Validate configuration:

```bash
docker compose -f compose.yaml -f compose.prod.yaml config
```

Deploy:

```bash
docker compose -f compose.yaml -f compose.prod.yaml \
  up -d --no-build --scale api=3
```

- `--no-build`: Prevents local image building.
- `--scale api=3`: Maintains three API replicas.

Important:

> Do not use `docker compose down -v` during ordinary deployment. It removes named volumes, potentially deleting PostgreSQL data.

### 3. Why GitHub Cannot SSH Into Our VM

Our Debian server runs inside VirtualBox on Linux Mint.

Linux Mint connects using:

```bash
ssh -p 2222 vboxuser@127.0.0.1
```

VirtualBox forwards:

```text
Mint port 2222 → Debian port 22
```

But `127.0.0.1` always means the current machine.

For a GitHub-hosted runner, `127.0.0.1` refers to the GitHub runner itself, not our laptop.

Therefore, GitHub cannot directly reach our private Debian VM using that address.

Solution:

> Use a self-hosted GitHub Actions runner inside Debian.

Debian initiates an outbound connection to GitHub and receives jobs. No public SSH endpoint is required.

### 4. Self-hosted GitHub Actions Runner

A self-hosted runner is a machine managed by us that executes GitHub Actions jobs.

Our runner:

```text
Name: debian-deploy-runner
Operating system: Debian 13
Architecture: Linux x64
Custom label: debian-deploy
Installation directory: /home/github-runner/actions-runner
Dedicated Linux user: github-runner
```

Why use a dedicated user?

- Separates automation from administration.
- Avoids running the runner process directly as root.
- Makes permissions easier to manage.

Runner files:

- `config.sh`: Registers the runner with GitHub.
- `run.sh`: Starts the runner interactively.
- `svc.sh`: Manages the runner as a systemd service.

Registration:

```bash
./config.sh --url <repository-url> --token <registration-token>
```

Never share or commit the registration token.

### 5. Running the Runner as a systemd Service

Without systemd, the runner must be started manually and kept running.

With systemd, the runner runs in the background and can start automatically after reboot.

Commands from the runner installation directory:

```bash
./svc.sh install github-runner
./svc.sh start
./svc.sh status
./svc.sh stop
```

Service installation and management require administrative permissions.

Successful output:

```text
Connected to GitHub
Listening for Jobs
```

This means:

- The runner successfully authenticated.
- GitHub can assign jobs to it.
- The runner is online and waiting.

### 6. Docker Socket Permissions

Docker socket:

```text
/var/run/docker.sock
```

Typical permissions:

```text
srw-rw---- root docker
```

Meaning:

- Root can access Docker.
- Members of the `docker` group can access Docker.
- Other users cannot access it directly.

Check permissions:

```bash
ls -l /var/run/docker.sock
```

Check user groups:

```bash
id github-runner
```

Temporarily grant Docker access:

```bash
usermod -aG docker github-runner
```

Test:

```bash
runuser -u github-runner -- docker ps
```

**Important security lesson:** Membership in the Docker group effectively grants root-level control over the host.

Therefore, Docker group membership is not a safe least-privilege boundary. A restricted sudo command can be used instead, with the runner's direct Docker group membership removed.

### 7. Linux Permissions and ACLs

Our application directory:

```text
/home/vboxuser/docker-to-kubernetes-marathon
```

Initially, `/home/vboxuser` was accessible only by `vboxuser`, so the GitHub runner received `Permission denied` even when the project directory itself was readable.

Linux checks permissions for every directory in the path.

Use an Access Control List (ACL):

```bash
setfacl -m u:github-runner:--x /home/vboxuser
```

`--x` on a directory allows traversal when the path is known, but does not allow listing directory contents.

Our `.env` remained:

```text
-rw-------
```

This means only the owner has ordinary read/write permission.

Security note:

> A user with root-equivalent Docker access can bypass ordinary filesystem restrictions. ACLs alone cannot contain such a user.

### 8. Deployment Script

Deployment script:

```text
/usr/local/libexec/marathon/deploy.sh
```

Why use a script?

- Centralizes deployment commands.
- Keeps GitHub Actions YAML simple.
- Makes deployment behavior easier to audit.
- Allows explicit permission management.

Core script:

```bash
#!/bin/bash
set -euo pipefail

cd /home/vboxuser/docker-to-kubernetes-marathon

docker compose -f compose.yaml -f compose.prod.yaml pull api

docker compose -f compose.yaml -f compose.prod.yaml \
  up -d --no-build --scale api=3

docker compose -f compose.yaml -f compose.prod.yaml ps
```

- `set -e`: Exit when an unhandled command fails.
- `set -u`: Treat undefined variables as errors.
- `set -o pipefail`: Fail a pipeline if it fails.
- `pull api`: Downloads the published application image.
- `up -d`: Applies container configuration and image changes.
- `--scale api=3`: Maintains three API replicas.
- `ps`: Displays container status.

The script is root-owned and kept outside the Git repository.

### 9. Restricted sudo

Configuration:

```text
/etc/sudoers.d/marathon-deploy
```

Rule:

```text
github-runner ALL=(root) NOPASSWD: /usr/local/libexec/marathon/deploy.sh
```

This allows `github-runner` to invoke only the specified command as root without entering a password.

Validate sudoers syntax:

```bash
visudo -cf /etc/sudoers.d/marathon-deploy
```

Expected:

```text
parsed OK
```

This checks sudoers syntax, not whether deployment succeeds.

Also, a restricted sudo rule is not sufficient isolation if the runner still has unrestricted Docker access.

### 10. GitHub Actions Deployment Job

```yaml
deploy:
  needs: build-and-check
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: [self-hosted, Linux, X64, debian-deploy]

  steps:
    - name: Deploy to Debian
      run: sudo /usr/local/libexec/marathon/deploy.sh
```

- `needs`: Specifies job dependencies. Deployment waits for `build-and-check` to succeed.
- `if`: Runs only for pushes to the `main` branch.
- `runs-on`: Selects a compatible runner using labels.
- `self-hosted`: Uses our own runner.
- `Linux`: Operating system label.
- `X64`: Architecture label.
- `debian-deploy`: Custom runner label.
- `run`: Executes the deployment script on Debian.

### 11. Full Automated Deployment Sequence

1. Developer changes application code on Linux Mint.
2. Developer tests the change locally.
3. Developer commits and pushes to `main`.
4. GitHub Actions starts CI.
5. CI installs dependencies and validates code.
6. CI builds a Docker image.
7. CI publishes the image to GHCR.
8. The CI job succeeds.
9. GitHub Actions starts the deployment job.
10. The Debian self-hosted runner receives the job.
11. The runner invokes the deployment script.
12. Docker pulls the latest published API image.
13. Docker Compose updates the API containers.
14. The PostgreSQL named volume remains intact.
15. The deployment script displays container status.

This is automated CI/CD.

### 12. Important Production Limitations

1. **Mutable `latest` image** → Deploy an immutable image digest or release.
2. **No automatic rollback** → Retain the previous release and provide rollback procedures.
3. **No automatic post-deployment health verification** → Wait for healthy replicas and test application endpoints.
4. **Possible deployment interruption** → Use rolling updates and readiness checks.
5. **No staging environment** → Validate changes before production release.
6. **Self-hosted runner on application server** → Isolate runners and tightly restrict trusted workflows.
7. **No automatic Git checkout update on Debian** → Add controlled configuration delivery.
8. **Database migrations are separate** → Include tested migration steps in deployment.
9. **No deployment approval process** → Add environment protection or approval when appropriate.
10. **Limited observability** → Add structured logs, metrics, alerts, and deployment monitoring.

Important:

> The deployment script updates the application image. It does **not** automatically update Compose files or Nginx configuration on Debian.

Also:

> `docker compose up -d` succeeding does not prove that the application is healthy.

### 13. Essential Commands

#### Local development — Linux Mint

```bash
docker compose up -d --build --scale api=3
git add .
git commit -m "update application"
git push origin main
```

#### Validate production configuration

```bash
docker compose -f compose.yaml -f compose.prod.yaml config
```

#### Manual production deployment — Debian

```bash
docker compose -f compose.yaml -f compose.prod.yaml pull api

docker compose -f compose.yaml -f compose.prod.yaml \
  up -d --no-build --scale api=3
```

#### Runner management — Debian

```bash
sudo ./svc.sh status
sudo ./svc.sh start
sudo ./svc.sh stop
```

Run these from the runner installation directory.

#### Check containers

```bash
docker ps
docker compose -f compose.yaml -f compose.prod.yaml ps
```

#### Check disk usage

```bash
docker system df
```

#### Remove unused Docker resources

```bash
docker system prune -a
```

This removes unused Docker resources but does not remove volumes by default. Avoid deleting volumes containing important database data.

## Final Interview-Ready Summary

CI/CD automates the process of validating, building, publishing, and deploying software.

In our setup, developers write and test code locally using Docker Compose. When code is pushed to GitHub, GitHub Actions runs CI checks, builds a Docker image, and publishes it to GitHub Container Registry.

After CI succeeds, a deployment job is assigned to a self-hosted GitHub Actions runner on the Debian server. The runner executes a predefined deployment script that pulls the published image and updates the running application using Docker Compose.

Nginx routes incoming traffic to three Node.js API replicas, while PostgreSQL uses a persistent Docker volume.

The setup demonstrates an automated deployment pipeline, although production systems additionally require immutable releases, health verification, rollback, secure runner isolation, and monitoring.

## Key Takeaways

1. CI validates and builds; CD delivers and deploys.
2. A Git push triggers image publishing through CI.
3. GHCR stores images; it does not run containers.
4. Development can build locally while production pulls published images.
5. A self-hosted runner executes GitHub Actions jobs on our own infrastructure.
6. systemd keeps the runner running in the background.
7. Linux permissions and ACLs control ordinary filesystem access.
8. Docker group membership effectively grants root-level privileges.
9. A deployment script centralizes release commands.
10. A successful deployment command is not the same as a verified healthy release.

Marathon Progress:

> Topics 43–45 completed.
>
> Next: Topic 46/53 — Kubernetes Fundamentals.
