## Production Deployment Workflow

1. Develop and test the application on a laptop.
2. Commit and push source code to GitHub.
3. Connect to the server using SSH.
4. Clone the repository for the first deployment or run `git pull` for updates.
5. Configure environment variables and secrets on the server.
6. Build the application image using Docker Compose.
7. Start the API, PostgreSQL, and Nginx containers.
8. Verify container status, logs, health, and application responses.
9. Configure the firewall, TLS, DNS, and public routing as needed.
10. For later releases, repeat the build, deployment, and verification steps; CI/CD automates this process.

### Lab Services

- Nginx: Public-facing reverse proxy and TLS termination.
- Node.js API: Application logic on port 3000.
- PostgreSQL: Database on port 5432.
- `pgdata`: Persistent Docker named volume.

### Commands

```bash
git pull origin main
docker compose up -d --build
docker compose ps
docker compose logs --tail=50
```

Production deployments additionally need backups, credential management, monitoring, rollback plans, and secure image distribution.
