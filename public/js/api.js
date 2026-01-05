// public/js/api.js

/*
 * api.js
 * Tiny wrapper around `fetch()` used by the whole frontend.
 * - Adds `/api` base prefix
 * - Automatically JSON-encodes plain-object request bodies
 * - Attaches `Authorization: Bearer <token>` when logged in
 * - Normalizes errors by throwing an Error with `.status` and `.data`
 */

(function () {
    "use strict";

    // `use strict` helps catch some common JavaScript mistakes early.


    const API_BASE = "/api";
    let authToken = null;

    // setToken: Store token in this module so requests include `Authorization: Bearer ...`.
    function setToken(token) {
        authToken = token || null;
    }

    // clearToken: Remove token so requests become anonymous.
    function clearToken() {
        authToken = null;
    }

    async function request(path, options) {
        const finalOptions = Object.assign(
            {
                headers: {},
                credentials: "same-origin",
            },
            options || {}
        );

        // JSON body helper
        if (
            finalOptions.body &&
            typeof finalOptions.body === "object" &&
            !(finalOptions.body instanceof FormData)
        ) {
            finalOptions.headers["Content-Type"] = "application/json";
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        if (authToken) {
            finalOptions.headers["Authorization"] = "Bearer " + authToken;
        }

        const resp = await fetch(API_BASE + path, finalOptions);

        const contentType = resp.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        const data = isJson ? await resp.json() : await resp.text();

        if (!resp.ok) {
            const error = new Error(
                (data && data.error) || "Request failed with status " + resp.status
            );
            error.status = resp.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    const api = {
        setToken,
        clearToken,
        get: function (path) {
            return request(path, {method: "GET"});
        },
        post: function (path, body) {
            return request(path, {method: "POST", body: body});
        },
        put: function (path, body) {
            return request(path, {method: "PUT", body: body});
        },
        del: function (path) {
            return request(path, {method: "DELETE"});
        },
    };

    window.api = api;
})();
