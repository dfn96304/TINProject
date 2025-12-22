// src/controllers/authController.js
"use strict";

const { get, run } = require("../db");
const {
  validateRegistrationData,
  validateLoginData,
} = require("../services/validationService");
const { generateToken } = require("../middleware/authMiddleware");

// Helper to map a DB row to a user object for the API / JWT
function mapUserRowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    roleCode: row.role_code,
  };
}

// POST /api/auth/register
// Body: { email, password, displayName }
async function register(req, res, next) {
  try {
    const errors = validateRegistrationData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { email, password, displayName } = req.body;

    const existing = await get("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing) {
      return res
        .status(409)
        .json({ error: "A user with this email already exists." });
    }

    // Default role for new users: VIEWER
    const viewerRole = await get(
      "SELECT id, code FROM roles WHERE code = 'VIEWER'"
    );
    if (!viewerRole) {
      return res
        .status(500)
        .json({ error: "Default role VIEWER not found in database." });
    }

    const createdAt = new Date().toISOString();

    const result = await run(
      `
      INSERT INTO users (email, password_hash, display_name, role_id, is_active, created_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `,
      [email, password, displayName, viewerRole.id, createdAt]
    );

    const user = {
      id: result.lastID,
      email,
      displayName,
      roleCode: viewerRole.code,
    };

    const token = generateToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
// Body: { email, password }
async function login(req, res, next) {
  try {
    const errors = validateLoginData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { email, password } = req.body;

    const row = await get(
      `
      SELECT u.id,
             u.email,
             u.password_hash,
             u.display_name,
             r.code AS role_code
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.is_active = 1
    `,
      [email]
    );

    if (!row || row.password_hash !== password) {
      // For simplicity we use plain-text passwords in the DB for now.
      // In a real app you'd use bcrypt here.
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = mapUserRowToUser(row);
    const token = generateToken(user);

    return res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
// Requires authenticateRequired; returns current user info from the token
async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    return res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
