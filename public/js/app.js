// public/js/app.js

/*
 * app.js
 * Frontend "entry point" that:
 * - Creates the React root and renders the app into #root
 * - Implements a tiny hash-based router (/#/...) to switch pages without reloads
 * - Defines shared layout (header/nav, language toggle, auth status bar)
 */

(function () {
    "use strict";

    // `use strict` helps catch some common JavaScript mistakes early.


    const e = React.createElement;
    // Shorthand: `e(...)` is the same as `React.createElement(...)` (JSX without a build step).
    const {createRoot} = ReactDOM;
    const {useState, useEffect} = React;
    // Pull React APIs we use in this file (hooks, context helpers, etc.).

    const I18nProvider = window.I18nProvider;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const useI18n = window.useI18n;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).

    const AuthProvider = window.AuthProvider;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const AuthStatusBar = window.AuthStatusBar;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).

    const LoginPage = window.LoginPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const RegisterPage = window.RegisterPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).

    const CompanyListPage = window.CompanyListPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const CompanyDetailPage = window.CompanyDetailPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const CompanyFormPage = window.CompanyFormPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).

    const ShareholderListPage = window.ShareholderListPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const ShareholderDetailPage = window.ShareholderDetailPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).
    const ShareholderFormPage = window.ShareholderFormPage;
    // Grab a value exported by another script via `window.*` (no bundler/imports in this project).

    // parseHash: Read the current URL hash (after #) and normalize it into an internal path like `/companies/123`.
    function parseHash() {
        var hash = window.location.hash || "#/";
        if (hash.charAt(0) === "#") {
            hash = hash.slice(1);
        }
        if (!hash) return "/";
        if (hash.charAt(0) !== "/") hash = "/" + hash;
        return hash;
    }

    // matchRoute: Convert a path string into a route object that tells AppInner which page component to render.
    function matchRoute(path) {
        const parts = path.split("/").filter(Boolean);
        if (parts.length === 0) return {page: "home"};

        const [first, second, third] = parts;

        if (first === "login") return {page: "login"};
        if (first === "register") return {page: "register"};

        if (first === "companies") {
            if (!second) return {page: "companies"};
            if (second === "new") return {page: "companyNew"};
            if (third === "edit") return {page: "companyEdit", id: second};
            return {page: "companyDetail", id: second};
        }

        if (first === "shareholders") {
            if (!second) return {page: "shareholders"};
            if (second === "new") return {page: "shareholderNew"};
            if (third === "edit") return {page: "shareholderEdit", id: second};
            return {page: "shareholderDetail", id: second};
        }

        return {page: "notFound", path};
    }

    // HomePage: Simple landing page with links to main sections.
    function HomePage(props) {
        const {t} = useI18n();

        // link: Function used by this module.
        function link(path) {
            return function (ev) {
                ev.preventDefault();
                props.navigate(path);
            };
        }

        return e(
            "div",
            null,
            e("h2", null, t("home.title")),
            e("p", null, t("home.intro")),
            e(
                "p",
                null,
                t("home.cta"),
                " ",
                e(
                    "a",
                    {href: "#/companies", onClick: link("/companies")},
                    t("home.cta.companies")
                ),
                " ",
                t("common.or"),
                " ",
                e(
                    "a",
                    {href: "#/shareholders", onClick: link("/shareholders")},
                    t("home.cta.shareholders")
                ),
                "."
            )
        );
    }

    // NotFoundPage: Shown when router doesn't recognize the URL hash path.
    function NotFoundPage(props) {
        const {t} = useI18n();

        // goHome: Function used by this module.
        function goHome(ev) {
            ev.preventDefault();
            props.navigate("/");
        }

        return e(
            "div",
            null,
            e("h2", null, t("notFound.title")),
            e("p", null, t("notFound.message")),
            e(
                "p",
                null,
                e("a", {href: "#/", onClick: goHome}, t("notFound.goHome"))
            )
        );
    }

    // Layout: Shared page chrome: header/nav, language toggle, auth status bar, and main content slot.
    function Layout(props) {
        const path = props.path;
        const navigate = props.navigate;
        const {t, lang, setLang} = useI18n();

        // link: Function used by this module.
        function link(pathTarget) {
            return function (ev) {
                ev.preventDefault();
                navigate(pathTarget);
            };
        }

        // changeLang: Function used by this module.
        function changeLang(newLang) {
            return function (ev) {
                ev.preventDefault();
                setLang(newLang);
            };
        }

        return e(
            "div",
            null,
            e(
                "header",
                null,
                e("h1", null, t("app.title")),
                e(
                    "nav",
                    null,
                    e(
                        "a",
                        {href: "#/", onClick: link("/")},
                        t("nav.home")
                    ),
                    " | ",
                    e(
                        "a",
                        {href: "#/companies", onClick: link("/companies")},
                        t("nav.companies")
                    ),
                    " | ",
                    e(
                        "a",
                        {href: "#/shareholders", onClick: link("/shareholders")},
                        t("nav.shareholders")
                    )
                ),
                e(
                    "div",
                    {style: {marginTop: "4px"}},
                    t("lang.label"),
                    " ",
                    e(
                        "a",
                        {
                            href: "#",
                            onClick: changeLang("pl"),
                            style: {fontWeight: lang === "pl" ? "bold" : "normal"},
                        },
                        "PL"
                    ),
                    " / ",
                    e(
                        "a",
                        {
                            href: "#",
                            onClick: changeLang("en"),
                            style: {fontWeight: lang === "en" ? "bold" : "normal"},
                        },
                        "EN"
                    )
                ),
                e("hr", null),
                e(AuthStatusBar, {navigate}),
                e("hr", null)
            ),
            e("main", null, props.children)
        );
    }

    // AppInner: Holds router state (`path`) and picks the correct page component to render.
    function AppInner() {
        const [path, setPath] = useState(parseHash());

        // React effect: run side-effects after render (fetch data, attach listeners, sync storage, etc.).
        useEffect(function () {
            // handleHashChange: Function used by this module.
            function handleHashChange() {
                setPath(parseHash());
            }

            window.addEventListener("hashchange", handleHashChange);
            return function () {
                window.removeEventListener("hashchange", handleHashChange);
            };
        }, []);

        // navigate: Set the hash and rely on `hashchange` to re-render without full page reload.
        function navigate(newPath) {
            if (!newPath.startsWith("/")) newPath = "/" + newPath;
            if (newPath === path) return;
            window.location.hash = newPath;
        }

        const route = matchRoute(path);

        let pageElement;
        switch (route.page) {
            case "home":
                pageElement = e(HomePage, {navigate});
                break;
            case "login":
                pageElement = e(LoginPage, {navigate});
                break;
            case "register":
                pageElement = e(RegisterPage, {navigate});
                break;
            case "companies":
                pageElement = e(CompanyListPage, {navigate});
                break;
            case "companyNew":
                pageElement = e(CompanyFormPage, {
                    navigate,
                    mode: "create",
                });
                break;
            case "companyEdit":
                pageElement = e(CompanyFormPage, {
                    navigate,
                    mode: "edit",
                    companyId: route.id,
                });
                break;
            case "companyDetail":
                pageElement = e(CompanyDetailPage, {
                    navigate,
                    companyId: route.id,
                });
                break;
            case "shareholders":
                pageElement = e(ShareholderListPage, {navigate});
                break;
            case "shareholderNew":
                pageElement = e(ShareholderFormPage, {
                    navigate,
                    mode: "create",
                });
                break;
            case "shareholderEdit":
                pageElement = e(ShareholderFormPage, {
                    navigate,
                    mode: "edit",
                    shareholderId: route.id,
                });
                break;
            case "shareholderDetail":
                pageElement = e(ShareholderDetailPage, {
                    navigate,
                    shareholderId: route.id,
                });
                break;
            default:
                pageElement = e(NotFoundPage, {path, navigate});
        }

        return e(Layout, {path, navigate}, pageElement);
    }

    // App: Function used by this module.
    function App() {
        return e(
            I18nProvider,
            null,
            e(
                AuthProvider,
                null,
                e(AppInner, null)
            )
        );
    }

    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement);
    root.render(e(App, null));
})();
