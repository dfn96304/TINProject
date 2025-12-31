// public/js/i18n.js
(function () {
    "use strict";

    const e = React.createElement;
    const {createContext, useContext, useState, useEffect} = React;

    const I18nContext = createContext(null);

    const TRANSLATIONS = {
        en: {
            "app.title": "Company Structure Analyzer",

            "nav.home": "Home",
            "nav.companies": "Companies",
            "nav.shareholders": "Shareholders",

            "lang.label": "Language:",

            "home.title": "Company Structure Analyzer",
            "home.intro": "Use this app to analyse company ownership structures.",
            "home.cta": "Start by viewing the companies or shareholders.",
            "home.cta.companies": "Companies",
            "home.cta.shareholders": "Shareholders",

            "notFound.title": "Page not found",
            "notFound.message": "No route for this address.",
            "notFound.goHome": "Go to home",

            "auth.loginTitle": "Login",
            "auth.registerTitle": "Register",

            "auth.status.guestPrefix": "You are browsing as ",
            "auth.status.guestRole": "Guest",
            "auth.status.guestSuffix": " (limited view).",
            "auth.status.login": "Login",
            "auth.status.register": "Register",
            "auth.status.loggedInPrefix": "Logged in as ",
            "auth.status.loggedInRoleLabel": "role",

            "common.or": "or",

            "role.GUEST": "Guest",
            "role.VIEWER": "Viewer",
            "role.ANALYST": "Analyst",

            "companies.listTitle": "Companies",
            "companies.detailTitle": "Company details",
            "companies.form.createTitle": "Add company",
            "companies.form.editTitle": "Edit company",

            "companyType.SP_ZOO": "Limited liability company (sp. z o.o.)",
            "companyType.SA": "Joint-stock company (S.A.)",

            "shareholders.listTitle": "Shareholders",
            "shareholders.detailTitle": "Shareholder details",
            "shareholders.form.createTitle": "Add shareholder",
            "shareholders.form.editTitle": "Edit shareholder",

            "auth.noAccountYet": "No account yet?",
            "auth.alreadyAccount": "Already have an account?",

            "table.name": "Name",
            "table.type": "Type",
            "table.identifier": "Identifier",
            "table.nip": "NIP",
            "table.founded": "Founded",
            "table.actions": "Actions",
            "table.details": "Details",
            "table.shares": "Shares",
            "table.acquiredAt": "Acquired",
            "table.source": "Source",
            "table.shareholdings": "Shares",
            "table.company": "Company",
            "table.shareholder": "Shareholder",

            "nav.backToList": "Back to list",

            "auth.error.invalidCredentials": "Invalid email or password.",
            "auth.error.loginFailed": "Login failed.",

            "pager.prev": "Prev",
            "pager.next": "Next",
            "pager.page": "Page",
            "pager.of": "of",

            "list.emptyCompanies": "No companies found.",
            "list.emptyShareholders": "No shareholders found.",
            "list.emptyShareholdings": "No shares recorded.",
            "list.emptyHoldings": "No holdings found.",

            "shareholders.lastNameLabel": "Last name",
            "table.lastName": "Last name",

            "common.loading": "Loading...",
            "common.loadingForm": "Loading form...",
            "common.loadingCompanies": "Loading companies...",
            "common.selectPlaceholder": "-- select --",
            "common.yes": "Yes",
            "common.no": "No",
            "common.add": "Add",
            "common.adding": "Adding...",
            "common.saveChanges": "Save changes",
            "common.saving": "Saving...",
            "common.createCompany": "Create company",
            "common.createShareholder": "Create shareholder",
            "common.creating": "Creating...",
            "common.deleteCompany": "Delete company",
            "common.deleting": "Deleting...",

            "form.name": "Name",
            "form.nip": "NIP",
            "form.krs": "KRS",
            "form.foundedFormat": "Founded (YYYY-MM-DD)",
            "form.companyType": "Company type",
            "form.shareCapitalPln": "Share capital (PLN)",
            "form.lastValuationPln": "Last valuation (PLN)",
            "form.restricted": "Restricted",
            "form.identifierOptional": "Identifier (optional)",
            "form.notes": "Notes",

            "companies.field.type": "Type",
            "companies.field.founded": "Founded",
            "companies.field.shareCapital": "Share capital",
            "companies.field.lastValuation": "Last valuation",
            "companies.field.restricted": "Restricted",
            "companies.field.notes": "Notes",
            "companies.field.createdBy": "Created by",

            "shareholders.field.identifier": "Identifier",
            "shareholders.field.notes": "Notes",

            "shareholdings.addTitle": "Add shares",
            "shareholdings.noEditableCompanies": "You have no editable companies.",

            // auth
            "auth.logout": "Logout",
            "auth.loggingIn": "Logging in.",
            "auth.registering": "Registering.",
            "auth.label.displayName": "Display name",
            "auth.label.email": "Email",
            "auth.label.password": "Password",
            "auth.error.emailPasswordRequired": "Email and password are required.",
            "auth.error.displayNameRequired": "Display name is required.",
            "auth.error.emailRequired": "Email is required.",
            "auth.error.passwordMinLength": "Password must be at least 6 characters.",
            "auth.error.registrationFailed": "Registration failed.",

            // common actions (for shareholding delete button etc.)
            "common.delete": "Delete",

            // companies errors + confirm
            "companies.error.loadListFailed": "Failed to load companies.",
            "companies.error.loadFailed": "Failed to load company.",
            "companies.error.notFound": "Company not found.",
            "companies.error.formLoadFailed": "Failed to load form data.",
            "companies.error.saveFailed": "Failed to save company.",
            "companies.error.deleteFailed": "Failed to delete company.",
            "companies.error.onlyAnalyst": "Only ANALYST can modify data.",
            "companies.confirm.delete": "Are you sure you want to delete this company?",

            // shareholders errors
            "shareholders.error.loadListFailed": "Failed to load shareholders.",
            "shareholders.error.loadFailed": "Failed to load shareholder.",
            "shareholders.error.notFound": "Shareholder not found.",
            "shareholders.error.saveFailed": "Failed to save shareholder.",
            "shareholders.error.onlyAnalyst": "Only ANALYST can modify data.",

            // shareholdings (add/delete from shareholder view)
            "shareholdings.error.loadCompaniesFailed": "Failed to load companies.",
            "shareholdings.error.companyRequired": "Company is required.",
            "shareholdings.error.sharesPositive": "Shares must be a positive number.",
            "shareholdings.error.acquiredFormat": "Acquired date must be YYYY-MM-DD.",
            "shareholdings.error.restrictedGuard": "You can only add shareholdings for restricted companies you created.",
            "shareholdings.error.addFailed": "Failed to add shareholding.",
            "shareholdings.error.deleteFailed": "Failed to delete shareholding.",
            "shareholdings.confirm.delete": "Delete this shareholding?",

            // validation
            "validation.nameRequired": "Name is required.",
            "validation.lastNameRequired": "Last name is required.",
            "validation.nipRequired": "NIP is required.",
            "validation.nipDigitsOnly": "NIP must contain digits 0–9 only.",
            "validation.krsDigitsOnly": "KRS must contain digits 0–9 only.",
            "validation.companyTypeRequired": "Company type is required.",
            "validation.shareCapitalPositive": "Share capital must be positive.",
            "validation.foundedFormatOptional": "Founded date must be YYYY-MM-DD if provided.",
            "validation.identifierDigitsOnly": "Identifier must contain digits 0–9 only.",
        },
        pl: {
            "app.title": "Analizator struktury spółek",

            "nav.home": "Start",
            "nav.companies": "Spółki",
            "nav.shareholders": "Udziałowcy",

            "lang.label": "Język:",

            "home.title": "Analizator struktury spółek",
            "home.intro": "Aplikacja do analizy struktur właścicielskich spółek.",
            "home.cta": "Zacznij od przejrzenia spółek lub udziałowców.",
            "home.cta.companies": "Spółki",
            "home.cta.shareholders": "Udziałowcy",

            "notFound.title": "Strona nie znaleziona",
            "notFound.message": "Brak strony dla tego adresu.",
            "notFound.goHome": "Przejdź do strony głównej",

            "auth.loginTitle": "Logowanie",
            "auth.registerTitle": "Rejestracja",

            "auth.status.guestPrefix": "Przeglądasz jako ",
            "auth.status.guestRole": "Gość",
            "auth.status.guestSuffix": " (ograniczony widok).",
            "auth.status.login": "Zaloguj się",
            "auth.status.register": "Zarejestruj się",
            "auth.status.loggedInPrefix": "Zalogowano jako ",
            "auth.status.loggedInRoleLabel": "rola",

            "common.or": "lub",

            "role.GUEST": "Gość",
            "role.VIEWER": "Oglądający",
            "role.ANALYST": "Analityk",

            "companies.listTitle": "Spółki",
            "companies.detailTitle": "Szczegóły spółki",
            "companies.form.createTitle": "Dodaj spółkę",
            "companies.form.editTitle": "Edytuj spółkę",

            "companyType.SP_ZOO": "sp. z o.o.",
            "companyType.SA": "S.A.",

            "shareholders.listTitle": "Udziałowcy",
            "shareholders.detailTitle": "Szczegóły udziałowca",
            "shareholders.form.createTitle": "Dodaj udziałowca",
            "shareholders.form.editTitle": "Edytuj udziałowca",

            "auth.noAccountYet": "Nie posiadasz jeszcze konta?",
            "auth.alreadyAccount": "Posiadasz już konto?",

            "table.name": "Nazwa",
            "table.type": "Typ",
            "table.identifier": "Identyfikator",
            "table.nip": "NIP",
            "table.founded": "Data założenia",
            "table.actions": "Akcje",
            "table.details": "Szczegóły",
            "table.shares": "Udziały",
            "table.acquiredAt": "Data nabycia",
            "table.source": "Źródło",
            "table.shareholdings": "Udziały",
            "table.company": "Spółka",
            "table.shareholder": "Udziałowiec",

            "nav.backToList": "Powrót do listy",

            "auth.error.invalidCredentials": "Nieprawidłowy email lub hasło.",
            "auth.error.loginFailed": "Logowanie nie powiodło się.",

            "pager.prev": "Poprz.",
            "pager.next": "Nast.",
            "pager.page": "Strona",
            "pager.of": "z",

            "list.emptyCompanies": "Brak spółek.",
            "list.emptyShareholders": "Brak udziałowców.",
            "list.emptyShareholdings": "Brak zapisanych udziałów.",
            "list.emptyHoldings": "Brak udziałów.",

            "shareholders.lastNameLabel": "Nazwisko",
            "table.lastName": "Nazwisko",

            "common.loading": "Ładowanie...",
            "common.loadingForm": "Ładowanie formularza...",
            "common.loadingCompanies": "Ładowanie spółek...",
            "common.selectPlaceholder": "-- wybierz --",
            "common.yes": "Tak",
            "common.no": "Nie",
            "common.add": "Dodaj",
            "common.adding": "Dodawanie...",
            "common.saveChanges": "Zapisz zmiany",
            "common.saving": "Zapisywanie...",
            "common.createCompany": "Utwórz spółkę",
            "common.createShareholder": "Utwórz udziałowca",
            "common.creating": "Tworzenie...",
            "common.deleteCompany": "Usuń spółkę",
            "common.deleting": "Usuwanie...",

            "form.name": "Nazwa",
            "form.nip": "NIP",
            "form.krs": "KRS",
            "form.foundedFormat": "Data założenia (YYYY-MM-DD)",
            "form.companyType": "Typ spółki",
            "form.shareCapitalPln": "Kapitał zakładowy (PLN)",
            "form.lastValuationPln": "Ostatnia wycena (PLN)",
            "form.restricted": "Ograniczona",
            "form.identifierOptional": "Identyfikator (opcjonalnie)",
            "form.notes": "Notatki",

            "companies.field.type": "Typ",
            "companies.field.founded": "Data założenia",
            "companies.field.shareCapital": "Kapitał zakładowy",
            "companies.field.lastValuation": "Ostatnia wycena",
            "companies.field.restricted": "Ograniczona",
            "companies.field.notes": "Notatki",
            "companies.field.createdBy": "Utworzono przez",

            "shareholders.field.identifier": "Identyfikator",
            "shareholders.field.notes": "Notatki",

            "shareholdings.addTitle": "Dodaj udziały",
            "shareholdings.noEditableCompanies": "Brak spółek do edycji.",

            // auth
            "auth.logout": "Wyloguj",
            "auth.loggingIn": "Logowanie...",
            "auth.registering": "Rejestracja...",
            "auth.label.displayName": "Nazwa wyświetlana",
            "auth.label.email": "Email",
            "auth.label.password": "Hasło",
            "auth.error.emailPasswordRequired": "Email i hasło są wymagane.",
            "auth.error.displayNameRequired": "Nazwa wyświetlana jest wymagana.",
            "auth.error.emailRequired": "Email jest wymagany.",
            "auth.error.passwordMinLength": "Hasło musi mieć co najmniej 6 znaków.",
            "auth.error.registrationFailed": "Rejestracja nie powiodła się.",

            // common actions
            "common.delete": "Usuń",

            // companies errors + confirm
            "companies.error.loadListFailed": "Nie udało się wczytać spółek.",
            "companies.error.loadFailed": "Nie udało się wczytać spółki.",
            "companies.error.notFound": "Nie znaleziono spółki.",
            "companies.error.formLoadFailed": "Nie udało się wczytać danych formularza.",
            "companies.error.saveFailed": "Nie udało się zapisać spółki.",
            "companies.error.deleteFailed": "Nie udało się usunąć spółki.",
            "companies.error.onlyAnalyst": "Tylko ANALITYK może modyfikować dane.",
            "companies.confirm.delete": "Czy na pewno chcesz usunąć tę spółkę?",

            // shareholders errors
            "shareholders.error.loadListFailed": "Nie udało się wczytać udziałowców.",
            "shareholders.error.loadFailed": "Nie udało się wczytać udziałowca.",
            "shareholders.error.notFound": "Nie znaleziono udziałowca.",
            "shareholders.error.saveFailed": "Nie udało się zapisać udziałowca.",
            "shareholders.error.onlyAnalyst": "Tylko ANALITYK może modyfikować dane.",

            // shareholdings
            "shareholdings.error.loadCompaniesFailed": "Nie udało się wczytać spółek.",
            "shareholdings.error.companyRequired": "Wybierz spółkę.",
            "shareholdings.error.sharesPositive": "Udziały muszą być liczbą dodatnią.",
            "shareholdings.error.acquiredFormat": "Data nabycia musi mieć format YYYY-MM-DD.",
            "shareholdings.error.restrictedGuard": "Możesz dodać udziały tylko dla spółek z ograniczeniem, które utworzyłeś(-aś).",
            "shareholdings.error.addFailed": "Nie udało się dodać udziałów.",
            "shareholdings.error.deleteFailed": "Nie udało się usunąć udziałów.",
            "shareholdings.confirm.delete": "Usunąć ten wpis udziałów?",

            // validation
            "validation.nameRequired": "Nazwa jest wymagana.",
            "validation.lastNameRequired": "Nazwisko jest wymagane.",
            "validation.nipRequired": "NIP jest wymagany.",
            "validation.nipDigitsOnly": "NIP może zawierać tylko cyfry 0–9.",
            "validation.krsDigitsOnly": "KRS może zawierać tylko cyfry 0–9.",
            "validation.companyTypeRequired": "Typ spółki jest wymagany.",
            "validation.shareCapitalPositive": "Kapitał zakładowy musi być dodatni.",
            "validation.foundedFormatOptional": "Jeśli podano, data założenia musi mieć format YYYY-MM-DD.",
            "validation.identifierDigitsOnly": "Identyfikator może zawierać tylko cyfry 0–9."
        },
    };

    function translate(lang, key) {
        const table = TRANSLATIONS[lang] || TRANSLATIONS.en;
        if (table && Object.prototype.hasOwnProperty.call(table, key)) {
            return table[key];
        }
        const fallback = TRANSLATIONS.en;
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) {
            return fallback[key];
        }
        return key;
    }

    const DEFAULT_LANG = (function () {
        try {
            const stored = localStorage.getItem("lang");
            if (stored === "pl" || stored === "en") return stored;
        } catch (err) {
        }
        return "en";
    })();

    function I18nProvider(props) {
        const [lang, setLang] = useState(DEFAULT_LANG);

        useEffect(
            function () {
                try {
                    localStorage.setItem("lang", lang);
                } catch (err) {
                }
            },
            [lang]
        );

        const value = {
            lang,
            setLang,
            t: function (key) {
                return translate(lang, key);
            },
        };

        return e(I18nContext.Provider, {value}, props.children);
    }

    function useI18n() {
        return useContext(I18nContext);
    }

    window.I18nProvider = I18nProvider;
    window.useI18n = useI18n;
})();
