const http = require("node:http");

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.end(JSON.stringify({ message: "Hello from Dockerized Node.js!" }));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server listening on port 3000");
});
