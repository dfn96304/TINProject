// src/middleware/roleMiddleware.js
"use strict";

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({error: "Authentication required."});
        }

        if (!allowedRoles.includes(user.roleCode)) {
            return res.status(403).json({error: "Insufficient permissions."});
        }

        next();
    };
}

module.exports = {
    requireRole,
};
