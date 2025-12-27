// public/js/i18n.js
(function () {
  "use strict";

  const e = React.createElement;
  const { createContext, useContext, useState, useEffect } = React;

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

      "shareholderType.PERSON": "Person",
      "shareholderType.COMPANY": "Company",
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
      "notFound.goHome": "Przejdź do strony startowej",

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

      "shareholderType.PERSON": "Osoba fizyczna",
      "shareholderType.COMPANY": "Spółka",
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
    } catch (err) {}
    return "en";
  })();

  function I18nProvider(props) {
    const [lang, setLang] = useState(DEFAULT_LANG);

    useEffect(
      function () {
        try {
          localStorage.setItem("lang", lang);
        } catch (err) {}
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

    return e(I18nContext.Provider, { value }, props.children);
  }

  function useI18n() {
    return useContext(I18nContext);
  }

  window.I18nProvider = I18nProvider;
  window.useI18n = useI18n;
})();
