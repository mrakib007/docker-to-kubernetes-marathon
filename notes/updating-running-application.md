## Updating a Running Application

### Manual Deployment

1. Modify code on Linux Mint.
2. Commit and push to GitHub.
3. SSH into Debian.
4. Pull the latest code.
5. Rebuild and replace the API container.
6. Verify the new version.

### Commands

```bash
git pull origin main
docker compose up -d --build --no-deps api
docker compose ps
```

### Important

- Code changes normally require an image rebuild.
- Container replacement does not delete named volumes.
- A single API instance may cause temporary downtime.
- Users may receive 502 during replacement.
- Multiple replicas improve availability.
- Docker Compose does not guarantee rolling deployments.

### Preserve Three API Replicas

```bash
docker compose up -d --no-build --scale api=3
```

CI/CD automates the manual deployment workflow.
