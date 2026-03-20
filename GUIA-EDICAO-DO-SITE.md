# Guia rapido de edicao visual

Este projeto esta com quase todo o visual centralizado nestes arquivos:

- `style.css`: referencia principal para desenvolvimento local.
- `articles-data.js`: cadastro dos artigos usados na automacao da home e da pagina `artigos.html`.

## Onde editar cada coisa

- Largura padrao das secoes: procure `--container` em `:root`.
- Largura maior da home e da pagina de artigo: procure `--container-wide` em `:root`.
- Altura da navbar: procure `--nav-height` em `:root`.
- Fonte base do site inteiro: procure `body { font-size: ... }`.
- Tamanho do nome `HND LAB` no topo e no rodape: procure `.brand-text`.
- Tamanho dos links do menu: procure `.nav-menu a`.
- Titulo gigante da home: procure `.hero-copy h1`.
- Texto abaixo do titulo da home: procure `.hero-lead`.
- Tamanho e espacamento do card principal da home: procure `.hero-copy`.
- Tamanho da coluna da direita da home: procure `.hero-shell` e veja `grid-template-columns`.
- Titulo do bloco escuro da home: procure `.hero-panel-card h2`.
- Espacamento interno do bloco escuro da home: procure `.hero-panel-card`.
- Titulos das secoes como `Resumo` e `Conteudo disponivel`: procure `.section-heading h2`.
- Cards pequenos da home e da pagina Sobre: procure `.info-card`, `.about-card`, `.info-card h3`.
- Lista de artigos recentes da home: procure `.hero-recent-list`.
- Cards da pagina `artigos.html`: os dados vem de `articles-data.js` e o HTML e montado pelo `script.js`.
- Largura dos cards de artigos na grade: procure `.articles-grid`.
- Altura da imagem dos cards: procure `.article-image` e altere `min-height`.
- Espacamento interno do texto do card: procure `.article-content`.
- Titulo dos cards de artigo: procure `.article-title`.
- Resumo dos cards de artigo: procure `.article-excerpt`.
- Topo das paginas internas (`Artigos` e `Sobre`): procure `.page-hero-shell`, `.page-hero h1` e `.page-hero p`.
- Pagina do artigo completo: procure `.article-layout`, `.article-page`, `.article-header h1`, `.article-body` e `.article-aside`.
- Rodape em colunas: procure `.footer-content`.
- Texto do rodape: procure `.footer-copy` e `.footer h4`.

## O que controla tamanho de container

- `width: min(var(--container), calc(100% - 3.5rem));`
  Esse trecho controla a largura da maioria das secoes centrais.

- `width: min(var(--container-wide), calc(100% - 3.5rem));`
  Esse trecho controla areas mais largas, como a home e a pagina do artigo.

- `padding`
  Aumenta ou diminui o espaco interno do container.

- `min-height`
  Define a altura minima visual de um bloco.

- `grid-template-columns`
  Define quanto cada coluna ocupa dentro de uma grade.

## Mobile e responsividade

No fim do CSS existem 4 blocos importantes:

- `@media (min-width: 1280px)`: ajustes para telas grandes.
- `@media (max-width: 1024px)`: ajustes para tablet e notebook menor.
- `@media (max-width: 768px)`: ajustes principais de celular.
- `@media (max-width: 520px)`: reducao extra de titulos e larguras para celular pequeno.

Se voce mexer em um tamanho e nao enxergar mudanca no celular, quase sempre a resposta esta nesses blocos.

## Dica pratica

Se quiser achar rapido "quem manda" em um texto ou bloco:

1. Abra a pagina HTML correspondente (`index.html`, `artigos.html`, `sobre.html` ou `artigos/audio-digital.html`).
2. Veja a `class` do elemento.
3. Procure essa classe dentro de `style.css`.

Se o que voce quer mudar for titulo, resumo, capa ou link de um artigo, va direto em `articles-data.js`.

Exemplo:

- No card do artigo, o titulo usa a classe `.article-title`.
- Na home, o titulo principal usa `.hero-copy h1`.
- Na pagina de artigo, o texto corrido usa `.article-body`.

## Tamanhos que mais valem testar primeiro

Se voce quer fazer ajustes rapidos sem quebrar o layout, comeca por estes pontos:

- `--container`
- `--container-wide`
- `.hero-copy h1`
- `.hero-lead`
- `.section-heading h2`
- `.article-title`
- `.article-body`
- `.page-hero h1`
- `.article-image`
- `.article-content`
