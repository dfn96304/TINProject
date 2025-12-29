// src/routes/authRoutes.js
"use strict";

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const {
    authenticateRequired,
} = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticateRequired, authController.getCurrentUser);

module.exports = router;
