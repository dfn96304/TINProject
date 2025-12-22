// public/js/shareholders.js
(function () {
  "use strict";

  const e = React.createElement;
  const { useState, useEffect, useContext } = React;
  const AuthContext = window.AuthContext;

  function defaultNavigate(path) {
    if (!path.startsWith("/")) path = "/" + path;
    window.location.hash = path;
  }

  function useAuth() {
    return useContext(AuthContext);
  }

  // --- Shareholder List ---

  function ShareholderListPage(props) {
    const auth = useAuth();
    const navigate = props.navigate || defaultNavigate;

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
          setError("Failed to load shareholders.");
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

    function linkToShareholder(id) {
      return function (ev) {
        ev.preventDefault();
        navigate("/shareholders/" + id);
      };
    }

    function linkToNew(ev) {
      ev.preventDefault();
      navigate("/shareholders/new");
    }

    return e(
      "div",
      null,
      e("h2", null, "Shareholders"),
      auth.role === "ANALYST" &&
        e(
          "p",
          null,
          e(
            "a",
            { href: "#/shareholders/new", onClick: linkToNew },
            "Add new shareholder"
          )
        ),
      loading && e("p", null, "Loading..."),
      error && e("p", { style: { color: "red" } }, error),
      !loading &&
        !error &&
        (items.length === 0
          ? e("p", null, "No shareholders found.")
          : e(
              "table",
              { border: "1", cellPadding: "4" },
              e(
                "thead",
                null,
                e(
                  "tr",
                  null,
                  e("th", null, "Name"),
                  e("th", null, "Type"),
                  e("th", null, "Identifier"),
                  e("th", null, "Actions")
                )
              ),
              e(
                "tbody",
                null,
                items.map(function (s) {
                  return e(
                    "tr",
                    { key: s.id },
                    e("td", null, s.name),
                    e("td", null, s.type),
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
                        "Details"
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
          "Prev"
        ),
        " Page ",
        page,
        " of ",
        totalPages,
        " ",
        e(
          "button",
          { onClick: nextPage, disabled: page >= totalPages },
          "Next"
        )
      )
    );
  }

  // --- Shareholder Detail ---

  function ShareholderDetailPage(props) {
    const auth = useAuth();
    const navigate = props.navigate || defaultNavigate;
    const id = props.shareholderId;

    const [shareholder, setShareholder] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(
      function () {
        if (!id) return;
        setLoading(true);
        setError(null);
        window.api
          .get("/shareholders/" + id)
          .then(function (data) {
            setShareholder(data.shareholder);
            setHoldings(data.shareholdings || []);
          })
          .catch(function (err) {
            console.error(err);
            if (err.status === 404) {
              setError("Shareholder not found.");
            } else {
              setError("Failed to load shareholder.");
            }
          })
          .finally(function () {
            setLoading(false);
          });
      },
      [id]
    );

    function backToList(ev) {
      ev.preventDefault();
      navigate("/shareholders");
    }

    function goToEdit(ev) {
      ev.preventDefault();
      navigate("/shareholders/" + shareholder.id + "/edit");
    }

    return e(
      "div",
      null,
      e("h2", null, "Shareholder details"),
      e(
        "p",
        null,
        e(
          "a",
          { href: "#/shareholders", onClick: backToList },
          "Back to list"
        )
      ),
      loading && e("p", null, "Loading..."),
      error && e("p", { style: { color: "red" } }, error),
      !loading &&
        !error &&
        shareholder &&
        e(
          "div",
          null,
          e("h3", null, shareholder.name),
          e("p", null, "Type: ", shareholder.type),
          shareholder.identifier &&
            e("p", null, "Identifier: ", shareholder.identifier),
          shareholder.notes &&
            e("p", null, "Notes: ", shareholder.notes),
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
                "Edit shareholder"
              )
            ),
          e("h3", null, "Shareholdings"),
          holdings.length === 0
            ? e("p", null, "No holdings found.")
            : e(
                "table",
                { border: "1", cellPadding: "4" },
                e(
                  "thead",
                  null,
                  e(
                    "tr",
                    null,
                    e("th", null, "Company"),
                    e("th", null, "NIP"),
                    e("th", null, "Shares"),
                    e("th", null, "Acquired"),
                    e("th", null, "Source")
                  )
                ),
                e(
                  "tbody",
                  null,
                  holdings.map(function (h) {
                    return e(
                      "tr",
                      { key: h.id },
                      e("td", null, h.company_name),
                      e("td", null, h.company_nip),
                      e("td", null, String(h.shares_owned)),
                      e("td", null, h.acquired_at || ""),
                      e("td", null, h.source || "")
                    );
                  })
                )
              )
        )
    );
  }

  // --- Shareholder Form ---

  function ShareholderFormPage(props) {
    const auth = useAuth();
    const navigate = props.navigate || defaultNavigate;
    const id = props.shareholderId || null;
    const isEdit = props.mode === "edit" || !!id;

    const [name, setName] = useState("");
    const [type, setType] = useState("PERSON");
    const [identifier, setIdentifier] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

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
            setType(s.type || "PERSON");
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
        e("h2", null, isEdit ? "Edit shareholder" : "Add shareholder"),
        e("p", { style: { color: "red" } }, "Only ANALYST can modify data.")
      );
    }

    function backToList(ev) {
      ev.preventDefault();
      navigate("/shareholders");
    }

    function onSubmit(evt) {
      evt.preventDefault();
      setFormError(null);

      var errs = [];
      if (!name.trim()) errs.push("Name is required.");
      if (!type.trim()) errs.push("Type is required.");
      if (errs.length > 0) {
        setFormError(errs.join(" "));
        return;
      }

      const payload = {
        name: name.trim(),
        type: type.trim(),
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
            setFormError("Failed to save shareholder.");
          }
        })
        .finally(function () {
          setSaving(false);
        });
    }

    return e(
      "div",
      null,
      e("h2", null, isEdit ? "Edit shareholder" : "Add shareholder"),
      e(
        "p",
        null,
        e(
          "a",
          { href: "#/shareholders", onClick: backToList },
          "Back to list"
        )
      ),
      loading && e("p", null, "Loading form..."),
      error && e("p", { style: { color: "red" } }, error),
      !loading &&
        !error &&
        e(
          "form",
          { onSubmit: onSubmit },
          formError &&
            e("p", { style: { color: "red" } }, formError),
          e(
            "div",
            null,
            e("label", null, "Name: "),
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
            e("label", null, "Type: "),
            e(
              "select",
              {
                value: type,
                onChange: function (e2) {
                  setType(e2.target.value);
                },
              },
              e("option", { value: "PERSON" }, "PERSON"),
              e("option", { value: "COMPANY" }, "COMPANY")
            )
          ),
          e(
            "div",
            null,
            e("label", null, "Identifier (optional): "),
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
            e("label", null, "Notes: "),
            e("textarea", {
              value: notes,
              onChange: function (e2) {
                setNotes(e2.target.value);
              },
            })
          ),
          e(
            "button",
            { type: "submit", disabled: saving },
            saving
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save changes"
              : "Create shareholder"
          )
        )
    );
  }

  // export
  window.ShareholderListPage = ShareholderListPage;
  window.ShareholderDetailPage = ShareholderDetailPage;
  window.ShareholderFormPage = ShareholderFormPage;
})();
