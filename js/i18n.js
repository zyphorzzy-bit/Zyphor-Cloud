/* =========================================
   ZYPHOR CLOUD — SISTEMA DE IDIOMAS
   PT-BR • EN-US • ES
========================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "zyphor-language";

    const languages = {
        "pt-BR": {
            name: "Português",
            flag: "🇧🇷",
            translations: {

                "nav.home": "Início",
                "nav.plans": "Planos",
                "nav.support": "Suporte",
                "nav.login": "Entrar",
                "nav.signup": "Criar conta",

                "hero.title": "Hospede seus projetos. Tenha o controle.",
                "hero.description": "Uma plataforma para hospedar, gerenciar e acompanhar seus projetos de forma simples.",
                "hero.login": "Entrar",
                "hero.signup": "Criar conta",

                "resources.title": "Recursos para seus projetos",
                "resources.description": "Tenha as ferramentas necessárias para gerenciar seus projetos.",

                "projects.title": "O que você pode hospedar",
                "projects.bots": "Bots",
                "projects.sites": "Sites",
                "projects.apps": "Aplicações",

                "cta.title": "Pronto para começar?",
                "cta.description": "Crie sua conta e comece a gerenciar seus projetos.",

                "footer.platforms": "Plataformas",
                "footer.terms": "Termos",
                "footer.privacy": "Privacidade",
                "footer.acceptable": "Uso aceitável",
                "footer.rights": "Todos os direitos reservados."
            }
        },

        "en-US": {
            name: "English",
            flag: "🇺🇸",
            translations: {

                "nav.home": "Home",
                "nav.plans": "Plans",
                "nav.support": "Support",
                "nav.login": "Login",
                "nav.signup": "Create account",

                "hero.title": "Host your projects. Stay in control.",
                "hero.description": "A platform to host, manage and monitor your projects with ease.",
                "hero.login": "Login",
                "hero.signup": "Create account",

                "resources.title": "Resources for your projects",
                "resources.description": "Get the tools you need to manage your projects.",

                "projects.title": "What you can host",
                "projects.bots": "Bots",
                "projects.sites": "Websites",
                "projects.apps": "Applications",

                "cta.title": "Ready to get started?",
                "cta.description": "Create your account and start managing your projects.",

                "footer.platforms": "Platforms",
                "footer.terms": "Terms",
                "footer.privacy": "Privacy",
                "footer.acceptable": "Acceptable use",
                "footer.rights": "All rights reserved."
            }
        },

        "es": {
            name: "Español",
            flag: "🇪🇸",
            translations: {

                "nav.home": "Inicio",
                "nav.plans": "Planes",
                "nav.support": "Soporte",
                "nav.login": "Iniciar sesión",
                "nav.signup": "Crear cuenta",

                "hero.title": "Aloja tus proyectos. Ten el control.",
                "hero.description": "Una plataforma para alojar, administrar y supervisar tus proyectos fácilmente.",
                "hero.login": "Iniciar sesión",
                "hero.signup": "Crear cuenta",

                "resources.title": "Recursos para tus proyectos",
                "resources.description": "Obtén las herramientas necesarias para administrar tus proyectos.",

                "projects.title": "Qué puedes alojar",
                "projects.bots": "Bots",
                "projects.sites": "Sitios web",
                "projects.apps": "Aplicaciones",

                "cta.title": "¿Listo para comenzar?",
                "cta.description": "Crea tu cuenta y empieza a administrar tus proyectos.",

                "footer.platforms": "Plataformas",
                "footer.terms": "Términos",
                "footer.privacy": "Privacidad",
                "footer.acceptable": "Uso aceptable",
                "footer.rights": "Todos los derechos reservados."
            }
        }
    };


    /* =========================================
       IDIOMA ATUAL
    ========================================= */

    function getLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved && languages[saved]) {
            return saved;
        }

        return "pt-BR";
    }


    /* =========================================
       TRADUÇÃO
    ========================================= */

    function translatePage(language) {

        const selectedLanguage = languages[language];

        if (!selectedLanguage) {
            return;
        }

        document.documentElement.lang = language;

        const elements = document.querySelectorAll("[data-i18n]");

        elements.forEach(function (element) {

            const key = element.getAttribute("data-i18n");

            const translation =
                selectedLanguage.translations[key];

            if (translation) {
                element.textContent = translation;
            }

        });

        updateLanguageButton(selectedLanguage);
    }


    /* =========================================
       BOTÃO DO IDIOMA
    ========================================= */

    function updateLanguageButton(language) {

        const buttons =
            document.querySelectorAll(".language-btn");

        buttons.forEach(function (button) {

            button.textContent =
                language.flag + " " +
                language.name;

        });
    }


    /* =========================================
       SELEÇÃO DE IDIOMA
    ========================================= */

    function setLanguage(language) {

        if (!languages[language]) {
            return;
        }

        localStorage.setItem(
            STORAGE_KEY,
            language
        );

        translatePage(language);

        closeLanguageMenu();
    }


    /* =========================================
       MENU
    ========================================= */

    function closeLanguageMenu() {

        document
            .querySelectorAll(".language-menu")
            .forEach(function (menu) {

                menu.classList.remove("active");

            });
    }


    function setupLanguageSelector() {

        const buttons =
            document.querySelectorAll(".language-btn");

        const menus =
            document.querySelectorAll(".language-menu");


        buttons.forEach(function (button) {

            button.addEventListener("click", function (event) {

                event.stopPropagation();

                const selector =
                    button.closest(".language-selector");

                if (!selector) {
                    return;
                }

                const menu =
                    selector.querySelector(".language-menu");

                if (!menu) {
                    return;
                }

                menu.classList.toggle("active");

            });

        });


        menus.forEach(function (menu) {

            const options =
                menu.querySelectorAll("[data-lang]");

            options.forEach(function (option) {

                option.addEventListener("click", function () {

                    const language =
                        option.getAttribute("data-lang");

                    setLanguage(language);

                });

            });

        });


        document.addEventListener("click", function () {
            closeLanguageMenu();
        });

    }


    /* =========================================
       INICIALIZAÇÃO
    ========================================= */

    function init() {

        const language = getLanguage();

        translatePage(language);

        setupLanguageSelector();

    }


    /* =========================================
       API GLOBAL
    ========================================= */

    window.ZyphorI18n = {
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        translatePage: translatePage,
        languages: languages
    };


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();
