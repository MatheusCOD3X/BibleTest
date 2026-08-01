# Sugestões de Nomenclatura & Branding

## 📌 Contexto
O projeto é uma **aplicação frontend standalone** (Progressive Web App) sem backend incluso. É importante deixar isso claro em toda documentação, naming, e comunicação.

---

## 🎯 Opções de nomenclatura

### Opção 1: **Bible Tracker Frontend PWA** (Recomendado)
```
https://github.com/usuario/bible-tracker-frontend-pwa
Diretório raiz: bible-tracker-frontend/
```
**Vantagens:**
- Deixa explícito que é **frontend** (separate from backend/BFF)
- PWA é termo técnico claro (offline-first, installable)
- Simples e profissional

### Opção 2: **Bible Tracker Web App**
```
https://github.com/usuario/bible-tracker-web-app
Diretório raiz: bible-tracker-web/
```
**Vantagens:**
- "Web App" é genérico e familiar
- Menos técnico que PWA

**Desvantagens:**
- Menos específico (poderia ser qual backend?)

### Opção 3: **Bible Tracker Client** / **Bible Tracker UI**
```
https://github.com/usuario/bible-tracker-client
Diretório raiz: bible-tracker-client/
```
**Vantagens:**
- "Client" deixa claro que não é o servidor
- Comum em arquiteturas cliente-servidor

**Desvantagens:**
- Implica que há um servidor em outro lugar (pode não ser verdade por enquanto)

---

## 📚 Sugestões aplicadas neste projeto

### Nome oficial
**Bible Tracker Frontend PWA** (v0.6.0)

### Nomenclatura interna de pastas/referências

#### Atual → Proposto

| Contexto | Atual | Proposto | Motivo |
|----------|-------|----------|--------|
| Descrição em package.json | (vazio) | "description": "Progressive Web App for Bible reading progress tracking" | Deixar claro que é PWA |
| README título | (N/A) | "# Bible Tracker Frontend PWA" | Clareza imediata |
| Documentação | "ARCHITECTURE.md" | "ARCHITECTURE.md" (já feito ✅) | Descreve aplicação frontend |
| Referência a "backend" | N/A | Usar "BFF (Backend for Frontend)" ou "API Server" | Deixar claro que é separado e opcional |
| Service Worker | "ngsw-config.json" | Manter (está ok) | Padrão Angular |
| Integração futura | (não implementada) | "**Futura integração com BibleContentService**" | Deixar explícito que é acréscimo |

### Como referenciar em documentação

#### ❌ Evitar
```markdown
- O backend busca os versículos bíblicos
- A API salva o progresso do usuário
- Sincronize seus dados com o servidor
```

#### ✅ Usar
```markdown
- **[Futuro]** Uma API de conteúdo bíblico fornecerá múltiplas versões
- O progresso é salvo localmente no navegador (localStorage/IndexedDB)
- **[Futuro]** Sincronize entre dispositivos (requer BFF)
```

#### 📝 Exemplo de parágrafo bem redigido
```markdown
## Arquitetura

Bible Tracker Frontend PWA é uma aplicação **100% cliente** (rodando no navegador) 
que armazena progresso de leitura localmente. 

**Atualmente**: Sem backend — os dados ficam no seu dispositivo (localStorage).

**[Planejado]**: Integração com BibleContentService (API pública ou customizada) 
para suportar múltiplas versões bíblicas (protestante, católica, etc.) e 
sincronização entre dispositivos.
```

---

## 🏷️ Tags/Labels para issues/PRs

Ao abrir issues ou PRs no GitHub, sugerir labels como:

- `frontend` — relativo à UI/UX
- `performance` — otimizações
- `i18n` — idiomas/tradução
- `pwa` — offline/service-worker/manifest
- `architecture` — refactoring/design
- `future:bible-content-api` — para tasks sobre integração de conteúdo bíblico
- `future:backend` — para tasks sobre BFF/sincronização

---

## 📄 Referência rápida para documentação

### Em README.md
```markdown
# Bible Tracker Frontend PWA

A progressive web app (PWA) for tracking Bible reading progress.
**Frontend-only application** (no backend required — data stored locally).

## Features
- ✅ Offline-first (works without internet)
- ✅ Installable on mobile/desktop
- ✅ Multiple languages (PT-BR, EN, ES)
- ⏳ [Future] Support for multiple Bible versions via API

## Setup
1. Clone: `git clone https://github.com/.../bible-tracker-frontend-pwa`
2. Install: `cd bible-tracker && npm install`
3. Serve: `npm start`
```

### Em CONTRIBUTING.md
```markdown
# Contribuindo para Bible Tracker Frontend PWA

Este é um projeto **frontend-only** (PWA). 
Mudanças de backend/API são **fora do escopo** — abra uma issue para discutir.

## Branches principais
- `main` — produção (stable)
- `develop` — development branch

## PR Process
1. Checkout `develop`
2. Criar feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Abrir PR contra `develop`
```

### Em CHANGELOG.md / Release Notes
```markdown
## [0.6.0] - 2026-07-31

### Added
- ✨ **History Screen** — full reading log with search, sort, filter
- 📊 **Charts & Statistics** — progress, monthly trends, per-book breakdown (ng2-charts)
- ⚡ **Performance** — OnPush change detection (all components), virtual scroll (books, history, chapters)
- 🎨 **Material Components** — MatTabs, MatMenu, MatTooltip, MatBadge, MatExpansion, MatAutocomplete

### Changed
- Version bumped: 0.5.1 → 0.6.0 (minor release)

### Docs
- Added ARCHITECTURE.md (frontend structure)
- Added ARCHITECTURE_DIAGRAM.md (Mermaid diagram)
- Clarified PWA-only scope (no backend in this repo)

---

## [0.5.0] - 2026-07-15
### Added
- Full i18n (PT-BR, EN, ES) with runtime language switching
- ...
```

---

## 🎨 Visual branding suggestions

### Logo/badge
Consider adding to README:
```markdown
![Bible Tracker Frontend PWA](https://img.shields.io/badge/Bible%20Tracker-Frontend%20PWA-blue?style=flat-square&logo=angular&logoColor=white)
```

### Deployment badge (if deployed)
```markdown
[![Deploy to Production](https://github.com/.../actions/workflows/deploy.yml/badge.svg)](...)
[![Built with Angular](https://img.shields.io/badge/Built%20with-Angular%2019-red?logo=angular&logoColor=white)](...)
```

---

## 📋 Checklist de update necessários

Para refletir a nomenclatura "Frontend PWA":

- [ ] Atualizar `package.json` → `"description": "Progressive Web App for Bible reading progress tracking"`
- [ ] Atualizar `README.md` → adicionar "Frontend PWA" no título
- [ ] Atualizar comentários em `app.component.ts` → referenciar "PWA" e "frontend-only"
- [ ] Atualizar `ngsw-config.json` comment → "Service Worker (PWA offline strategy)"
- [ ] Criar/atualizar `CONTRIBUTING.md` → deixar claro que é frontend-only
- [ ] Criar/atualizar `CHANGELOG.md` → incluir link para ARCHITECTURE.md
- [ ] Considerar renomear diretório raiz de `bible-tracker/` para `bible-tracker-frontend/` (opcional, breaking change)

---

## 🚀 Próximas decisões

1. **Nome definitivo**: Bible Tracker Frontend PWA ← **Recomendado**
2. **Renomear diretório raiz?** (bible-tracker → bible-tracker-frontend) ← Opcional
3. **Quando integrar conteúdo bíblico?** ← Aguardando sua decisão (não limitar arquitetura)
4. **BFF/Backend em repo separado?** ← A decidir

---

**Data de atualização**: 2026-07-31  
**Alinhado com**: Bible Tracker v0.6.0
