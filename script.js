const THEME_STORAGE_KEY = "henderlab-theme";
const COMFORT_STORAGE_KEY = "henderlab-comfort-mode";

class ThemeService {
    constructor() {
        this.root = document.documentElement;
        this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        this.toggleButton = null;
        this.toggleLabel = null;
        this.currentTheme = this.getInitialTheme();

        this.applyTheme(this.currentTheme);
        this.watchSystemTheme();
    }

    isValidTheme(theme) {
        return theme === "light" || theme === "dark";
    }

    getStoredTheme() {
        try {
            const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
            return this.isValidTheme(storedTheme) ? storedTheme : null;
        } catch {
            return null;
        }
    }

    saveTheme(theme) {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            return;
        }
    }

    getSystemTheme() {
        return this.mediaQuery.matches ? "dark" : "light";
    }

    getInitialTheme() {
        return this.getStoredTheme() || this.getSystemTheme();
    }

    applyTheme(theme, shouldPersist = false) {
        const nextTheme = this.isValidTheme(theme) ? theme : "light";

        this.currentTheme = nextTheme;
        this.root.setAttribute("data-theme", nextTheme);
        this.root.style.colorScheme = nextTheme;

        if (shouldPersist) {
            this.saveTheme(nextTheme);
        }

        this.syncToggle();
    }

    toggleTheme() {
        const nextTheme = this.currentTheme === "dark" ? "light" : "dark";
        this.applyTheme(nextTheme, true);
    }

    watchSystemTheme() {
        const updateFromSystem = (event) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(event.matches ? "dark" : "light");
            }
        };

        if (typeof this.mediaQuery.addEventListener === "function") {
            this.mediaQuery.addEventListener("change", updateFromSystem);
            return;
        }

        if (typeof this.mediaQuery.addListener === "function") {
            this.mediaQuery.addListener(updateFromSystem);
        }
    }

    mountToggle() {
        const navbarContainer = document.querySelector(".navbar-container");

        if (!navbarContainer) {
            return;
        }

        this.toggleButton = document.querySelector("[data-theme-toggle]");

        if (!this.toggleButton) {
            this.toggleButton = document.createElement("button");
            this.toggleButton.type = "button";
            this.toggleButton.className = "theme-toggle";
            this.toggleButton.dataset.themeToggle = "";
            this.toggleButton.innerHTML = `
                <span class="theme-toggle-track" aria-hidden="true">
                    <span class="theme-toggle-thumb"></span>
                </span>
                <span class="theme-toggle-label" data-theme-toggle-label></span>
            `;

            const hamburgerButton = document.getElementById("hamburger");
            navbarContainer.insertBefore(this.toggleButton, hamburgerButton);
        }

        this.toggleLabel = this.toggleButton.querySelector("[data-theme-toggle-label]");
        this.toggleButton.addEventListener("click", () => this.toggleTheme());
        this.syncToggle();
    }

    syncToggle() {
        if (!this.toggleButton) {
            return;
        }

        const isDark = this.currentTheme === "dark";
        const nextThemeLabel = isDark ? "claro" : "escuro";

        this.toggleButton.setAttribute("aria-pressed", String(isDark));
        this.toggleButton.setAttribute("aria-label", `Alternar para tema ${nextThemeLabel}`);
        this.toggleButton.title = `Alternar para tema ${nextThemeLabel}`;

        if (this.toggleLabel) {
            this.toggleLabel.textContent = isDark ? "Claro" : "Escuro";
        }
    }
}

const themeService = new ThemeService();

class ComfortService {
    constructor() {
        this.root = document.documentElement;
        this.toggleButton = null;
        this.isEnabled = this.getStoredPreference();

        this.applyComfort(this.isEnabled);
    }

    getStoredPreference() {
        try {
            return window.localStorage.getItem(COMFORT_STORAGE_KEY) === "on";
        } catch {
            return false;
        }
    }

    savePreference(isEnabled) {
        try {
            window.localStorage.setItem(COMFORT_STORAGE_KEY, isEnabled ? "on" : "off");
        } catch {
            return;
        }
    }

    applyComfort(isEnabled, shouldPersist = false) {
        this.isEnabled = Boolean(isEnabled);
        this.root.setAttribute("data-comfort", this.isEnabled ? "on" : "off");

        if (shouldPersist) {
            this.savePreference(this.isEnabled);
        }

        this.syncToggle();
    }

    toggleComfort() {
        this.applyComfort(!this.isEnabled, true);
    }

    mountToggle() {
        const navbarContainer = document.querySelector(".navbar-container");

        if (!navbarContainer) {
            return;
        }

        this.toggleButton = document.querySelector("[data-comfort-toggle]");

        if (!this.toggleButton) {
            this.toggleButton = document.createElement("button");
            this.toggleButton.type = "button";
            this.toggleButton.className = "comfort-toggle";
            this.toggleButton.dataset.comfortToggle = "";
            this.toggleButton.innerHTML = `
                <span class="comfort-toggle-track" aria-hidden="true">
                    <span class="comfort-toggle-thumb"></span>
                </span>
                <span class="comfort-toggle-label">Conforto</span>
            `;

            const hamburgerButton = document.getElementById("hamburger");
            navbarContainer.insertBefore(this.toggleButton, hamburgerButton);
        }

        this.toggleButton.addEventListener("click", () => this.toggleComfort());
        this.syncToggle();
    }

    syncToggle() {
        if (!this.toggleButton) {
            return;
        }

        const nextActionLabel = this.isEnabled ? "Desativar" : "Ativar";

        this.toggleButton.setAttribute("aria-pressed", String(this.isEnabled));
        this.toggleButton.setAttribute("aria-label", `${nextActionLabel} modo conforto`);
        this.toggleButton.title = `${nextActionLabel} modo conforto`;
    }
}

const comfortService = new ComfortService();

const navbar = document.querySelector(".navbar");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const siteArticles = Array.isArray(window.siteArticles) ? [...window.siteArticles] : [];

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        const expanded = hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", String(expanded));
    });

    document.querySelectorAll(".nav-menu a").forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        });
    });
}

function sortArticlesByDate(articles) {
    return [...articles].sort((current, next) => {
        const currentTimestamp = Date.parse(current.date || "");
        const nextTimestamp = Date.parse(next.date || "");
        return nextTimestamp - currentTimestamp;
    });
}

function formatArticleDate(date) {
    const parsedDate = Date.parse(date || "");

    if (Number.isNaN(parsedDate)) {
        return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(new Date(parsedDate));
}

function renderRecentArticles() {
    const recentArticlesContainer = document.querySelector("[data-recent-articles]");

    if (!recentArticlesContainer) {
        return;
    }

    const latestArticles = sortArticlesByDate(siteArticles).slice(0, 3);

    if (!latestArticles.length) {
        recentArticlesContainer.innerHTML = '<p class="hero-recent-empty">Nenhum artigo publicado ainda.</p>';
        return;
    }

    recentArticlesContainer.innerHTML = latestArticles
        .map((article) => {
            const publishedDate = formatArticleDate(article.date);

            return `
                <article class="hero-recent-item">
                    <a class="hero-recent-link" href="${article.url}">${article.title}</a>
                    <p class="hero-recent-meta">${publishedDate}</p>
                </article>
            `;
        })
        .join("");
}

function renderArticlesList() {
    const articlesListContainer = document.querySelector("[data-articles-list]");

    if (!articlesListContainer) {
        return;
    }

    const orderedArticles = sortArticlesByDate(siteArticles);

    if (!orderedArticles.length) {
        articlesListContainer.innerHTML = '<p class="hero-recent-empty">Nenhum artigo publicado ainda.</p>';
        return;
    }

    articlesListContainer.innerHTML = orderedArticles
        .map((article) => {
            const publishedDate = formatArticleDate(article.date);
            const coverImage = article.coverImage || "logo.png";
            const excerpt = article.excerpt || "Sem resumo cadastrado.";

            return `
                <a class="article-card article-card-link" href="${article.url}">
                    <div class="article-image" style="background-image: url('${coverImage}');"></div>
                    <div class="article-content">
                        <p class="article-date">${publishedDate}</p>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-excerpt">${excerpt}</p>
                        <span class="read-more">Ler artigo</span>
                    </div>
                </a>
            `;
        })
        .join("");
}

function updateArticleCount() {
    const articleCount = siteArticles.length;
    const countElement = document.querySelector("[data-article-count]");
    const countLabelElement = document.querySelector("[data-article-count-label]");

    if (countElement) {
        countElement.textContent = String(articleCount).padStart(2, "0");
    }

    if (countLabelElement) {
        countLabelElement.textContent = articleCount === 1 ? "artigo publicado" : "artigos publicados";
    }
}

function setupHeroLogoReplay() {
    const hero = document.querySelector(".hero-home");

    if (!hero) {
        return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animatedElements = document.querySelectorAll(
        ".hero-home .hero-logo-mark, .hero-home .hero-logo-mark > path, .hero-home .hero-title, .hero-home .hero-brand-copy, .start-path-card"
    );
    let hasScrolledAway = false;
    let frameId = 0;

    const getAwayOffset = () => Math.min(260, Math.max(130, hero.offsetHeight * 0.32));

    const restartHeroAnimation = () => {
        animatedElements.forEach((element) => {
            element.style.animation = "none";
        });

        void hero.offsetWidth;

        animatedElements.forEach((element) => {
            element.style.animation = "";
        });
    };

    const syncHeroLogoState = () => {
        frameId = 0;

        if (motionQuery.matches) {
            hasScrolledAway = false;
            hero.classList.remove("hero-logo-away");
            return;
        }

        if (window.scrollY > getAwayOffset()) {
            hasScrolledAway = true;
            hero.classList.add("hero-logo-away");
            return;
        }

        if (hasScrolledAway && window.scrollY <= 24) {
            hasScrolledAway = false;
            hero.classList.remove("hero-logo-away");
            restartHeroAnimation();
            return;
        }

        if (!hasScrolledAway) {
            hero.classList.remove("hero-logo-away");
        }
    };

    const requestSync = () => {
        if (frameId) {
            return;
        }

        frameId = window.requestAnimationFrame(syncHeroLogoState);
    };

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", requestSync);
    } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(requestSync);
    }

    syncHeroLogoState();
}

renderRecentArticles();
renderArticlesList();
updateArticleCount();
setupHeroLogoReplay();
themeService.mountToggle();
comfortService.mountToggle();

window.addEventListener("scroll", () => {
    if (navbar) {
        navbar.classList.toggle("is-scrolled", window.scrollY > 24);
    }
});
