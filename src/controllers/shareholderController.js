// src/controllers/shareholderController.js
"use strict";

const {get, all, run} = require("../db");
const {
    validateShareholderData,
    validateShareholdingData,
} = require("../services/validationService");
const {canUserEditCompany} = require("./companyController");

// GET /api/shareholders?page=&limit=
async function listShareholders(req, res, next) {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Math.min(Math.max(limitRaw || 10, 1), 100);
        const offset = (page - 1) * limit;

        const countRow = await get(
            "SELECT COUNT(*) AS total FROM shareholders",
            []
        );
        const totalItems = countRow ? countRow.total : 0;
        const totalPages = Math.ceil(totalItems / limit) || 1;

        const rows = await all(
            `
                SELECT id, name, last_name, identifier, notes
                FROM shareholders
                ORDER BY name LIMIT ?
                OFFSET ?
            `,
            [limit, offset]
        );

        return res.json({
            items: rows,
            page,
            limit,
            totalItems,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/shareholders/:id
// Includes their shareholdings (joined with companies)
async function getShareholderById(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid shareholder id."});
        }

        const shareholder = await get(
            `
                SELECT id, name, last_name, identifier, notes
                FROM shareholders
                WHERE id = ?
            `,
            [id]
        );

        if (!shareholder) {
            return res.status(404).json({error: "Shareholder not found."});
        }

        const user = req.user || null;
        const isGuest = !user || user.roleCode === "GUEST";

        const whereRestricted = isGuest ? "AND c.is_restricted = 0" : "";

        const holdings = await all(
            `
                SELECT sh.id,
                       sh.shares_owned,
                       sh.acquired_at,
                       sh.source,
                       c.id   AS company_id,
                       c.name AS company_name,
                       c.nip  AS company_nip
                FROM shareholdings sh
                         JOIN companies c ON sh.company_id = c.id
                WHERE sh.shareholder_id = ? ${whereRestricted}
                ORDER BY c.name
            `,
            [id]
        );

        return res.json({shareholder, shareholdings: holdings});
    } catch (err) {
        next(err);
    }
}

// POST /api/shareholders   (ANALYST)
async function createShareholder(req, res, next) {
    try {
        const errors = validateShareholderData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        const {name, last_name, identifier, notes} = req.body;

        const result = await run(
            `
                INSERT INTO shareholders (name, last_name, identifier, notes)
                VALUES (?, ?, ?, ?)
            `,
            [name, last_name, identifier || null, notes || null]
        );

        const created = await get(
            `
                SELECT id, name, last_name, identifier, notes
                FROM shareholders
                WHERE id = ?
            `,
            [result.lastID]
        );

        return res.status(201).json({shareholder: created});
    } catch (err) {
        next(err);
    }
}

// PUT /api/shareholders/:id   (ANALYST)
async function updateShareholder(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid shareholder id."});
        }

        const existing = await get(
            "SELECT id FROM shareholders WHERE id = ?",
            [id]
        );
        if (!existing) {
            return res.status(404).json({error: "Shareholder not found."});
        }

        const errors = validateShareholderData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        const {name, last_name, identifier, notes} = req.body;

        await run(
            `
                UPDATE shareholders
                SET name = ?,
                    last_name = ?,
                    identifier = ?,
                    notes = ?
                WHERE id = ?
            `,
            [name, last_name, identifier || null, notes || null, id]
        );

        const updated = await get(
            `
                SELECT id, name, last_name, identifier, notes
                FROM shareholders
                WHERE id = ?
            `,
            [id]
        );

        return res.json({shareholder: updated});
    } catch (err) {
        next(err);
    }
}

// DELETE /api/shareholders/:id   (ANALYST)
async function deleteShareholder(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid shareholder id."});
        }

        const existing = await get(
            "SELECT id FROM shareholders WHERE id = ?",
            [id]
        );
        if (!existing) {
            return res.status(404).json({error: "Shareholder not found."});
        }

        await run("DELETE FROM shareholders WHERE id = ?", [id]);

        return res.json({success: true});
    } catch (err) {
        next(err);
    }
}

// Helper for shareholdings modification
async function ensureUserCanEditCompanyId(user, companyId) {
    const company = await get("SELECT * FROM companies WHERE id = ?", [
        companyId,
    ]);
    if (!company) {
        const error = new Error("Company not found.");
        error.status = 404;
        throw error;
    }

    if (!canUserEditCompany(user, company)) {
        const error = new Error("You are not allowed to modify this company.");
        error.status = 403;
        throw error;
    }

    return company;
}

// POST /api/shareholders/shareholdings   (ANALYST + owns company)
async function createShareholding(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({error: "Authentication required."});
        }

        const errors = validateShareholdingData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        const companyId = Number(req.body.company_id);
        await ensureUserCanEditCompanyId(user, companyId);

        const {shareholder_id, shares_owned, acquired_at, source} = req.body;

        const result = await run(
            `
                INSERT INTO shareholdings (company_id, shareholder_id, shares_owned, acquired_at, source)
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                companyId,
                Number(shareholder_id),
                Number(shares_owned),
                acquired_at || null,
                source || null,
            ]
        );

        const created = await get(
            `
                SELECT *
                FROM shareholdings
                WHERE id = ?
            `,
            [result.lastID]
        );

        return res.status(201).json({shareholding: created});
    } catch (err) {
        next(err);
    }
}

// PUT /api/shareholders/shareholdings/:id
async function updateShareholding(req, res, next) {
    try {
        const user = req.user;
        const id = Number(req.params.id);

        if (!user) {
            return res.status(401).json({error: "Authentication required."});
        }

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid shareholding id."});
        }

        const existing = await get(
            "SELECT * FROM shareholdings WHERE id = ?",
            [id]
        );
        if (!existing) {
            return res.status(404).json({error: "Shareholding not found."});
        }

        await ensureUserCanEditCompanyId(user, existing.company_id);

        const errors = validateShareholdingData({
            ...existing,
            ...req.body,
            company_id: existing.company_id,
        });
        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        const sharesOwned =
            req.body.shares_owned !== undefined
                ? Number(req.body.shares_owned)
                : existing.shares_owned;
        const acquiredAt =
            req.body.acquired_at !== undefined
                ? req.body.acquired_at || null
                : existing.acquired_at;
        const source =
            req.body.source !== undefined ? req.body.source || null : existing.source;

        await run(
            `
                UPDATE shareholdings
                SET shares_owned = ?,
                    acquired_at = ?,
                    source = ?
                WHERE id = ?
            `,
            [sharesOwned, acquiredAt, source, id]
        );

        const updated = await get(
            `
                SELECT *
                FROM shareholdings
                WHERE id = ?
            `,
            [id]
        );

        return res.json({shareholding: updated});
    } catch (err) {
        next(err);
    }
}

// DELETE /api/shareholders/shareholdings/:id
async function deleteShareholding(req, res, next) {
    try {
        const user = req.user;
        const id = Number(req.params.id);

        if (!user) {
            return res.status(401).json({error: "Authentication required."});
        }

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid shareholding id."});
        }

        const existing = await get(
            "SELECT * FROM shareholdings WHERE id = ?",
            [id]
        );
        if (!existing) {
            return res.status(404).json({error: "Shareholding not found."});
        }

        await ensureUserCanEditCompanyId(user, existing.company_id);

        await run("DELETE FROM shareholdings WHERE id = ?", [id]);

        return res.json({success: true});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listShareholders,
    getShareholderById,
    createShareholder,
    updateShareholder,
    deleteShareholder,
    createShareholding,
    updateShareholding,
    deleteShareholding,
};
