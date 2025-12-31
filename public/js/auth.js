// public/js/auth.js
(function () {
    "use strict";

    const e = React.createElement;
    const {createContext, useState, useEffect, useContext} = React;
    const useI18n = window.useI18n;

    const AuthContext = createContext(null);

    function defaultNavigate(path) {
        if (!path.startsWith("/")) path = "/" + path;
        window.location.hash = path;
    }

    function loadStoredAuth() {
        try {
            const token = localStorage.getItem("authToken");
            const userJson = localStorage.getItem("authUser");
            if (!token || !userJson) {
                return {token: null, user: null};
            }
            const user = JSON.parse(userJson);
            return {token, user};
        } catch (err) {
            console.warn("Failed to load auth from localStorage:", err);
            return {token: null, user: null};
        }
    }

    function AuthProvider(props) {
        const initial = loadStoredAuth();
        const [token, setToken] = useState(initial.token);
        const [user, setUser] = useState(initial.user);

        useEffect(
            function () {
                if (token) {
                    window.api.setToken(token);
                } else {
                    window.api.clearToken();
                }
            },
            [token]
        );

        function login(newToken, newUser) {
            setToken(newToken);
            setUser(newUser);
            try {
                localStorage.setItem("authToken", newToken);
                localStorage.setItem("authUser", JSON.stringify(newUser));
            } catch (err) {
                console.warn("Failed to store auth in localStorage:", err);
            }
        }

        function logout() {
            setToken(null);
            setUser(null);
            try {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
            } catch (err) {
                console.warn("Failed to clear auth from localStorage:", err);
            }
        }

        const value = {
            token,
            user,
            role: user && user.roleCode ? user.roleCode : "GUEST",
            isLoggedIn: !!user,
            login,
            logout,
        };

        return e(AuthContext.Provider, {value}, props.children);
    }

    function useAuth() {
        return useContext(AuthContext);
    }

    // --- UI components ---

    function LoginPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(false);

        function onSubmit(evt) {
            evt.preventDefault();
            setError(null);

            if (!email.trim() || !password) {
                setError(t("auth.error.emailPasswordRequired"));
                return;
            }

            setLoading(true);
            window.api
                .post("/auth/login", {email: email.trim(), password})
                .then(function (data) {
                    auth.login(data.token, data.user);
                    navigate("/companies");
                })
                .catch(function (err) {
                    if (err.data && err.data.error) {
                        var msg = err.data.error;
                        if (msg === "Invalid email or password.") {
                            setError(t("auth.error.invalidCredentials"));
                        } else {
                            setError(msg);
                        }
                    } else {
                        setError(t("auth.error.loginFailed"));
                    }
                })
                .finally(function () {
                    setLoading(false);
                });
        }

        function linkHandler(path) {
            return function (ev) {
                ev.preventDefault();
                navigate(path);
            };
        }

        return e(
            "div",
            null,
            e("h2", null, t("auth.loginTitle")),
            error && e("p", {style: {color: "red"}}, error),
            e(
                "form",
                {onSubmit: onSubmit},
                e(
                    "div",
                    null,
                    e("label", null, "Email: "),
                    e("input", {
                        type: "email",
                        value: email,
                        onChange: function (e2) {
                            setEmail(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, "Password: "),
                    e("input", {
                        type: "password",
                        value: password,
                        onChange: function (e2) {
                            setPassword(e2.target.value);
                        },
                    })
                ),
                e(
                    "button",
                    {type: "submit", disabled: loading},
                    loading ? t("auth.loggingIn") : t("auth.loginTitle")
                )
            ),
            e(
                "p",
                null,
                t("auth.noAccountYet"),
                " ",
                e(
                    "a",
                    {href: "#/register", onClick: linkHandler("/register")},
                    t("auth.registerTitle")
                )
            )
        );
    }

    function RegisterPage(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [displayName, setDisplayName] = useState("");
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(false);

        function onSubmit(evt) {
            evt.preventDefault();
            setError(null);

            var errs = [];
            if (!displayName.trim()) errs.push(t("auth.error.displayNameRequired"));
            if (!email.trim()) errs.push(t("auth.error.emailRequired"));
            if (!password || password.length < 6)
                errs.push(t("auth.error.passwordMinLength"));
            if (errs.length > 0) {
                setError(errs.join(" "));
                return;
            }

            setLoading(true);
            window.api
                .post("/auth/register", {
                    email: email.trim(),
                    password,
                    displayName: displayName.trim(),
                })
                .then(function (data) {
                    auth.login(data.token, data.user);
                    navigate("/companies");
                })
                .catch(function (err) {
                    if (err.data && err.data.error) {
                        setError(err.data.error);
                    } else if (err.data && err.data.errors) {
                        setError(err.data.errors.join(" "));
                    } else {
                        setError(t("auth.error.registrationFailed"));
                    }
                })
                .finally(function () {
                    setLoading(false);
                });
        }

        function linkHandler(path) {
            return function (ev) {
                ev.preventDefault();
                navigate(path);
            };
        }

        return e(
            "div",
            null,
            e("h2", null, t("auth.registerTitle")),
            error && e("p", {style: {color: "red"}}, error),
            e(
                "form",
                {onSubmit: onSubmit},
                e(
                    "div",
                    null,
                    e("label", null, t("auth.label.displayName") + ": "),
                    e("input", {
                        type: "text",
                        value: displayName,
                        onChange: function (e2) {
                            setDisplayName(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("auth.label.email") + ": "),
                    e("input", {
                        type: "email",
                        value: email,
                        onChange: function (e2) {
                            setEmail(e2.target.value);
                        },
                    })
                ),
                e(
                    "div",
                    null,
                    e("label", null, t("auth.label.password") + ": "),
                    e("input", {
                        type: "password",
                        value: password,
                        onChange: function (e2) {
                            setPassword(e2.target.value);
                        },
                    })
                ),
                e(
                    "button",
                    {type: "submit", disabled: loading},
                    loading ? t("auth.registering") : t("auth.registerTitle")
                )
            ),
            e(
                "p",
                null,
                t("auth.alreadyAccount"),
                " ",
                e(
                    "a",
                    { href: "#/login", onClick: linkHandler("/login") },
                    t("auth.loginTitle")
                )
            )
        );
    }

    function AuthStatusBar(props) {
        const auth = useAuth();
        const navigate = props.navigate || defaultNavigate;
        const {t} = useI18n();

        function handleLogout() {
            auth.logout();
            navigate("/");
        }

        function linkHandler(path) {
            return function (ev) {
                ev.preventDefault();
                navigate(path);
            };
        }

        if (!auth.isLoggedIn) {
            return e(
                "div",
                null,
                t("auth.status.guestPrefix"),
                e("strong", null, t("auth.status.guestRole")),
                t("auth.status.guestSuffix"),
                " ",
                e(
                    "a",
                    {href: "#/login", onClick: linkHandler("/login")},
                    t("auth.status.login")
                ),
                " ",
                t("common.or"),
                " ",
                e(
                    "a",
                    {href: "#/register", onClick: linkHandler("/register")},
                    t("auth.status.register")
                )
            );
        }

        const roleKey = "role." + (auth.role || "GUEST");

        return e(
            "div",
            null,
            t("auth.status.loggedInPrefix"),
            e("strong", null, auth.user.displayName),
            " (",
            t("auth.status.loggedInRoleLabel"),
            ": ",
            t(roleKey),
            "). ",
            e(
                "button",
                {
                    type: "button",
                    onClick: handleLogout,
                },
                t("auth.logout")
            )
        );
    }

    window.AuthContext = AuthContext;
    window.AuthProvider = AuthProvider;
    window.useAuth = useAuth;
    window.LoginPage = LoginPage;
    window.RegisterPage = RegisterPage;
    window.AuthStatusBar = AuthStatusBar;
})();
