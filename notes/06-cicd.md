## Topic:

## Topic 42 — CI/CD Fundamentals with GitHub Actions

### 1. What Is CI/CD?

CI = Continuous Integration
CD = Continuous Delivery / Continuous Deployment

CI automatically validates, tests, and builds code changes.

Continuous Delivery keeps validated software ready for release, possibly requiring manual approval.

Continuous Deployment automatically releases validated changes to production.

Why CI/CD?

- Reduces manual deployment work.
- Detects problems before deployment.
- Makes builds repeatable.
- Reduces human errors.
- Helps teams release changes frequently.

### 2. Basic CI/CD Architecture

```text
Developer (Linux Mint)
        |
        | git push
        v
GitHub Repository
        |
        | Triggers workflow
        v
GitHub Actions Runner
        |
        | Checkout code
        | Install dependencies
        | Run checks/tests
        | Build Docker image
        v
CI Success
        |
        v
CD Pipeline
        |
        | Publish image
        | Deploy application
        v
Debian Production Server
```

Important:

> The GitHub-hosted runner is a separate machine. It is not our Linux Mint laptop or Debian VM.

### 3. GitHub Actions Fundamentals

GitHub Actions is GitHub's workflow automation platform.

- **Workflow:** An automated process defined in YAML.
- **Event:** An activity that triggers a workflow, such as `push` or `pull_request`.
- **Job:** A group of steps executed on a runner.
- **Step:** An individual command or reusable action.
- **Runner:** The machine that executes the workflow.
- **Action:** A reusable component for common tasks.

Workflow location:

```text
.github/workflows/ci.yml
```

### 4. Our First CI Workflow

```yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '24'

      - name: Install dependencies
        working-directory: ./app
        run: npm ci

      - name: Check JavaScript syntax
        working-directory: ./app
        run: node --check server.js

      - name: Build Docker image
        run: docker build -t marathon-api:ci ./app
```

### 5. Understanding the Workflow

- `on`: Defines which events trigger the workflow.
- `push`: Runs when code is pushed to `main`.
- `pull_request`: Runs when a pull request targets `main`.
- `jobs`: Defines the workflow's jobs.
- `runs-on: ubuntu-latest`: GitHub provides a temporary Ubuntu runner.
- `actions/checkout@v4`: Downloads repository code into the runner's workspace.
- `actions/setup-node@v4`: Installs and configures Node.js 24.
- `npm ci`: Installs dependencies from `package-lock.json`.
- `node --check server.js`: Validates JavaScript syntax without executing the application.
- `docker build`: Builds the application image to verify that its Dockerfile works.

Important:

> This first workflow builds an image but does not publish or deploy it.

### 6. What Happens When CI Fails?

```text
Developer pushes invalid JavaScript
        |
        v
GitHub Actions starts
        |
        v
Syntax check fails
        |
        v
CI job fails
        |
        v
Deployment must not proceed
```

Key principle:

> A failed CI pipeline should block dependent deployment jobs.

CI checks alone do not automatically prevent merging. Branch protection rules are needed to require passing checks.

### 7. GitHub-hosted vs Self-hosted Runners

GitHub-hosted runner:

- Managed by GitHub.
- Temporary environment.
- Suitable for building and testing.
- Cannot directly access our private Debian VM through Mint's localhost address.

Self-hosted runner:

- Managed by us.
- Runs on our own machine.
- Can access local resources according to its permissions.
- Requires maintenance and stronger security controls.

We use GitHub-hosted runners for CI and a Debian self-hosted runner for deployment.

### 8. CI/CD in Real Companies

Typical workflow:

1. Developer creates a feature branch.
2. Developer opens a pull request.
3. CI runs tests and builds.
4. The team reviews the code.
5. Changes merge into `main`.
6. CI publishes a versioned artifact.
7. CD deploys to staging.
8. Automated checks or approvals validate the release.
9. CD deploys to production.
10. Monitoring verifies application health.

Not every company uses exactly this workflow.

### 9. Key Takeaways

- CI validates and builds code automatically.
- CD handles preparing or releasing software.
- GitHub Actions automates workflows using YAML.
- Events trigger workflows.
- Jobs contain steps.
- Runners execute jobs.
- GitHub-hosted runners are separate machines.
- CI failures should prevent dependent deployments.
- Building an image is different from publishing or deploying it.

Next:

> Topic 43 — CI Pipeline
>
> Topic 44 — Publishing Docker Images to GHCR
>
> Topic 45 — Automated Deployment to Debian

## Topic 44 — GitHub Actions CI & GHCR

### 1. What Is CI/CD?

**CI = Continuous Integration**

Automatically validates and builds code whenever developers push changes.

**CD = Continuous Delivery / Continuous Deployment**

Continuous Delivery keeps changes ready for release, potentially with manual approval.

Continuous Deployment automatically releases validated changes without manual approval.

Our lab uses automatic deployment after successful CI on `main`.

### 2. GitHub Actions Components

- **Workflow:** Automation defined using YAML.
- **Event:** Something that triggers a workflow, such as `push` or `pull_request`.
- **Job:** A collection of steps executed on a runner.
- **Step:** A command or reusable action within a job.
- **Runner:** A machine that executes workflow jobs.
- **Action:** A reusable automation component.
- **Secret:** Sensitive configuration provided securely to authorized workflows.
- **Artifact:** Output generated during CI, such as a Docker image.

Workflow location:

```text
.github/workflows/ci.yml
```

### 3. Our CI Workflow

```text
Push to GitHub
    ↓
GitHub Actions
    ↓
Checkout repository
    ↓
Set up Node.js 24
    ↓
npm ci
    ↓
node --check server.js
    ↓
Build Docker image
    ↓
Authenticate to GHCR
    ↓
Publish Docker image
```

Important commands:

`npm ci`

- Installs dependencies using `package-lock.json`.
- Is designed for reproducible CI installation.

`node --check server.js`

- Checks JavaScript syntax.
- Does **not** replace unit or integration tests.

`docker build`

- Builds a Docker image from the Dockerfile.

### 4. GitHub Container Registry (GHCR)

A container registry stores and distributes Docker images.

Our registry image:

```text
ghcr.io/mrakib007/docker-to-kubernetes-marathon
```

We publish two tags:

```text
:latest
:<git-commit-sha>
```

- `latest`: A mutable tag pointing to the most recently published image under that tag.
- Commit SHA: Identifies the image associated with a specific Git commit.
- Image digest: A content-based identifier such as `sha256:...`.

Production best practice:

> Deploy an immutable image digest or release reference instead of relying on `latest`.

### 5. GitHub Actions Permissions

```yaml
permissions:
  contents: read
  packages: write
```

- `contents: read`: Allows the workflow to read repository contents.
- `packages: write`: Allows publishing Docker images to GHCR.

Registry authentication:

```yaml
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}
```

`GITHUB_TOKEN` is a temporary token provided by GitHub Actions with workflow-scoped permissions.

### 6. Local Images vs GHCR Images

Local development:

```bash
docker compose up -d --build
```

This rebuilds the local Docker image.

Publishing:

```bash
git push origin main
```

This triggers GitHub Actions, which independently builds and publishes the image.

Production:

```bash
docker compose pull
docker compose up -d
```

This downloads and applies the published image.

Remember:

> Git push does not directly upload your local Docker image.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
