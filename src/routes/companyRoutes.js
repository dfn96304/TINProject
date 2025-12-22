// src/routes/companyRoutes.js
"use strict";

const express = require("express");
const router = express.Router();

const companyController = require("../controllers/companyController");
const {
  authenticateOptional,
  authenticateRequired,
} = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Public / semi-public list + detail (auth optional)
router.get("/", authenticateOptional, companyController.listCompanies);
router.get(
  "/types",
  authenticateOptional,
  companyController.listCompanyTypes
);
router.get("/:id", authenticateOptional, companyController.getCompanyById);

// Mutations: require authenticated ANALYST + resource-level checks inside controller
router.post(
  "/",
  authenticateRequired,
  requireRole("ANALYST"),
  companyController.createCompany
);

router.put(
  "/:id",
  authenticateRequired,
  requireRole("ANALYST"),
  companyController.updateCompany
);

router.delete(
  "/:id",
  authenticateRequired,
  requireRole("ANALYST"),
  companyController.deleteCompany
);

module.exports = router;
