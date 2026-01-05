// public/js/shareholders.js

/*
 * shareholders.js
 * UI pages for Shareholders:
 * - List with pagination
 * - Detail view
 * - Create/Edit form (ANALYST only)
 * - Add/Delete shareholdings from the shareholder detail page (ANALYST only)
 */

(function () {
    "use strict";

    // `use strict` helps catch some common JavaScript mistakes early.


    const e = React.createElement;
    // Shorthand: `e(...)` is the same as `React.createElement(...)` (JSX without a build step).
    const {useState, useEffect, useContext} = React;
    // Pull React APIs we use in this file (hooks, context helpers, etc.).
    const AuthContext = window.AuthContext;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const useI18n = window.useI18n;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).

    // defaultNavigate: Small helper that updates the hash (/#/...) to perform SPA navigation.
    function defaultNavigate(path) {
        if (!path.startsWith("/")) path = "/" + path;
        window.location.hash = path;
    }

    // useAuth: Custom hook: a friendly name for `useContext(AuthContext)`.
    function useAuth() {
        return useContext(AuthContext);
    }

    /*
    // getShareholderTypeLabel: Function used by this module.
    function getShareholderTypeLabel(type, t) {
        if (!type) return "";
        const key = "shareholderType." + type;
        const translated = t(key);
        return translated === key ? type : translated;
    }
    */

    // --- Shareholder List ---

    // ShareholderListPage: Paginated list of shareholders.
    function ShareholderListPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const [items, setItems] = useState([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        // loadData: Function used by this module.
        function loadData(p) {
            setLoading(true);
            setError(null);
            window.api
                .get("/shareholders?page=" + p + "&limit=10")
                .then(function (data) {
                    setItems(data.items);
                    setPage(data.page);
                    setTotalPages(data.totalPages);
                })
                .catch(function (err) {
                    console.error(err);
                    setError(t("shareholders.error.loadListFailed"));
                })
                .finally(function () {
                    setLoading(false);
                });
        }

        // React effect: run side-effects after render (fetch data, attach listeners, sync storage, etc.).
        useEffect(
            function () {
                loadData(page);
            },
            [page]
        );

        // prevPage: Function used by this module.
        function prevPage() {
            if (page > 1) setPage(page - 1);
        }

        // nextPage: Function used by this module.
        function nextPage() {
            if (page < totalPages) setPage(page + 1);
        }

        // linkToShareholder: Function used by this module.
        function linkToShareholder(id) {
            return function (ev) {
                ev.preventDefault();
                navigate("/shareholders/" + id);
            };
        }

        // linkToNew: Function used by this module.
        function linkToNew(ev) {
            ev.preventDefault();
            navigate("/shareholders/new");
        }

        return e(
            "div",
            null,
            e("h2", null, t("shareholders.listTitle")),
            auth.role === "ANALYST" &&
            e(
                "p",
                null,
                e(
                    "a",
                    {href: "#/shareholders/new", onClick: linkToNew},
                    t("shareholders.form.createTitle")
                )
            ),
            loading && e("p", null, t("common.loading")),
            error && e("p", {style: {color: "red"}}, error),
            !loading &&
            !error &&
            (items.length === 0
                ? e("p", null, t("list.emptyShareholders"))
                : e(
                    "table",
                    {border: "1", cellPadding: "4"},
                    e(
                        "thead",
                        null,
                        e(
                            "tr",
                            null,
                            e("th", null, t("table.name")),
                            e("th", null, t("table.lastName")),
                            e("th", null, t("table.identifier")),
                            e("th", null, t("table.actions"))
                        )
                    ),
                    e(
                        "tbody",
                        null,
                        items.map(function (s) {
                            return e(
                                "tr",
                                {key: s.id},
                                e("td", null, s.name),
                                e("td", null, s.last_name || ""),
                                e("td", null, s.identifier || ""),
                                e(
                                    "td",
                                    null,
                                    e(
                                        "a",
                                        {
                                            href: "#/shareholders/" + s.id,
                                            onClick: linkToShareholder(s.id),
                                        },
                                        t("table.details")
                                    )
                                )
                            );
                        })
                    )
                )),
            e(
                "div",
                {style: {marginTop: "10px"}},
                e(
                    "button",
                    {onClick: prevPage, disabled: page <= 1},
                    t("pager.prev")
                ),
                " ",
                t("pager.page"),
                " ",
                page,
                " ",
                t("pager.of"),
                " ",
                totalPages,
                " ",
                e(
                    "button",
                    {onClick: nextPage, disabled: page >= totalPages},
                    t("pager.next")
                )
            )
        );
    }

    // --- Shareholder Detail ---

    // ShareholderDetailPage: Shareholder details + their holdings; analysts can add/delete shareholdings from here.
    function ShareholderDetailPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const id = props.shareholderId;

        const isAnalyst = auth.role === "ANALYST";

        const [shareholder, setShareholder] = useState(null);
        const [holdings, setHoldings] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const [actionError, setActionError] = useState(null);

        // For add/delete shareholdings from the shareholder view
        const [companies, setCompanies] = useState([]);
        const [companiesLoading, setCompaniesLoading] = useState(false);
        const [companiesError, setCompaniesError] = useState(null);

        const [newCompanyId, setNewCompanyId] = useState("");
        const [newSharesOwned, setNewSharesOwned] = useState("");
        const [newAcquiredAt, setNewAcquiredAt] = useState("");
        const [newSource, setNewSource] = useState("");
        const [shareholdingSaving, setShareholdingSaving] = useState(false);
        const [deletingShareholdingId, setDeletingShareholdingId] = useState(null);

        // loadShareholder: Function used by this module.
        function loadShareholder() {
            if (!id) return Promise.resolve();
            setLoading(true);
            setError(null);
            return window.api
                .get("/shareholders/" + id)
                .then(function (data) {
                    setShareholder(data.shareholder);
                    setHoldings(data.shareholdings || []);
                })
                .catch(function (err) {
                    console.error(err);
                    if (err.status === 404) {
                        setError(t("shareholders.error.notFound"));
                    } else {
                        setError(t("shareholders.error.loadFailed"));
                    }
                })
                .finally(function () {
                    setLoading(false);
                });
        }

        // React effect: run side-effects after render (fetch data, attach listeners, sync storage, etc.).
        useEffect(
            function () {
                loadShareholder();
            },
            [id]
        );

        // Load companies for the "Add shareholding" dropdown (analysts only)
        useEffect(
            function () {
                if (!isAnalyst || !auth.user) return;

                setCompaniesLoading(true);
                setCompaniesError(null);

                // fetchAllCompanies: Function used by this module.
                function fetchAllCompanies(page, acc) {
                    return window.api
                        .get("/companies?page=" + page + "&limit=100")
                        .then(function (data) {
                            const items = data.items || [];
                            const merged = acc.concat(items);
                            if (page < (data.totalPages || 1)) {
                                return fetchAllCompanies(page + 1, merged);
                            }
                            return merged;
                        });
                }

                fetchAllCompanies(1, [])
                    .then(function (allCompanies) {
                        setCompanies(allCompanies);

                        // Set a sensible default selection (first editable company)
                        if (!newCompanyId) {
                            const editable = allCompanies.filter(function (c) {
                                return c && (!c.is_restricted || c.created_by_user_id === auth.user.id);
                            });
                            if (editable.length > 0) {
                                setNewCompanyId(String(editable[0].id));
                            }
                        }
                    })
                    .catch(function (err) {
                        console.error(err);
                        setCompaniesError(t("shareholdings.error.loadCompaniesFailed"));
                    })
                    .finally(function () {
                        setCompaniesLoading(false);
                    });
            },
            // Only refetch when analyst identity changes
            [isAnalyst, auth.user && auth.user.id]
        );

        // backToList: Function used by this module.
        function backToList(ev) {
            ev.preventDefault();
            navigate("/shareholders");
        }

        // goToEdit: Function used by this module.
        function goToEdit(ev) {
            ev.preventDefault();
            navigate("/shareholders/" + shareholder.id + "/edit");
        }

        const companyById = (companies || []).reduce(function (acc, c) {
            if (c && c.id != null) acc[c.id] = c;
            return acc;
        }, {});

        const editableCompanies = (companies || []).filter(function (c) {
            if (!isAnalyst || !auth.user || !c) return false;
            return !c.is_restricted || c.created_by_user_id === auth.user.id;
        });

        // canEditCompanyId: Function used by this module.
        function canEditCompanyId(companyId) {
            if (!isAnalyst || !auth.user) return false;
            const c = companyById[companyId];
            if (!c) return false;
            return !c.is_restricted || c.created_by_user_id === auth.user.id;
        }

        // handleCreateShareholding: Function used by this module.
        function handleCreateShareholding(ev) {
            ev.preventDefault();
            setActionError(null);

            const errs = [];
            const companyIdNum = Number(newCompanyId);
            const sharesNum = Number(newSharesOwned);

            if (!Number.isInteger(companyIdNum) || companyIdNum <= 0) {
                errs.push("Company is required.");
            }
            if (!Number.isFinite(sharesNum) || sharesNum <= 0) {
                errs.push("Shares must be a positive number.");
            }
            if (newAcquiredAt && !/^\d{4}-\d{2}-\d{2}$/.test(newAcquiredAt)) {
                errs.push("Acquired date must be YYYY-MM-DD.");
            }

            // Frontend guard: only allow selecting companies the analyst can edit
            if (Number.isInteger(companyIdNum) && companyIdNum > 0) {
                if (!canEditCompanyId(companyIdNum)) {
                    errs.push("You can only add shareholdings for restricted companies you created.");
                }
            }

            if (errs.length > 0) {
                setActionError(errs.join(" "));
                return;
            }

            const payload = {
                company_id: companyIdNum,
                shareholder_id: Number(id),
                shares_owned: sharesNum,
                acquired_at: newAcquiredAt || null,
                source: newSource || null,
            };

            setShareholdingSaving(true);
            window.api
                .post("/shareholders/shareholdings", payload)
                .then(function () {
                    setNewSharesOwned("");
                    setNewAcquiredAt("");
                    setNewSource("");
                    return loadShareholder();
                })
                .catch(function (err) {
                    console.error(err);
                    if (err.data && err.data.errors) {
                        setActionError(err.data.errors.join(" "));
                    } else if (err.data && err.data.error) {
                        setActionError(err.data.error);
                    } else {
                        setActionError("Failed to add shareholding.");
                    }
                })
                .finally(function () {
                    setShareholdingSaving(false);
                });
        }

        // handleDeleteShareholding: Function used by this module.
        function handleDeleteShareholding(holding) {
            if (!holding || !holding.id) return;

            if (!window.confirm(t("shareholdings.error.addFailed"))) {
                return;
            }

            setActionError(null);
            setDeletingShareholdingId(holding.id);
            window.api
                .del("/shareholders/shareholdings/" + holding.id)
                .then(function () {
                    return loadShareholder();
                })
                .catch(function (err) {
                    console.error(err);
                    if (err.data && err.data.error) {
                        setActionError(err.data.error);
                    } else {
                        setActionError(t("shareholdings.error.deleteFailed"));
                    }
                })
                .finally(function () {
                    setDeletingShareholdingId(null);
                });
        }

        return e(
            "div",
            null,
            e("h2", null, t("shareholders.detailTitle")),
            e(
                "p",
                null,
                e(
                    "a",
                    {href: "#/shareholders", onClick: backToList},
                    t("nav.backToList")
                )
            ),
            loading && e("p", null, t("common.loading")),
            error && e("p", {style: {color: "red"}}, error),
            !loading &&
            !error &&
            shareholder &&
            e(
                "div",
                null,
                e("h3", null, shareholder.name),
                e(
                    "p",
                    null,
                    t("shareholders.lastNameLabel") + ": ",
                    shareholder.last_name
                ),
                shareholder.identifier &&
                e("p", null, t("shareholders.field.identifier") + ": ", shareholder.identifier),
                shareholder.notes && e("p", null, t("shareholders.field.notes") + ": ", shareholder.notes),
                auth.role === "ANALYST" &&
                e(
                    "p",
                    null,
                    e(
                        "a",
                        {
                            href: "#/shareholders/" + shareholder.id + "/edit",
                            onClick: goToEdit,
                        },
                        t("shareholders.form.editTitle")
                    )
                ),
                actionError && e("p", {style: {color: "red"}}, actionError),
                e("h3", null, t("table.shareholdings")),

                // Add shareholding (shareholder-side only)
                isAnalyst &&
                auth.user &&
                e(
                    "div",
                    {style: {marginBottom: "10px"}},
                    e("h4", null, t("shareholdings.addTitle")),
                    companiesLoading && e("p", null, t("common.loadingCompanies")),
                    companiesError &&
                    e("p", {style: {color: "red"}}, companiesError),
                    !companiesLoading && editableCompanies.length === 0
                        ? e(
                            "p",
                            null,
                            t("shareholdings.noEditableCompanies")
                        )
                        : e(
                            "form",
                            {onSubmit: handleCreateShareholding},
                            e(
                                "div",
                                null,
                                e("label", null, t("table.company") + ": "),
                                e(
                                    "select",
                                    {
                                        value: newCompanyId,
                                        onChange: function (e2) {
                                            setNewCompanyId(e2.target.value);
                                        },
                                    },
                                    e("option", {value: ""}, t("common.selectPlaceholder")),
                                    editableCompanies.map(function (c) {
                                        return e(
                                            "option",
                                            {key: c.id, value: String(c.id)},
                                            c.name + " (" + c.nip + ")"
                                        );
                                    })
                                )
                            ),
                            e(
                                "div",
                                null,
                                e("label", null, t("table.shares") + ": "),
                                e("input", {
                                    type: "number",
                                    value: newSharesOwned,
                                    onChange: function (e2) {
                                        setNewSharesOwned(e2.target.value);
                                    },
                                })
                            ),
                            e(
                                "div",
                                null,
                                e(
                                    "label",
                                    null,
                                    t("table.acquiredAt") + " (YYYY-MM-DD): "
                                ),
                                e("input", {
                                    type: "text",
                                    value: newAcquiredAt,
                                    onChange: function (e2) {
                                        setNewAcquiredAt(e2.target.value);
                                    },
                                })
                            ),
                            e(
                                "div",
                                null,
                                e("label", null, t("table.source") + ": "),
                                e("input", {
                                    type: "text",
                                    value: newSource,
                                    onChange: function (e2) {
                                        setNewSource(e2.target.value);
                                    },
                                })
                            ),
                            e(
                                "button",
                                {type: "submit", disabled: shareholdingSaving},
                                shareholdingSaving ? t("common.adding") : t("common.add")
                            )
                        )
                ),

                holdings.length === 0
                    ? e("p", null, t("list.emptyHoldings"))
                    : e(
                        "table",
                        {border: "1", cellPadding: "4"},
                        e(
                            "thead",
                            null,
                            e(
                                "tr",
                                null,
                                e("th", null, t("table.company")),
                                e("th", null, t("table.nip")),
                                e("th", null, t("table.shares")),
                                e("th", null, t("table.acquiredAt")),
                                e("th", null, t("table.source")),
                                isAnalyst && e("th", null, t("table.actions"))
                            )
                        ),
                        e(
                            "tbody",
                            null,
                            holdings.map(function (h) {
                                return e(
                                    "tr",
                                    {key: h.id},
                                    e("td", null, h.company_name),
                                    e("td", null, h.company_nip),
                                    e("td", null, String(h.shares_owned)),
                                    e("td", null, h.acquired_at || ""),
                                    e("td", null, h.source || ""),
                                    isAnalyst &&
                                    e(
                                        "td",
                                        null,
                                        canEditCompanyId(h.company_id)
                                            ? e(
                                                "button",
                                                {
                                                    onClick: function () {
                                                        handleDeleteShareholding(h);
                                                    },
                                                    disabled:
                                                        deletingShareholdingId ===
                                                        h.id,
                                                },
                                                deletingShareholdingId === h.id
                                                    ? "Deleting..."
                                                    : "Delete"
                                            )
                                            : ""
                                    )
                                );
                            })
                        )
                    )
            )
        );
    }


    // --- Shareholder Form ---

    // ShareholderFormPage: Create/edit form for shareholders (ANALYST only).
    function ShareholderFormPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const id = props.shareholderId || null;
        const isEdit = props.mode === "edit" || !!id;

        const [name, setName] = useState("");
        const [lastName, setLastName] = useState("");
        const [identifier, setIdentifier] = useState("");
        const [notes, setNotes] = useState("");
        const [loading, setLoading] = useState(isEdit);
        const [error, setError] = useState(null);
        const [formError, setFormError] = useState(null);
        const [saving, setSaving] = useState(false);

        // React effect: run side-effects after render (fetch data, attach listeners, sync storage, etc.).
        useEffect(
            function () {
                if (!isEdit || !id) return;

                setLoading(true);
                setError(null);
                window.api
                    .get("/shareholders/" + id)
                    .then(function (data) {
                        const s = data.shareholder;
                        setName(s.name || "");
                        setLastName(s.last_name || "");
                        setIdentifier(s.identifier || "");
                        setNotes(s.notes || "");
                    })
                    .catch(function (err) {
                        console.error(err);
                        setError("Failed to load shareholder.");
                    })
                    .finally(function () {
                        setLoading(false);
                    });
            },
            [id, isEdit]
        );

        if (auth.role !== "ANALYST") {
            return e(
                "div",
                null,
                e(
                    "h2",
                    null,
                    isEdit
                        ? t("shareholders.form.editTitle")
                        : t("shareholders.form.createTitle")
                ),
                e("p", {style: {color: "red"}}, t("shareholders.error.onlyAnalyst"))
            );
        }

        // backToList: Function used by this module.
        function backToList(ev) {
            ev.preventDefault();
            navigate("/shareholders");
        }

        // onSubmit: Function used by this module.
        function onSubmit(evt) {
            evt.preventDefault();
            setFormError(null);

            var errs = [];
            if (!name.trim()) errs.push(t("validation.nameRequired"));
            if (!lastName.trim()) errs.push(t("validation.lastNameRequired"));

            var trimmedIdentifier = identifier ? identifier.trim() : "";

            if (trimmedIdentifier && !/^[0-9]+$/.test(trimmedIdentifier)) {
                errs.push(t("validation.identifierDigitsOnly"));
            }

            if (errs.length > 0) {
                setFormError(errs.join(" "));
                return;
            }

            const payload = {
                name: name.trim(),
                last_name: lastName.trim(),
                identifier: identifier || null,
                notes: notes || null,
            };

            setSaving(true);

            var promise;
            if (isEdit && id) {
                promise = window.api.put("/shareholders/" + id, payload);
            } else {
                promise = window.api.post("/shareholders", payload);
            }

            promise
                .then(function (data) {
                    const newId = isEdit && id ? id : data.shareholder.id;
                    navigate("/shareholders/" + newId);
                })
                .catch(function (err) {
                    console.error(err);
                    if (err.data && err.data.errors) {
                        setFormError(err.data.errors.join(" "));
                    } else if (err.data && err.data.error) {
                        setFormError(err.data.error);
                    } else {
                        setFormError(t("shareholders.error.saveFailed"));
                    }
                })
                .finally(function () {
                    setSaving(false);
                });
        }

        return e(
            "div",
            null,
            e(
                "h2",
                null,
                isEdit
                    ? t("shareholders.form.editTitle")
                    : t("shareholders.form.createTitle")
            ),
            e(
                "p",
                null,
                e(
                    "a",
                    {href: "#/shareholders", onClick: backToList},
                    t("nav.backToList")
                )
            ),
            loading && e("p", null, t("common.loadingForm")),
            error && e("p", {style: {color: "red"}}, error),
            !loading &&
            !error &&
            e(
                "form",
                {onSubmit: onSubmit},
                formError &&
                e("p", {style: {color: "red"}}, formError),
                e(
                    "div",
                    null,
                    e("label", null, t("form.name") + ": "),
                    e("input", {
                        type: "text",
                        value: name,
                        onChange: function (e2) {
                            setName(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("shareholders.lastNameLabel") + ": "),
                    e("input", {
                        type: "text",
                        value: lastName,
                        onChange: function (e2) {
                            setLastName(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.identifierOptional") + ": "),
                    e("input", {
                        type: "text",
                        value: identifier,
                        onChange: function (e2) {
                            setIdentifier(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.notes") + ": "),
                    e("textarea", {
                        value: notes,
                        onChange: function (e2) {
                            setNotes(e2.target.value);
                        },
                    })
                ),
                e(
                    "button",
                    {type: "submit", disabled: saving},
                    saving
                        ? isEdit
                            ? t("common.saving")
                            : t("common.creating")
                        : isEdit
                            ? t("common.saveChanges")
                            : t("common.createShareholder")
                )
            )
        );
    }

    window.ShareholderListPage = ShareholderListPage;
    window.ShareholderDetailPage = ShareholderDetailPage;
    window.ShareholderFormPage = ShareholderFormPage;
})();
