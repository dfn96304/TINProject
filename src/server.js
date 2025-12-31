// src/server.js
"use strict";

const { ready } = require("./db");
const app = require("./app");

const PORT = process.env.PORT || 3000;

// Wait for db.js ready promise
ready
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    })
    .catch(() => {
        // db.js already printed a helpful error message.
        process.exit(1);
    });
