// src/services/validationService.js
"use strict";

/**
 * Simple helpers for re-use
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

function isOptionalDateString(value) {
    if (value === null || value === undefined || value === "") return true;
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Validate registration payload
 */
function validateRegistrationData(body) {
    const errors = [];

    if (!isNonEmptyString(body.email)) {
        errors.push("Email is required.");
    }

    if (!isNonEmptyString(body.password) || body.password.length < 6) {
        errors.push("Password is required and must be at least 6 characters.");
    }

    if (!isNonEmptyString(body.displayName)) {
        errors.push("Display name is required.");
    }

    return errors;
}

/**
 * Validate login payload
 */
function validateLoginData(body) {
    const errors = [];

    if (!isNonEmptyString(body.email)) {
        errors.push("Email is required.");
    }
    if (!isNonEmptyString(body.password)) {
        errors.push("Password is required.");
    }

    return errors;
}

/**
 * Validate company payload (create/update)
 * Expected fields: name, nip, krs?, founded_at?, company_type_id, share_capital, last_valuation?
 */
function validateCompanyData(body) {
    const errors = [];

    if (!isNonEmptyString(body.name)) {
        errors.push("Company name is required.");
    }

    if (!body.nip || !String(body.nip).trim()) {
        errors.push("NIP is required.");
    } else if (!/^[0-9]+$/.test(String(body.nip).trim())) {
        errors.push("NIP must contain digits 0–9 only.");
    }

    if (body.krs && !/^[0-9]+$/.test(String(body.krs).trim())) {
        errors.push("KRS must contain digits 0–9 only.");
    }


    if (!isOptionalDateString(body.founded_at)) {
        errors.push("founded_at must be in YYYY-MM-DD format if provided.");
    }

    const companyTypeId = Number(body.company_type_id);
    if (!Number.isInteger(companyTypeId) || companyTypeId <= 0) {
        errors.push("company_type_id must be a positive integer.");
    }

    const shareCapital = Number(body.share_capital);
    if (!Number.isFinite(shareCapital) || shareCapital <= 0) {
        errors.push("share_capital must be a positive number.");
    }

    if (body.last_valuation !== undefined && body.last_valuation !== null) {
        const lastValuation = Number(body.last_valuation);
        if (!Number.isFinite(lastValuation) || lastValuation < 0) {
            errors.push("last_valuation must be a non-negative number if provided.");
        }
    }

    return errors;
}

/**
 * Validate shareholder payload
 */
function validateShareholderData(body) {
    const errors = [];

    if (!isNonEmptyString(body.name)) {
        errors.push("Shareholder name is required.");
    }

    if (!isNonEmptyString(body.last_name)) {
        errors.push("Shareholder last name is required.");
    }

    if (body.identifier && !/^[0-9]+$/.test(body.identifier)) {
        errors.push("Identifier must contain digits 0–9 only.");
    }

    // identifier is optional, notes are optional
    return errors;
}

/**
 * Validate shareholding payload
 * Expected: company_id, shareholder_id, shares_owned, acquired_at?, source?
 */
function validateShareholdingData(body) {
    const errors = [];

    const companyId = Number(body.company_id);
    const shareholderId = Number(body.shareholder_id);
    const sharesOwned = Number(body.shares_owned);

    if (!Number.isInteger(companyId) || companyId <= 0) {
        errors.push("company_id must be a positive integer.");
    }

    if (!Number.isInteger(shareholderId) || shareholderId <= 0) {
        errors.push("shareholder_id must be a positive integer.");
    }

    if (!Number.isInteger(sharesOwned) || sharesOwned <= 0) {
        errors.push("shares_owned must be a positive integer.");
    }

    if (!isOptionalDateString(body.acquired_at)) {
        errors.push("acquired_at must be in YYYY-MM-DD format if provided.");
    }

    return errors;
}

module.exports = {
    validateRegistrationData,
    validateLoginData,
    validateCompanyData,
    validateShareholderData,
    validateShareholdingData,
};
