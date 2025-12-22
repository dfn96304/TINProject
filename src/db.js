// src/db.js
"use strict";

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Path to the SQLite database file (one level up from src/)
const DB_PATH = path.join(__dirname, "..", "company-structure.db");

// Create a single shared database connection
const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Failed to open SQLite database:", err.message);
      console.error(
        "Hint: Did you run `node run-schema.js` to create the schema?"
      );
      process.exit(1);
    } else {
      console.log("Connected to SQLite database at:", DB_PATH);
    }
  }
);

// Enforce foreign key constraints
db.exec("PRAGMA foreign_keys = ON;", (err) => {
  if (err) {
    console.error("Failed to enable foreign key support:", err.message);
  }
});

// Small promise-based helpers

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  db,  // raw connection if you ever need it
  run,
  get,
  all,
};
