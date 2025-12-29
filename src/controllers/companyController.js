// src/controllers/companyController.js
"use strict";

const {get, all, run} = require("../db");
const {validateCompanyData} = require("../services/validationService");

// Helper: can this user edit this company?
function canUserEditCompany(user, company) {
    if (!user) return false;
    if (user.roleCode !== "ANALYST") return false;

    // Resource-level permission: analyst can only modify companies they created
    return company.created_by_user_id === user.id;
}

// GET /api/companies?page=&limit=
async function listCompanies(req, res, next) {
    try {
        const user = req.user || null;
        const isGuest = !user || user.roleCode === "GUEST";

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Math.min(Math.max(limitRaw || 10, 1), 100);
        const offset = (page - 1) * limit;

        const whereClauses = [];
        const params = [];

        // Guests cannot see restricted companies
        if (isGuest) {
            whereClauses.push("c.is_restricted = 0");
        }

        const whereSql =
            whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

        const countRow = await get(
            `SELECT COUNT(*) AS total
             FROM companies c ${whereSql}`,
            params
        );
        const totalItems = countRow ? countRow.total : 0;
        const totalPages = Math.ceil(totalItems / limit) || 1;

        const rows = await all(
            `
                SELECT c.*,
                       ct.label_pl AS company_type_label,
                       ct.code     AS company_type_code
                FROM companies c
                         JOIN company_types ct ON c.company_type_id = ct.id
                    ${whereSql}
                ORDER BY c.name
                    LIMIT ?
                OFFSET ?
            `,
            [...params, limit, offset]
        );

        let items;
        if (isGuest) {
            // Limited info for guests
            items = rows.map((row) => ({
                id: row.id,
                name: row.name,
                nip: row.nip,
                founded_at: row.founded_at,
                company_type_code: row.company_type_code,
                company_type_label: row.company_type_label,
            }));
        } else {
            // Full info for logged-in users
            items = rows.map((row) => ({
                id: row.id,
                name: row.name,
                nip: row.nip,
                krs: row.krs,
                founded_at: row.founded_at,
                company_type_code: row.company_type_code,
                company_type_label: row.company_type_label,
                share_capital: row.share_capital,
                last_valuation: row.last_valuation,
                created_by_user_id: row.created_by_user_id,
                is_restricted: !!row.is_restricted,
                notes: row.notes,
            }));
        }

        return res.json({
            items,
            page,
            limit,
            totalItems,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/companies/:id
async function getCompanyById(req, res, next) {
    try {
        const user = req.user || null;
        const isGuest = !user || user.roleCode === "GUEST";
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid company id."});
        }

        const companyRow = await get(
            `
                SELECT c.*,
                       ct.label_pl    AS company_type_label,
                       ct.code        AS company_type_code,
                       u.display_name AS created_by_name
                FROM companies c
                         JOIN company_types ct ON c.company_type_id = ct.id
                         LEFT JOIN users u ON c.created_by_user_id = u.id
                WHERE c.id = ?
            `,
            [id]
        );

        if (!companyRow) {
            return res.status(404).json({error: "Company not found."});
        }

        // Guests cannot see restricted companies at all
        if (isGuest && companyRow.is_restricted) {
            return res.status(404).json({error: "Company not found."});
        }

        // Load shareholdings + shareholders
        const shareholdings = await all(
            `
                SELECT sh.id,
                       sh.shares_owned,
                       sh.acquired_at,
                       sh.source,
                       s.id   AS shareholder_id,
                       s.name AS shareholder_name,
                       s.type AS shareholder_type
                FROM shareholdings sh
                         JOIN shareholders s ON sh.shareholder_id = s.id
                WHERE sh.company_id = ?
                ORDER BY s.name
            `,
            [id]
        );

        let company;
        if (isGuest) {
            company = {
                id: companyRow.id,
                name: companyRow.name,
                nip: companyRow.nip,
                founded_at: companyRow.founded_at,
                company_type_code: companyRow.company_type_code,
                company_type_label: companyRow.company_type_label,
            };
        } else {
            company = {
                id: companyRow.id,
                name: companyRow.name,
                nip: companyRow.nip,
                krs: companyRow.krs,
                founded_at: companyRow.founded_at,
                company_type_code: companyRow.company_type_code,
                company_type_label: companyRow.company_type_label,
                share_capital: companyRow.share_capital,
                last_valuation: companyRow.last_valuation,
                created_by_user_id: companyRow.created_by_user_id,
                created_by_name: companyRow.created_by_name,
                is_restricted: !!companyRow.is_restricted,
                notes: companyRow.notes,
            };
        }

        return res.json({company, shareholdings});
    } catch (err) {
        next(err);
    }
}

// POST /api/companies  (ANALYST only)
async function createCompany(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({error: "Authentication required."});
        }

        const errors = validateCompanyData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        const {
            name,
            nip,
            krs,
            founded_at,
            company_type_id,
            share_capital,
            last_valuation,
            is_restricted,
            notes,
        } = req.body;

        const restrictedFlag =
            is_restricted === true || is_restricted === 1 || is_restricted === "1"
                ? 1
                : 0;

        const result = await run(
            `
                INSERT INTO companies (name, nip, krs, founded_at,
                                       company_type_id,
                                       share_capital, last_valuation,
                                       created_by_user_id,
                                       is_restricted,
                                       notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                nip,
                krs || null,
                founded_at || null,
                Number(company_type_id),
                Number(share_capital),
                last_valuation !== undefined && last_valuation !== null
                    ? Number(last_valuation)
                    : null,
                user.id,
                restrictedFlag,
                notes || null,
            ]
        );

        const newCompany = await get(
            `
                SELECT c.*,
                       ct.label_pl AS company_type_label,
                       ct.code     AS company_type_code
                FROM companies c
                         JOIN company_types ct ON c.company_type_id = ct.id
                WHERE c.id = ?
            `,
            [result.lastID]
        );

        return res.status(201).json({company: newCompany});
    } catch (err) {
        next(err);
    }
}

// PUT /api/companies/:id  (ANALYST only, but only for own companies)
async function updateCompany(req, res, next) {
    try {
        const user = req.user;
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid company id."});
        }

        const existing = await get("SELECT * FROM companies WHERE id = ?", [id]);
        if (!existing) {
            return res.status(404).json({error: "Company not found."});
        }

        if (!canUserEditCompany(user, existing)) {
            return res.status(403).json({
                error: "You are not allowed to modify this company.",
            });
        }

        const errors = validateCompanyData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({errors});
        }

        const {
            name,
            nip,
            krs,
            founded_at,
            company_type_id,
            share_capital,
            last_valuation,
            is_restricted,
            notes,
        } = req.body;

        const restrictedFlag =
            is_restricted === true || is_restricted === 1 || is_restricted === "1"
                ? 1
                : 0;

        await run(
            `
                UPDATE companies
                SET name            = ?,
                    nip             = ?,
                    krs             = ?,
                    founded_at      = ?,
                    company_type_id = ?,
                    share_capital   = ?,
                    last_valuation  = ?,
                    is_restricted   = ?,
                    notes           = ?
                WHERE id = ?
            `,
            [
                name,
                nip,
                krs || null,
                founded_at || null,
                Number(company_type_id),
                Number(share_capital),
                last_valuation !== undefined && last_valuation !== null
                    ? Number(last_valuation)
                    : null,
                restrictedFlag,
                notes || null,
                id,
            ]
        );

        const updated = await get(
            `
                SELECT c.*,
                       ct.label_pl AS company_type_label,
                       ct.code     AS company_type_code
                FROM companies c
                         JOIN company_types ct ON c.company_type_id = ct.id
                WHERE c.id = ?
            `,
            [id]
        );

        return res.json({company: updated});
    } catch (err) {
        next(err);
    }
}

// DELETE /api/companies/:id  (ANALYST only, own companies)
async function deleteCompany(req, res, next) {
    try {
        const user = req.user;
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: "Invalid company id."});
        }

        const existing = await get("SELECT * FROM companies WHERE id = ?", [id]);
        if (!existing) {
            return res.status(404).json({error: "Company not found."});
        }

        if (!canUserEditCompany(user, existing)) {
            return res.status(403).json({
                error: "You are not allowed to delete this company.",
            });
        }

        await run("DELETE FROM companies WHERE id = ?", [id]);

        return res.json({success: true});
    } catch (err) {
        next(err);
    }
}

// GET /api/companies/types  (for dropdowns)
async function listCompanyTypes(req, res, next) {
    try {
        const rows = await all(
            "SELECT id, code, label_pl, description FROM company_types ORDER BY label_pl"
        );
        return res.json({items: rows});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    listCompanyTypes,
    // helper exported for_shareholderController if needed
    canUserEditCompany,
};
