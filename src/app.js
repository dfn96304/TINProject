// src/app.js
"use strict";

const path = require("path");
const express = require("express");
const cors = require("cors");

// Ensure DB is initialised (opens connection and PRAGMA foreign_keys)
require("./db");

const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const shareholderRoutes = require("./routes/shareholderRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Static frontend (SPA lives in public/index.html)
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Simple health check
app.get("/api/health", (req, res) => {
    res.json({status: "ok"});
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/shareholders", shareholderRoutes);

// 404 handler for /api routes (static file 404s are handled by express.static)
app.use("/api", (req, res, next) => {
    res.status(404).json({error: "API endpoint not found"});
});

// Global error handler
// (Controllers can call next(err) to end up here)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);

    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || 500;
    const message =
        err.message || "Unexpected error occurred. Please try again later.";

    res.status(status).json({error: message});
});

module.exports = app;
