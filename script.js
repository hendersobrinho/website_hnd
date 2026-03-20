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

renderRecentArticles();
renderArticlesList();
updateArticleCount();

window.addEventListener("scroll", () => {
    if (navbar) {
        navbar.classList.toggle("is-scrolled", window.scrollY > 24);
    }
});
