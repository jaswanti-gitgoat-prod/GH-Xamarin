/**
 * Intentionally vulnerable Node sample for Arnica SAST + Secret detection.
 * DO NOT deploy. Secrets below are fake canary values.
 */
const express = require("express");
const { exec } = require("child_process");
const mysql = require("mysql");

const app = express();

// SECRET: hardcoded cloud + API credentials (fake)
const config = {
  awsAccessKeyId: "AKIAIOSFODNN7EXAMPLE",
  awsSecretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  githubPat: "ghp_exampleFakeTokenForArnicaSecretScan1234567890",
  dbPassword: "RootPassword!2024",
  sendgridApiKey: "SG.eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.ffffffffffffffffffffffffffffffffffffffff"
};

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: config.dbPassword,
  database: "users"
});

app.get("/user", (req, res) => {
  // SAST: SQL injection
  const q = "SELECT * FROM users WHERE id = " + req.query.id;
  connection.query(q, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});

app.get("/ping", (req, res) => {
  // SAST: command injection
  exec("ping -c 1 " + req.query.host, (error, stdout) => {
    res.send(stdout || String(error));
  });
});

app.get("/greet", (req, res) => {
  // SAST: XSS via unescaped output
  res.send("<h1>Hello " + req.query.name + "</h1>");
});

app.listen(3000, () => {
  console.log("insecure demo listening on 3000");
});
