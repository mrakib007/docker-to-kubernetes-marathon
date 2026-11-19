const http = require("node:http");
const { Pool } = require("pg");
const os = require("node:os")

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.url === "/users") {
    try {
      const result = await pool.query("SELECT * FROM users ORDER BY id");

      // res.end(JSON.stringify({ users: result.rows }));
      res.end(JSON.stringify({
        instance: os.hostname(),
        users: result.rows
      }));
    } catch (error) {
      console.error("Database query failed:", error.message);

      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Database query failed" }));
    }
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server listening on port 3000");
});
