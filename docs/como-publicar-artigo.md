# Como publicar artigo no HenderLab

O HenderLab continua sendo um site estático em HTML, CSS e JavaScript puro. Os artigos são escritos em Markdown dentro de `posts/` e o script gera as páginas em `artigos/` e atualiza `articles-data.js`.

## 1. Criar um novo `.md`

Crie um arquivo em `posts/` com o slug do artigo:

```text
posts/meu-novo-artigo.md
```

## 2. Preencher os campos

Todo post precisa começar com frontmatter:

```md
---
title: "Meu novo artigo"
date: "2026-05-03"
excerpt: "Resumo curto que aparece nos cards."
coverImage: "assets/minha-pasta/capa.png"
category: "Artigo"
slug: "meu-novo-artigo"
---

Texto do artigo em Markdown.
```

Campos obrigatórios:
- `title`: título usado nos cards e no `<title>` da página.
- `date`: data no formato `YYYY-MM-DD`.
- `excerpt`: resumo curto para cards e fallback da lateral do artigo.
- `coverImage`: caminho da capa a partir da raiz do site, por exemplo `assets/meu-artigo/capa.png`.
- `category`: categoria/badge exibida no card.
- `slug`: nome do arquivo gerado em `artigos/{slug}.html`. Use letras minúsculas, números e hífens.

Campos opcionais:
- `pageTitle`: título maior dentro da página, caso queira diferente do card.
- `description`: descrição para SEO.
- `keywords`: lista ou texto de palavras-chave.
- `aside`: texto da lateral “Neste artigo”.
- `styles`: CSS extra da página.
- `scripts`: JavaScript extra da página.

## 3. Onde colocar a imagem

Coloque imagens dentro de `assets/`, de preferência em uma pasta do artigo:

```text
assets/meu-novo-artigo/capa.png
assets/meu-novo-artigo/print-1.png
```

No `coverImage`, use caminho a partir da raiz:

```md
coverImage: "assets/meu-novo-artigo/capa.png"
```

Dentro do texto do artigo, lembre que a página final fica dentro de `artigos/`. Então imagens usadas no corpo podem apontar para `../assets/...`:

```md
![Print do projeto](../assets/meu-novo-artigo/print-1.png)
```

## 4. Qual comando rodar

Na primeira vez, instale as dependências:

```bash
npm install
```

Depois, gere os artigos:

```bash
npm run build:articles
```

O comando atualiza:
- `artigos/{slug}.html`
- `articles-data.js`

## 5. Como testar localmente

Suba um servidor simples na raiz do projeto:

```bash
python3 -m http.server 5500
```

Abra:

```text
http://localhost:5500/artigos.html
```

Confira se o card aparece e se o botão “Ler artigo” abre `artigos/{slug}.html`.

## 6. Como commitar e publicar

Depois de testar:

```bash
git status
git add posts/ artigos/ articles-data.js package.json docs/como-publicar-artigo.md scripts/build-articles.js
git commit -m "Automatiza publicacao de artigos"
git push
```
