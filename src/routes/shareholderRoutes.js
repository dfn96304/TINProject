// src/routes/shareholderRoutes.js
"use strict";

const express = require("express");
const router = express.Router();

const shareholderController = require("../controllers/shareholderController");
const {
    authenticateOptional,
    authenticateRequired,
} = require("../middleware/authMiddleware");
const {requireRole} = require("../middleware/roleMiddleware");

// List + detail: auth optional (guests see less for restricted companies)
router.get(
    "/",
    authenticateOptional,
    shareholderController.listShareholders
);

router.get(
    "/:id",
    authenticateOptional,
    shareholderController.getShareholderById
);

// Shareholders CRUD: ANALYST only
router.post(
    "/",
    authenticateRequired,
    requireRole("ANALYST"),
    shareholderController.createShareholder
);

router.put(
    "/:id",
    authenticateRequired,
    requireRole("ANALYST"),
    shareholderController.updateShareholder
);

router.delete(
    "/:id",
    authenticateRequired,
    requireRole("ANALYST"),
    shareholderController.deleteShareholder
);

// Shareholdings CRUD (nested under /shareholders for simplicity)
router.post(
    "/shareholdings",
    authenticateRequired,
    requireRole("ANALYST"),
    shareholderController.createShareholding
);

router.put(
    "/shareholdings/:id",
    authenticateRequired,
    requireRole("ANALYST"),
    shareholderController.updateShareholding
);

router.delete(
    "/shareholdings/:id",
    authenticateRequired,
    requireRole("ANALYST"),
    shareholderController.deleteShareholding
);

module.exports = router;
