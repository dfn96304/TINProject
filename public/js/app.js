// public/js/app.js
(function () {
    "use strict";

    const e = React.createElement;
    const {createRoot} = ReactDOM;
    const {useState, useEffect} = React;

    const I18nProvider = window.I18nProvider;
    const useI18n = window.useI18n;

    const AuthProvider = window.AuthProvider;
    const AuthStatusBar = window.AuthStatusBar;

    const LoginPage = window.LoginPage;
    const RegisterPage = window.RegisterPage;

    const CompanyListPage = window.CompanyListPage;
    const CompanyDetailPage = window.CompanyDetailPage;
    const CompanyFormPage = window.CompanyFormPage;

    const ShareholderListPage = window.ShareholderListPage;
    const ShareholderDetailPage = window.ShareholderDetailPage;
    const ShareholderFormPage = window.ShareholderFormPage;

    function parseHash() {
        var hash = window.location.hash || "#/";
        if (hash.charAt(0) === "#") {
            hash = hash.slice(1);
        }
        if (!hash) return "/";
        if (hash.charAt(0) !== "/") hash = "/" + hash;
        return hash;
    }

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

    function HomePage(props) {
        const {t} = useI18n();

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

    function NotFoundPage(props) {
        const {t} = useI18n();

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

    function Layout(props) {
        const path = props.path;
        const navigate = props.navigate;
        const {t, lang, setLang} = useI18n();

        function link(pathTarget) {
            return function (ev) {
                ev.preventDefault();
                navigate(pathTarget);
            };
        }

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

    function AppInner() {
        const [path, setPath] = useState(parseHash());

        useEffect(function () {
            function handleHashChange() {
                setPath(parseHash());
            }

            window.addEventListener("hashchange", handleHashChange);
            return function () {
                window.removeEventListener("hashchange", handleHashChange);
            };
        }, []);

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
