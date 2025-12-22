// src/routes/index.js
"use strict";

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const shareholderRoutes = require("./shareholderRoutes");

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/shareholders", shareholderRoutes);

module.exports = router;
