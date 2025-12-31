// run-seed.js
"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databaseFilePath = path.join(__dirname, "company-structure.db");
const seedFilePath = path.join(__dirname, "db", "seed.sql");

const seedSql = fs.readFileSync(seedFilePath, "utf-8");

console.log("Applying seed data from:", seedFilePath);
console.log("Target database:", databaseFilePath);

const db = new sqlite3.Database(
  databaseFilePath,
  sqlite3.OPEN_READWRITE, // require DB to exist
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
      console.error("Hint: run `npm run db:schema` first to create the database.");
      process.exit(1);
    }
  }
);

db.serialize(() => {
  db.exec(seedSql, (err) => {
    if (err) {
      console.error("Error applying seed data:", err.message);
      db.close();
      process.exit(1);
    }

    console.log("Seed data inserted successfully ✅");

    db.close((closeErr) => {
      if (closeErr) {
        console.error("Error closing database:", closeErr.message);
        process.exit(1);
      }
      console.log("Database closed.");
    });
  });
});
