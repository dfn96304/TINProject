// public/js/companies.js
(function () {
    "use strict";

    const e = React.createElement;
    const {useState, useEffect, useContext} = React;
    const AuthContext = window.AuthContext;
    const useI18n = window.useI18n;

    function defaultNavigate(path) {
        if (!path.startsWith("/")) path = "/" + path;
        window.location.hash = path;
    }

    function useAuth() {
        return useContext(AuthContext);
    }

    function getCompanyTypeLabel(company, t) {
        const code = company.company_type_code;
        if (code) {
            const key = "companyType." + code;
            const translated = t(key);
            if (translated !== key) return translated;
        }
        return company.company_type_label || code || "";
    }

    // --- Company List Page ---

    function CompanyListPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const [items, setItems] = useState([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        function loadData(p) {
            setLoading(true);
            setError(null);

            window.api
                .get("/companies?page=" + p + "&limit=10")
                .then(function (data) {
                    setItems(data.items);
                    setPage(data.page);
                    setTotalPages(data.totalPages);
                })
                .catch(function (err) {
                    console.error(err);
                    setError(t("companies.error.loadListFailed"));
                })
                .finally(function () {
                    setLoading(false);
                });
        }

        useEffect(
            function () {
                loadData(page);
            },
            [page]
        );

        function prevPage() {
            if (page > 1) setPage(page - 1);
        }

        function nextPage() {
            if (page < totalPages) setPage(page + 1);
        }

        function linkToCompany(id) {
            return function (ev) {
                ev.preventDefault();
                navigate("/companies/" + id);
            };
        }

        function linkToNew(ev) {
            ev.preventDefault();
            navigate("/companies/new");
        }

        return e(
            "div",
            null,
            e("h2", null, t("companies.listTitle")),
            auth.role === "ANALYST" &&
            e(
                "p",
                null,
                e(
                    "a",
                    {href: "#/companies/new", onClick: linkToNew},
                    t("companies.form.createTitle")
                )
            ),
            loading && e("p", null, t("common.loading")),
            error && e("p", {style: {color: "red"}}, error),
            !loading &&
            !error &&
            (items.length === 0
                ? e("p", null, t("list.emptyCompanies"))
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
                            e("th", null, t("table.nip")),
                            e("th", null, t("table.type")),
                            e("th", null, t("table.founded")),
                            e("th", null, t("table.actions"))
                        )
                    ),
                    e(
                        "tbody",
                        null,
                        items.map(function (c) {
                            return e(
                                "tr",
                                {key: c.id},
                                e("td", null, c.name),
                                e("td", null, c.nip),
                                e("td", null, getCompanyTypeLabel(c, t)),
                                e("td", null, c.founded_at || ""),
                                e(
                                    "td",
                                    null,
                                    e(
                                        "a",
                                        {
                                            href: "#/companies/" + c.id,
                                            onClick: linkToCompany(c.id),
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
                { style: { marginTop: "10px" } },
                e(
                    "button",
                    { onClick: prevPage, disabled: page <= 1 },
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
                    { onClick: nextPage, disabled: page >= totalPages },
                    t("pager.next")
                )
            )
        );
    }

    // --- Company Detail Page ---

    function CompanyDetailPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const id = props.companyId;

        const [company, setCompany] = useState(null);
        const [shareholdings, setShareholdings] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [actionError, setActionError] = useState(null);
        const [deleteLoading, setDeleteLoading] = useState(false);

        useEffect(
            function () {
                if (!id) return;
                setLoading(true);
                setError(null);
                window.api
                    .get("/companies/" + id)
                    .then(function (data) {
                        setCompany(data.company);
                        setShareholdings(data.shareholdings || []);
                    })
                    .catch(function (err) {
                        console.error(err);
                        if (err.status === 404) {
                            setError(t("companies.error.notFound"));
                        } else {
                            setError(t("companies.error.loadFailed"));
                        }
                    })
                    .finally(function () {
                        setLoading(false);
                    });
            },
            [id]
        );

        const canEdit =
            auth.role === "ANALYST" &&
            company &&
            auth.user &&
            ( !company.is_restricted || company.created_by_user_id === auth.user.id );

        function handleDelete() {
            if (!window.confirm(t("companies.confirm.delete"))) {
                return;
            }
            setActionError(null);
            setDeleteLoading(true);
            window.api
                .del("/companies/" + id)
                .then(function () {
                    navigate("/companies");
                })
                .catch(function (err) {
                    console.error(err);
                    if (err.data && err.data.error) {
                        setActionError(err.data.error);
                    } else {
                        setActionError(t("companies.error.deleteFailed"));
                    }
                })
                .finally(function () {
                    setDeleteLoading(false);
                });
        }

        function backToList(ev) {
            ev.preventDefault();
            navigate("/companies");
        }

        function goToEdit(ev) {
            ev.preventDefault();
            navigate("/companies/" + company.id + "/edit");
        }

        return e(
            "div",
            null,
            e("h2", null, t("companies.detailTitle")),
            e(
                "p",
                null,
                e(
                    "a",
                    { href: "#/companies", onClick: backToList },
                    t("nav.backToList")
                )
            ),
            loading && e("p", null, t("common.loading")),
            error && e("p", {style: {color: "red"}}, error),
            !loading &&
            !error &&
            company &&
            e(
                "div",
                null,
                e("h3", null, company.name),
                e("p", null, "NIP: ", company.nip),
                company.krs && e("p", null, "KRS: ", company.krs),
                e(
                    "p",
                    null,
                    t("companies.field.type") + ": ",
                    getCompanyTypeLabel(company, t)
                ),
                company.founded_at &&
                e("p", null, t("companies.field.founded") + ": ", company.founded_at),
                e("p", null, t("companies.field.shareCapital") + ": ", String(company.share_capital)),
                company.last_valuation !== null &&
                company.last_valuation !== undefined &&
                e(
                    "p",
                    null,
                    t("companies.field.lastValuation") + ": ",
                    String(company.last_valuation)
                ),
                e(
                    "p",
                    null,
                    t("companies.field.restricted") + ": ",
                    company.is_restricted ? t("common.yes") : t("common.no")
                ),
                company.notes &&
                e("p", null, t("companies.field.notes") + ": ", company.notes),
                company.created_by_name &&
                e(
                    "p",
                    null,
                    t("companies.field.createdBy") + ": ",
                    company.created_by_name,
                    " (user ID ",
                    company.created_by_user_id,
                    ")"
                ),
                canEdit &&
                e(
                    "div",
                    {style: {marginTop: "10px"}},
                    e(
                        "a",
                        {href: "#/companies/" + company.id + "/edit", onClick: goToEdit},
                        t("companies.form.editTitle")
                    ),
                    " ",
                    e(
                        "button",
                        {
                            type: "button",
                            onClick: handleDelete,
                            disabled: deleteLoading,
                        },
                        deleteLoading ? t("common.deleting") : t("common.deleteCompany")
                    )
                ),
                actionError &&
                e("p", {style: {color: "red"}}, actionError),
                e("h3", null, t("table.shareholdings")),
                shareholdings.length === 0
                    ? e("p", null, t("list.emptyShareholdings"))
                    : e(
                        "table",
                        {border: "1", cellPadding: "4"},
                        e(
                            "thead",
                            null,
                            e(
                                "tr",
                                null,
                                e("th", null, t("table.shareholder")),
                                e("th", null, t("table.lastName")),
                                e("th", null, t("table.shares")),
                                e("th", null, t("table.acquiredAt")),
                                e("th", null, t("table.source"))
                            )
                        ),
                        e(
                            "tbody",
                            null,
                            shareholdings.map(function (sh) {
                                return e(
                                    "tr",
                                    {key: sh.id},
                                    e("td", null, sh.shareholder_name),
                                    e("td", null, sh.shareholder_last_name),
                                    e("td", null, String(sh.shares_owned)),
                                    e("td", null, sh.acquired_at || ""),
                                    e("td", null, sh.source || "")
                                );
                            })
                        )
                    )
            )
        );
    }

    // --- Company Form Page ---

    function CompanyFormPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const id = props.companyId || null;
        const isEdit = props.mode === "edit" || !!id;

        const [name, setName] = useState("");
        const [nip, setNip] = useState("");
        const [krs, setKrs] = useState("");
        const [foundedAt, setFoundedAt] = useState("");
        const [companyTypeId, setCompanyTypeId] = useState("");
        const [shareCapital, setShareCapital] = useState("");
        const [lastValuation, setLastValuation] = useState("");
        const [isRestricted, setIsRestricted] = useState(false);
        const [notes, setNotes] = useState("");
        const [types, setTypes] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [formError, setFormError] = useState(null);
        const [saving, setSaving] = useState(false);

        useEffect(function () {
            setLoading(true);
            setError(null);

            Promise.all([
                window.api.get("/companies/types"),
                isEdit && id ? window.api.get("/companies/" + id) : Promise.resolve(null),
            ])
                .then(function (results) {
                    const typesResp = results[0];
                    const companyResp = results[1];

                    setTypes(typesResp.items || []);

                    if (companyResp && companyResp.company) {
                        const c = companyResp.company;
                        setName(c.name || "");
                        setNip(c.nip || "");
                        setKrs(c.krs || "");
                        setFoundedAt(c.founded_at || "");
                        setCompanyTypeId(String(c.company_type_id));
                        setShareCapital(String(c.share_capital || ""));
                        setLastValuation(
                            c.last_valuation !== null && c.last_valuation !== undefined
                                ? String(c.last_valuation)
                                : ""
                        );
                        setIsRestricted(!!c.is_restricted);
                        setNotes(c.notes || "");
                    }
                })
                .catch(function (err) {
                    console.error(err);
                    setError(t("companies.error.formLoadFailed"));
                })
                .finally(function () {
                    setLoading(false);
                });
        }, [id, isEdit]);

        if (auth.role !== "ANALYST") {
            return e(
                "div",
                null,
                e(
                    "h2",
                    null,
                    isEdit
                        ? t("companies.form.editTitle")
                        : t("companies.form.createTitle")
                ),
                e("p", {style: {color: "red"}}, t("companies.error.onlyAnalyst"))
            );
        }

        function backToList(ev) {
            ev.preventDefault();
            navigate("/companies");
        }

        function onSubmit(evt) {
            evt.preventDefault();
            setFormError(null);

            var errs = [];
            if (!name.trim()) errs.push(t("validation.nameRequired"));
            if (!nip.trim()) {
                errs.push(t("validation.nipRequired"));
            } else if (!/^[0-9]+$/.test(nip.trim())) {
                errs.push(t("validation.nipDigitsOnly"));
            }

            if (krs && !/^[0-9]+$/.test(krs.trim())) {
                errs.push(t("validation.krsDigitsOnly"));
            }

            if (!companyTypeId) errs.push(t("validation.companyTypeRequired"));
            if (!shareCapital || Number(shareCapital) <= 0)
                errs.push(t("validation.shareCapitalPositive"));

            if (foundedAt && !/^\d{4}-\d{2}-\d{2}$/.test(foundedAt)) {
                errs.push(t("validation.foundedFormatOptional"));
            }

            if (errs.length > 0) {
                setFormError(errs.join(" "));
                return;
            }

            const payload = {
                name: name.trim(),
                nip: nip.trim(),
                krs: krs.trim() || null,
                founded_at: foundedAt || null,
                company_type_id: Number(companyTypeId),
                share_capital: Number(shareCapital),
                last_valuation: lastValuation ? Number(lastValuation) : null,
                is_restricted: isRestricted ? 1 : 0,
                notes: notes || null,
            };

            setSaving(true);

            var promise;
            if (isEdit && id) {
                promise = window.api.put("/companies/" + id, payload);
            } else {
                promise = window.api.post("/companies", payload);
            }

            promise
                .then(function (data) {
                    const newId = isEdit && id ? id : data.company.id;
                    navigate("/companies/" + newId);
                })
                .catch(function (err) {
                    console.error(err);
                    if (err.data && err.data.errors) {
                        setFormError(err.data.errors.join(" "));
                    } else if (err.data && err.data.error) {
                        setFormError(err.data.error);
                    } else {
                        setFormError(t("companies.error.saveFailed"));
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
                    ? t("companies.form.editTitle")
                    : t("companies.form.createTitle")
            ),
            e(
                "p",
                null,
                e(
                    "a",
                    {href: "#/companies", onClick: backToList},
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
                    e("label", null, t("form.name")),
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
                    e("label", null, "NIP: "),
                    e("input", {
                        type: "text",
                        value: nip,
                        onChange: function (e2) {
                            setNip(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, "KRS: "),
                    e("input", {
                        type: "text",
                        value: krs,
                        onChange: function (e2) {
                            setKrs(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.foundedFormat") + ": "),
                    e("input", {
                        type: "text",
                        value: foundedAt,
                        onChange: function (e2) {
                            setFoundedAt(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.companyType") + ": "),
                    e(
                        "select",
                        {
                            value: companyTypeId,
                            onChange: function (e2) {
                                setCompanyTypeId(e2.target.value);
                            },
                        },
                        e("option", {value: ""}, t("common.selectPlaceholder")),
                        types.map(function (tRow) {
                            const label = getCompanyTypeLabel(
                                {
                                    company_type_code: tRow.code,
                                    company_type_label: tRow.label_pl,
                                },
                                t
                            );
                            return e(
                                "option",
                                {key: tRow.id, value: tRow.id},
                                label
                            );
                        })
                    )
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.shareCapitalPln") + ": "),
                    e("input", {
                        type: "number",
                        step: "0.01",
                        value: shareCapital,
                        onChange: function (e2) {
                            setShareCapital(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.lastValuationPln") + ": "),
                    e("input", {
                        type: "number",
                        step: "0.01",
                        value: lastValuation,
                        onChange: function (e2) {
                            setLastValuation(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("form.restricted") + ": "),
                    e("input", {
                        type: "checkbox",
                        checked: isRestricted,
                        onChange: function (e2) {
                            setIsRestricted(e2.target.checked);
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
                            : t("common.createCompany")
                )
            )
        );
    }

    window.CompanyListPage = CompanyListPage;
    window.CompanyDetailPage = CompanyDetailPage;
    window.CompanyFormPage = CompanyFormPage;
})();
