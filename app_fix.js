// secure-app.js
const express = require("express");
const app = express();
const mysql = require("mysql2");
const { execFile } = require("child_process");
const escapeHtml = require("escape-html");

app.use(express.json());

// Use environment variables instead of hardcoding
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect();

// ✅ Prevent SQL Injection using parameterized queries
app.get("/user", (req, res) => {
  const username = req.query.username;

  const query = "SELECT * FROM users WHERE username = ?";
  db.execute(query, [username], (err, result) => {
    if (err) return res.status(500).send("Database error");
    res.send(result);
  });
});

// ✅ Prevent Command Injection
app.get("/ping", (req, res) => {
  const host = req.query.host;

  // Validate input (basic allowlist example)
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send("Invalid host");
  }

  execFile("ping", ["-c", "1", host], (err, stdout) => {
    if (err) return res.send(err.message);
    res.send(stdout);
  });
});

// ✅ Prevent XSS
app.get("/welcome", (req, res) => {
  const name = escapeHtml(req.query.name);
  res.send(`<h1>Welcome ${name}</h1>`);
});

app.listen(3000, () => console.log("Secure server running on port 3000"));