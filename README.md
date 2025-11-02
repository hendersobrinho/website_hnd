# HND LAB

![HND LAB](banner.png)

Laboratório de inovação e tecnologia com artigos sobre ciência da computação, programação e análises técnicas.

## 🚀 Sobre

O HND LAB é uma plataforma dedicada a compartilhar conhecimento técnico através de artigos detalhados e análises aprofundadas sobre tecnologia.

## 📚 Conteúdo

- **Artigos Técnicos**: Explicações detalhadas sobre conceitos complexos
- **Tutoriais**: Guias práticos e aplicáveis
- **Análises**: Estudos de tecnologias e tendências

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Schema.org (SEO)

## 📁 Estrutura do Projeto

```
website_hnd-main/
├── 📂 DESENVOLVIMENTO (raiz - edite aqui)
│   ├── *.html              # Arquivos HTML
│   ├── style.css           # CSS não minificado
│   ├── script.js           # JS não minificado
│   ├── build-dist.sh       # Script build (Linux/Mac)
│   ├── build-dist.ps1      # Script build (Windows)
│   └── ...
│
├── 📂 dist/ (PRODUÇÃO - publicado no GitHub Pages) ⭐
│   ├── *.html              # HTMLs otimizados
│   ├── style.min.css       # CSS minificado
│   ├── script.min.js       # JS minificado
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── logo.png, banner.png, menu.png
│   ├── artigos/
│   └── assets/
│
└── 📂 Documentação
    ├── README.md
    ├── BUILD-DIST.md       # ⭐ Guia da pasta dist/
    ├── DEPLOY.md
    └── ...
```

## 🏗️ Build para Produção

Este projeto usa a pasta **dist/** para produção.

### Gerar pasta dist/:

```bash
# Linux/Mac/Git Bash
./build-dist.sh

# Windows PowerShell
.\build-dist.ps1
```

O script cria a pasta `dist/` com todos os arquivos otimizados!

📖 **Leia mais**: [BUILD-DIST.md](BUILD-DIST.md)

## 🌐 Deploy

Este site está configurado para ser hospedado no GitHub Pages usando a pasta **dist/**.

### Passos para publicar:

1. Execute o build: `./build-dist.sh`
2. Commit: `git add . && git commit -m "Build dist/"`
3. Push: `git push`
4. Configure GitHub Pages:
   - Settings > Pages
   - Source: Branch `main`
   - Folder: **`/dist`** ⬅️ IMPORTANTE!
5. Site disponível em: `https://seu-usuario.github.io/nome-repo/`

### Configurar domínio personalizado:

1. Adicione um arquivo `CNAME` com seu domínio
2. Configure os DNS no seu provedor:
   ```
   Type: A
   Host: @
   Value: 185.199.108.153

   Type: CNAME
   Host: www
   Value: seu-usuario.github.io
   ```

## 🔍 SEO

O site está otimizado para SEO com:

- ✅ Meta tags completas (description, keywords, author)
- ✅ Open Graph e Twitter Cards
- ✅ Schema.org JSON-LD
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ URLs canônicas
- ✅ Alt text em imagens
- ✅ Estrutura semântica HTML5

### Submeter ao Google:

Após o deploy, submeta o sitemap no [Google Search Console](https://search.google.com/search-console):
```
https://seu-dominio.com/sitemap.xml
```

## 📱 Responsividade

O site é totalmente responsivo com breakpoints para:

- 📱 Mobile: ≤ 480px
- 📱 Tablet: ≤ 768px
- 💻 Desktop: ≤ 1024px
- 🖥️ Large Desktop: > 1024px

## ⚡ Performance

- JavaScript minificado para produção
- Lazy loading de imagens
- CSS otimizado
- Código semântico e limpo

## 📝 Licença

© 2025 HND LAB. Todos os direitos reservados.

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas através de issues.

## 📧 Contato

Para mais informações, visite: [hndlab.com]([https://hndlab.com](https://hndlab.dev.br/))

---

Desenvolvido com dedicação pela equipe HND LAB
