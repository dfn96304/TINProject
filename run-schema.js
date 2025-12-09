// run-schema.js
"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databaseFilePath = path.join(__dirname, "company-structure.db");
const schemaFilePath = path.join(__dirname, "db", "schema.sql");

const schemaSql = fs.readFileSync(schemaFilePath, "utf-8");

console.log("Applying schema from:", schemaFilePath);
console.log("Target database:", databaseFilePath);

const db = new sqlite3.Database(
  databaseFilePath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
      process.exit(1);
    }
  }
);

db.serialize(() => {
  db.exec(schemaSql, (err) => {
    if (err) {
      console.error("Error applying schema:", err.message);
      db.close();
      process.exit(1);
    }

    console.log("Schema applied successfully ✅");

    db.close((closeErr) => {
      if (closeErr) {
        console.error("Error closing database:", closeErr.message);
        process.exit(1);
      }
      console.log("Database closed.");
    });
  });
});
