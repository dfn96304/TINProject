// public/js/auth.js
(function () {
  "use strict";

  const e = React.createElement;
  const { createContext, useState, useEffect, useContext } = React;

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
        return { token: null, user: null };
      }
      const user = JSON.parse(userJson);
      return { token, user };
    } catch (err) {
      console.warn("Failed to load auth from localStorage:", err);
      return { token: null, user: null };
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

    return e(AuthContext.Provider, { value }, props.children);
  }

  function useAuth() {
    return useContext(AuthContext);
  }

  // --- UI components ---

  function LoginPage(props) {
    const auth = useAuth();
    const navigate = props.navigate || defaultNavigate;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function onSubmit(evt) {
      evt.preventDefault();
      setError(null);

      if (!email.trim() || !password) {
        setError("Email and password are required.");
        return;
      }

      setLoading(true);
      window.api
        .post("/auth/login", { email: email.trim(), password })
        .then(function (data) {
          auth.login(data.token, data.user);
          navigate("/companies");
        })
        .catch(function (err) {
          if (err.data && err.data.error) {
            setError(err.data.error);
          } else {
            setError("Login failed.");
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
      e("h2", null, "Login"),
      error && e("p", { style: { color: "red" } }, error),
      e(
        "form",
        { onSubmit: onSubmit },
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
          { type: "submit", disabled: loading },
          loading ? "Logging in..." : "Login"
        )
      ),
      e(
        "p",
        null,
        "No account yet? ",
        e(
          "a",
          { href: "#/register", onClick: linkHandler("/register") },
          "Register"
        )
      )
    );
  }

  function RegisterPage(props) {
    const auth = useAuth();
    const navigate = props.navigate || defaultNavigate;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function onSubmit(evt) {
      evt.preventDefault();
      setError(null);

      var errs = [];
      if (!displayName.trim()) errs.push("Display name is required.");
      if (!email.trim()) errs.push("Email is required.");
      if (!password || password.length < 6)
        errs.push("Password must be at least 6 characters.");
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
            setError("Registration failed.");
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
      e("h2", null, "Register"),
      error && e("p", { style: { color: "red" } }, error),
      e(
        "form",
        { onSubmit: onSubmit },
        e(
          "div",
          null,
          e("label", null, "Display name: "),
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
          { type: "submit", disabled: loading },
          loading ? "Registering..." : "Register"
        )
      ),
      e(
        "p",
        null,
        "Already have an account? ",
        e(
          "a",
          { href: "#/login", onClick: linkHandler("/login") },
          "Login"
        )
      )
    );
  }

  function AuthStatusBar(props) {
    const auth = useAuth();
    const navigate = props.navigate || defaultNavigate;

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
        "You are browsing as ",
        e("strong", null, "Guest"),
        " (limited view). ",
        e(
          "a",
          { href: "#/login", onClick: linkHandler("/login") },
          "Login"
        ),
        " or ",
        e(
          "a",
          { href: "#/register", onClick: linkHandler("/register") },
          "Register"
        )
      );
    }

    return e(
      "div",
      null,
      "Logged in as ",
      e("strong", null, auth.user.displayName),
      " (role: ",
      auth.role,
      "). ",
      e(
        "button",
        {
          type: "button",
          onClick: handleLogout,
        },
        "Logout"
      )
    );
  }

  // export to window
  window.AuthContext = AuthContext;
  window.AuthProvider = AuthProvider;
  window.useAuth = useAuth;
  window.LoginPage = LoginPage;
  window.RegisterPage = RegisterPage;
  window.AuthStatusBar = AuthStatusBar;
})();
