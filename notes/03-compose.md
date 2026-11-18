## Topic:

## Docker Compose Basics

- Docker Compose manages containers using a YAML configuration file.
- It uses Docker, not a separate container runtime.
- `compose.yaml` defines services, images, commands, networks, and volumes.
- A service is a definition for running one or more containers.
- `docker compose up` → Creates and starts services.
- `docker compose down` → Stops and removes Compose-managed containers and networks.
- Named volumes are preserved by default when using `docker compose down`.

## Compose Lifecycle

- Compose automatically creates a default network.
- Compose service names are used to identify services.
- `docker compose up` → Creates and starts services.
- `docker compose ps -a` → Shows service containers, including exited ones.
- `docker compose down` → Removes service containers and Compose networks.
- A container stops when its main process exits.
- Exit code 0 means the process completed successfully.
- `docker compose down` preserves named volumes unless `-v` is specified.

## Multiple Services with Docker Compose

- We built `marathon-api:v1` from our Node.js `server.js` and Dockerfile.
- Dockerfile defines how an image is built.
- Compose defines how containers are configured and run.
- `image: marathon-api:v1` reuses our existing custom image.
- Compose automatically creates a default bridge network.
- Services on that network can communicate using service names.
- `DB_HOST=db` resolves to the PostgreSQL service through Docker DNS.
- `localhost` inside a container refers to that same container.
- `ports: "3000:3000"` publishes the API port to the host.
- PostgreSQL does not need a published port for API-to-DB communication.
- Named volumes keep database files independent of containers.

## Compose Networking

- Compose creates a default bridge network automatically.
- Containers on the same Compose network communicate using service names.
- `DB_HOST=db` identifies the PostgreSQL service.
- Docker DNS resolves `db` to the PostgreSQL container's IP.
- `localhost` refers to the current container's own network namespace.
- `localhost` does not resolve to other containers.
- The API uses `db:5432` to connect to PostgreSQL.
- The host uses `localhost:3000` to reach the published API.
- Environment variables must be used by application code.

## API and Database Separation

- Keep the API and database in separate containers.
- The API connects to PostgreSQL using `db:5432` on the Compose network.
- `localhost` refers to the current container's network namespace.
- Separate containers allow independent scaling, updates, and failures.
- Database persistence is handled by a named volume.
- Environment variables configure the DB address; application code makes the actual connection.

## Topic 18 — API to PostgreSQL

- Browser sends HTTP requests to the Node.js API.
- Node.js uses the `pg` library to communicate with PostgreSQL.
- API connects using `db:5432` over the Compose network.
- PostgreSQL executes SQL and returns rows to the API.
- API converts query results into an HTTP JSON response.
- Updating application code requires rebuilding the Docker image unless the source is bind-mounted for development.

## Node.js Dependencies in Docker

- `package.json` declares application dependencies.
- `package-lock.json` records resolved dependency versions.
- `COPY package*.json ./` copies both files into the image.
- `RUN npm ci --omit=dev` installs production dependencies.
- Installing packages on the host does not install them in an image.
- Copy dependency files before source code to improve Docker layer caching.

## Compose Database Access

- `docker compose exec SERVICE COMMAND` runs a command in a running service container.
- `docker compose exec db psql ...` opens PostgreSQL inside the `db` service.
- Compose uses its own named volume for PostgreSQL data.
- Different volumes contain independent database files.
- API queries require the target database table to exist.

## Node.js to PostgreSQL

- `pg` is a PostgreSQL client library for Node.js.
- `Pool` manages reusable database connections.
- `process.env` reads runtime configuration.
- `pool.query` executes SQL and returns `result.rows`.
- The API connects to `db:5432` through Compose networking.
- `try/catch` handles database query failures.
- `node --check` validates JavaScript syntax.
- `docker compose config --quiet` validates Compose configuration.

### What is it?

### Why do we need it?

### Important commands
```bash
# Command — what it does
```

### What I tested

### Errors and fixes

### Interview takeaway
