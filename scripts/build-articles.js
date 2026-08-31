const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const { marked } = require("marked");

const rootDir = path.resolve(__dirname, "..");
const postsDir = path.join(rootDir, "posts");
const articlesDir = path.join(rootDir, "artigos");
const articlesDataPath = path.join(rootDir, "articles-data.js");
const siteUrl = "https://www.henderlab.com.br";

marked.setOptions({
    headerIds: false,
    mangle: false
});

function ensureDirectory(directory) {
    fs.mkdirSync(directory, { recursive: true });
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function escapeAttribute(value = "") {
    return escapeHtml(value).replaceAll("'", "&#39;");
}

function isExternalPath(value = "") {
    return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function toArticleRelativePath(value = "") {
    if (!value || isExternalPath(value) || value.startsWith("../")) {
        return value;
    }

    return `../${value}`;
}

function formatDatePtBr(date) {
    const parsedDate = new Date(`${date}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(parsedDate);
}

function normalizeSlug(slug) {
    const normalizedSlug = String(slug || "").trim();

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
        throw new Error(`Slug invalido: "${slug}". Use letras minusculas, numeros e hifens.`);
    }

    return normalizedSlug;
}

function validateFrontmatter(fileName, data) {
    const requiredFields = ["title", "date", "excerpt", "coverImage", "category", "slug"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length) {
        throw new Error(`${fileName}: campos obrigatorios ausentes: ${missingFields.join(", ")}`);
    }

    const parsedDate = new Date(`${data.date}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(`${fileName}: data invalida em date. Use o formato YYYY-MM-DD.`);
    }
}

function toArray(value) {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}

function renderExtraLinks(styles) {
    return toArray(styles)
        .map((href) => `    <link rel="stylesheet" href="${escapeAttribute(toArticleRelativePath(href))}">`)
        .join("\n");
}

function renderExtraScripts(scripts) {
    return toArray(scripts)
        .map((src) => `    <script src="${escapeAttribute(toArticleRelativePath(src))}"></script>`)
        .join("\n");
}

function renderArticlePage(post) {
    const {
        title,
        pageTitle,
        date,
        excerpt,
        category,
        slug,
        description,
        keywords,
        styles,
        scripts
    } = post.data;

    const articleTitle = pageTitle || title;
    const metaDescription = description || excerpt;
    const metaKeywords = Array.isArray(keywords)
        ? keywords.join(", ")
        : keywords || `${title}, ${category}, HenderLab`;
    const extraLinks = renderExtraLinks(styles);
    const extraScripts = renderExtraScripts(scripts);
    const formattedDate = formatDatePtBr(date);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | HenderLab</title>
    <meta name="description" content="${escapeAttribute(metaDescription)}">
    <meta name="keywords" content="${escapeAttribute(metaKeywords)}">
    <meta name="author" content="Henderson">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${siteUrl}/artigos/${escapeAttribute(slug)}">
    <link rel="icon" type="image/svg+xml" href="/assets/branding/henderlabwi.svg">
    <link rel="apple-touch-icon" href="/assets/branding/henderlabwi.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
${extraLinks ? `${extraLinks}\n` : ""}</head>
<body>
    <nav class="navbar">
        <div class="navbar-container">
            <a href="../index.html" class="brand" aria-label="HenderLab">
                <span class="brand-text">HenderLab</span>
            </a>
            <ul class="nav-menu" id="navMenu">
                <li><a href="../index.html">Início</a></li>
                <li><a href="../artigos.html" class="is-active">Artigos</a></li>
                <li><a href="../projetos.html">Projetos</a></li>
                <li>
                    <a href="https://github.com/hendersobrinho" class="nav-icon-link" target="_blank" rel="noopener noreferrer" aria-label="Abrir GitHub de Henderson">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                            <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.87-1.38-3.87-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.18 1.18A11.1 11.1 0 0 1 12 6.09c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
                        </svg>
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <main class="page-main article-main">
        <div class="article-layout">
            <article class="article-page">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="../index.html">Início</a></li>
                        <li><a href="../artigos.html">Artigos</a></li>
                        <li>${escapeHtml(title)}</li>
                    </ol>
                </nav>

                <a href="../artigos.html" class="back-link">Voltar para artigos</a>

                <header class="article-header">
                    <h1>${escapeHtml(articleTitle)}</h1>
                    <div class="article-meta">
                        <time datetime="${escapeAttribute(date)}">${escapeHtml(formattedDate)}</time>
                    </div>
                </header>

                <div class="article-body">
${post.html}
                </div>
            </article>
        </div>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <a href="../index.html" class="brand brand-footer">
                <img src="/assets/branding/henderlabwi.svg" alt="Logo do HenderLab" class="brand-mark">
                <span class="brand-text">HenderLab</span>
            </a>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025-2026 Henderson Pereira. Todos os direitos reservados.</p>
        </div>
    </footer>

    <script src="../script.js"></script>
${extraScripts ? `${extraScripts}\n` : ""}</body>
</html>
`;
}

function readPosts() {
    ensureDirectory(postsDir);

    return fs.readdirSync(postsDir)
        .filter((fileName) => fileName.endsWith(".md"))
        .sort()
        .map((fileName) => {
            const filePath = path.join(postsDir, fileName);
            const rawContent = fs.readFileSync(filePath, "utf8");
            const parsedPost = matter(rawContent);

            validateFrontmatter(fileName, parsedPost.data);

            const slug = normalizeSlug(parsedPost.data.slug);
            const html = marked(parsedPost.content.trim()).trim();

            return {
                fileName,
                data: {
                    ...parsedPost.data,
                    slug
                },
                html
            };
        })
        .sort((current, next) => new Date(`${next.data.date}T00:00:00Z`) - new Date(`${current.data.date}T00:00:00Z`));
}

function writeArticlePages(posts) {
    ensureDirectory(articlesDir);

    posts.forEach((post) => {
        const outputPath = path.join(articlesDir, `${post.data.slug}.html`);
        fs.writeFileSync(outputPath, renderArticlePage(post), "utf8");
    });
}

function writeArticlesData(posts) {
    const articles = posts.map(({ data }) => ({
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        category: data.category,
        url: `artigos/${data.slug}.html`
    }));

    const output = `/*
 * Arquivo gerado automaticamente por scripts/build-articles.js.
 * Para publicar ou editar artigos, altere os arquivos em posts/ e rode:
 * npm run build:articles
 */
window.siteArticles = ${JSON.stringify(articles, null, 4)};
`;

    fs.writeFileSync(articlesDataPath, output, "utf8");
}

function main() {
    const posts = readPosts();

    writeArticlePages(posts);
    writeArticlesData(posts);

    console.log(`Artigos gerados: ${posts.length}`);
}

main();
