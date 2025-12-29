// src/middleware/authMiddleware.js
"use strict";

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const AUTH_HEADER_PREFIX = "Bearer ";

// Create a JWT for a user object: { id, email, displayName, roleCode }
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roleCode: user.roleCode,
    };

    return jwt.sign(payload, JWT_SECRET, {expiresIn: "8h"});
}

// Middleware: attach req.user if token is valid; otherwise leave it undefined
function authenticateOptional(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith(AUTH_HEADER_PREFIX)) {
        req.user = undefined;
        return next();
    }

    const token = authHeader.slice(AUTH_HEADER_PREFIX.length);

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.warn("Invalid or expired token:", err.message);
            req.user = undefined;
            return next();
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            displayName: decoded.displayName,
            roleCode: decoded.roleCode,
        };

        next();
    });
}

// Middleware: require a valid token; otherwise 401
function authenticateRequired(req, res, next) {
    authenticateOptional(req, res, () => {
        if (!req.user) {
            return res.status(401).json({error: "Authentication required."});
        }
        next();
    });
}

module.exports = {
    generateToken,
    authenticateOptional,
    authenticateRequired,
};
