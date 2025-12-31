// src/db.js
"use strict";

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Path to the SQLite database file (one level up from src/)
const DB_PATH = path.join(__dirname, "..", "company-structure.db");

const REQUIRED_TABLES = [
    "company_types",
    "roles",
    "users",
    "companies",
    "shareholders",
    "shareholdings",
];

// Create a single shared database connection
// If schema hasn't been run yet, fail fast with a helpful message.
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Failed to open SQLite database:", err.message);
        console.error(
            "\nThe database file is missing or not readable. " +
            "Run `npm run db:schema` (or `node run-schema.js`) to create it, " +
            "then start the server again.\n"
        );
        process.exit(1);
    }
});

function checkSchema() {
    const placeholders = REQUIRED_TABLES.map(() => "?").join(",");
    const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`;

    return new Promise((resolve, reject) => {
        db.all(sql, REQUIRED_TABLES, (err, rows) => {
            if (err) return reject(err);

            const present = new Set(rows.map((r) => r.name));
            const missing = REQUIRED_TABLES.filter((t) => !present.has(t));

            if (missing.length) {
                const error = new Error(
                    "Database schema is missing required tables: " +
                    missing.join(", ") +
                    "\n\nFix: run `npm run db:schema` (or `node run-schema.js`) and restart.\n"
                );
                error.code = "DB_SCHEMA_MISSING";
                return reject(error);
            }

            resolve();
        });
    });
}

// Ready promise
const ready = new Promise((resolve, reject) => {
    db.exec("PRAGMA foreign_keys = ON;", (err) => {
        if (err) {
            console.warn("Failed to enable foreign key support:", err.message);
            // not fatal
        }

        checkSchema()
            .then(() => {
                console.log("Connected to SQLite database at:", DB_PATH);
                resolve();
            })
            .catch((schemaErr) => {
                console.error("\n" + schemaErr.message);
                reject(schemaErr);
            });
    });
});

// Promise helpers
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
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

module.exports = { db, ready, run, get, all };
