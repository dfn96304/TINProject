-- db/seed.sql
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Company types
INSERT INTO company_types (code, label_pl, description) VALUES
  ('SP_ZOO', 'Sp. z o.o.', 'Spółka z ograniczoną odpowiedzialnością'),
  ('SA',     'S.A.',       'Spółka akcyjna');

-- Roles
INSERT INTO roles (code, label) VALUES
  ('GUEST',   'Gość'),
  ('VIEWER',  'Widz'),
  ('ANALYST', 'Analityk');

-- Users
INSERT INTO users (email, password_hash, display_name, role_id, is_active, created_at) VALUES
  (
    'guest@example.com',
    'guest123',
    'Guest User',
    (SELECT id FROM roles WHERE code = 'GUEST'),
    1,
    '2025-01-01T10:00:00Z'
  ),
  (
    'viewer@example.com',
    'viewer123',
    'Viewer User',
    (SELECT id FROM roles WHERE code = 'VIEWER'),
    1,
    '2025-01-02T10:00:00Z'
  ),
  (
    'analyst@example.com',
    'analyst123',
    'Analyst',
    (SELECT id FROM roles WHERE code = 'ANALYST'),
    1,
    '2025-01-03T10:00:00Z'
  ),
  (
    'anna.analyst@example.com',
    'analyst123',
    'Anna Analyst',
    (SELECT id FROM roles WHERE code = 'ANALYST'),
    1,
    '2025-01-03T10:00:00Z'
  );

-- Companies
INSERT INTO companies (
    name, nip, krs, founded_at,
    company_type_id,
    share_capital, last_valuation,
    created_by_user_id,
    is_restricted,
    notes
) VALUES
  (
    'ABC Sp. z o.o.',
    '1234567890',
    '0000123456',
    '2010-05-10',
    (SELECT id FROM company_types WHERE code = 'SP_ZOO'),
    500000.0,
    800000.0,
    (SELECT id FROM users WHERE email = 'anna.analyst@example.com'),
    0,
    'Przykładowa spółka z o.o. używana do testów.'
  ),
  (
    'CDE S.A.',
    '9876543210',
    '0000654321',
    '2015-11-20',
    (SELECT id FROM company_types WHERE code = 'SA'),
    3000000.0,
    5500000.0,
    (SELECT id FROM users WHERE email = 'anna.analyst@example.com'),
    1,
    'Spółka akcyjna z ograniczonym dostępem (is_restricted = 1).'
  );

-- Shareholders
INSERT INTO shareholders (name, last_name, identifier, notes) VALUES
  (
    'Jan',
    'Kowalski',
    '80010112345',
    'Założyciel ABC Sp. z o.o.'
  ),
  (
    'Malwina',
    'Pawlak',
    '61031084100',
    'a'
  ),
  (
    'Racław',
    'Wiśniewski',
    '82010493593',
    'a'
  );

-- Shareholdings: who owns what in which company
INSERT INTO shareholdings (
    company_id, shareholder_id, shares_owned, acquired_at, source
) VALUES
  (
    (SELECT id FROM companies WHERE nip = '1234567890'),  -- ACME
    (SELECT id FROM shareholders WHERE name = 'Jan'),
    500,
    '2010-05-10',
    'Założyciel spółki'
  ),
  (
    (SELECT id FROM companies WHERE nip = '1234567890'),
    (SELECT id FROM shareholders WHERE name = 'Malwina'),
    500,
    '2018-03-01',
    'Podwyższenie kapitału'
  ),
  (
    (SELECT id FROM companies WHERE nip = '9876543210'),
    (SELECT id FROM shareholders WHERE name = 'Malwina'),
    10000,
    '2016-01-15',
    'Wejście kapitałowe'
  ),
  (
    (SELECT id FROM companies WHERE nip = '9876543210'),
    (SELECT id FROM shareholders WHERE name = 'Racław'),
    5000,
    '2019-09-03',
    'Umowa inwestycyjna'
  );

COMMIT;
