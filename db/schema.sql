-- db/schema.sql
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Drop tables in child → parent order
DROP TABLE IF EXISTS shareholdings;
DROP TABLE IF EXISTS shareholders;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users; -- login
DROP TABLE IF EXISTS roles; -- login - roles
DROP TABLE IF EXISTS company_types;

-- Company types
CREATE TABLE company_types (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT NOT NULL UNIQUE,      -- e.g. 'SP_ZOO', 'SA'
    label_pl    TEXT NOT NULL,            -- e.g. 'Sp. z o.o.', 'S.A.'
    description TEXT
);

-- Roles in the analysis app
CREATE TABLE roles (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    code    TEXT NOT NULL UNIQUE,         -- 'GUEST', 'VIEWER', 'ANALYST'
    label   TEXT NOT NULL
);

-- Users (analysts / viewers)
CREATE TABLE users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    display_name   TEXT NOT NULL,
    role_id        INTEGER NOT NULL,
    is_active      INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT NOT NULL,         -- ISO datetime string

    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Companies being analysed
CREATE TABLE companies (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    name                TEXT NOT NULL,
    nip                 TEXT NOT NULL UNIQUE,
    krs                 TEXT UNIQUE,
    founded_at          TEXT,             -- ISO date string
    company_type_id     INTEGER NOT NULL,
    share_capital       REAL NOT NULL,    -- total share capital (e.g. PLN)
    last_valuation      REAL,             -- most recent valuation
    created_by_user_id  INTEGER,          -- resource-level permissions
    is_restricted       INTEGER NOT NULL DEFAULT 0, -- 0/1
    notes               TEXT,

    FOREIGN KEY (company_type_id)    REFERENCES company_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Shareholders (persons or entities)
CREATE TABLE shareholders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,           -- 'PERSON', 'COMPANY', etc.
    identifier  TEXT,                    -- PESEL
    notes       TEXT
);

-- Many-to-many: companies <-> shareholders
CREATE TABLE shareholdings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id      INTEGER NOT NULL,
    shareholder_id  INTEGER NOT NULL,
    shares_owned    INTEGER NOT NULL,
    acquired_at     TEXT,                -- date string
    source          TEXT,

    FOREIGN KEY (company_id)     REFERENCES companies(id)     ON DELETE CASCADE,
    FOREIGN KEY (shareholder_id) REFERENCES shareholders(id)  ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX idx_companies_nip
    ON companies (nip);

CREATE INDEX idx_shareholdings_company_id
    ON shareholdings (company_id);

CREATE INDEX idx_shareholdings_shareholder_id
    ON shareholdings (shareholder_id);

COMMIT;
